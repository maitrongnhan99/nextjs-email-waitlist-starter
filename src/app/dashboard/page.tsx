'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Mail, 
  MessageSquare, 
  Download,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface DashboardStats {
  totalSubscribers: number
  todaySignups: number
  weeklySignups: number
  monthlySignups: number
  convertKitSynced: number
  totalFeatureRequests: number
  growthRate: number
  syncRate: number
}

interface RecentActivity {
  email: string
  firstName?: string
  subscribedAt: string
  source: string
  timeAgo: string
}

interface DashboardData {
  stats: DashboardStats
  recentActivity: RecentActivity[]
  sourceDistribution: Record<string, number>
  dailySignups: Record<string, number>
  lastUpdated: string
}

interface Subscriber {
  id: string
  email: string
  firstName?: string
  subscribedAt: string
  convertKitId?: string
  source: string
  createdAt: string
  isSynced: boolean
}

interface SubscribersResponse {
  subscribers: Subscriber[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
    limit: number
  }
  filters: {
    search: string
    source: string
    sortBy: string
    sortOrder: string
  }
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const secret = searchParams.get('secret')

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [subscribers, setSubscribers] = useState<SubscribersResponse | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'subscribers'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!secret) {
      router.push('/')
      return
    }

    // Validate access and load dashboard data
    loadDashboardData()
  }, [secret, router])

  useEffect(() => {
    if (isAuthenticated && activeTab === 'subscribers') {
      loadSubscribers()
    }
  }, [isAuthenticated, activeTab, searchTerm, sourceFilter, currentPage])

  const loadDashboardData = async () => {
    try {
      const response = await fetch(`/api/dashboard?secret=${encodeURIComponent(secret || '')}`)
      
      if (response.status === 401) {
        router.push('/')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to load dashboard data')
      }

      const data = await response.json()
      setDashboardData(data)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const loadSubscribers = async () => {
    try {
      const params = new URLSearchParams({
        secret: secret || '',
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        source: sourceFilter
      })

      const response = await fetch(`/api/dashboard/subscribers?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to load subscribers')
      }

      const data = await response.json()
      setSubscribers(data)
    } catch (error) {
      console.error('Error loading subscribers:', error)
    }
  }

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams({
        secret: secret || '',
        format: 'csv',
        search: searchTerm,
        source: sourceFilter
      })

      const response = await fetch(`/api/dashboard/subscribers?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting CSV:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-lime-400" />
          <span className="text-lg">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !dashboardData) {
    return null
  }

  const { stats, recentActivity, sourceDistribution } = dashboardData

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm">
                Last updated: {new Date(dashboardData.lastUpdated).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => loadDashboardData()}
              className="flex items-center gap-2 bg-lime-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-lime-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-lime-400 text-lime-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subscribers'
                  ? 'border-lime-400 text-lime-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Subscribers
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Subscribers</p>
                    <p className="text-3xl font-bold text-white">{stats.totalSubscribers.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-lime-400" />
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Today's Signups</p>
                    <p className="text-3xl font-bold text-white">{stats.todaySignups}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Weekly Growth</p>
                    <p className="text-3xl font-bold text-white">{stats.growthRate}%</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">ConvertKit Sync</p>
                    <p className="text-3xl font-bold text-white">{stats.syncRate}%</p>
                  </div>
                  <Mail className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.slice(0, 8).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
                      <div>
                        <p className="text-white font-medium">{activity.email}</p>
                        <p className="text-gray-400 text-sm">
                          {activity.firstName && `${activity.firstName} • `}
                          Source: {activity.source}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-500 text-sm">{activity.timeAgo}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscribers' && (
          <div className="space-y-6">
            {/* Filters and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by email or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400"
                  />
                </div>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="">All Sources</option>
                  {Object.keys(sourceDistribution).map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 bg-lime-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-lime-300 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {/* Subscribers Table */}
            {subscribers && (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Subscriber
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Source
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Subscribed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {subscribers.subscribers.map((subscriber) => (
                        <tr key={subscriber.id} className="hover:bg-gray-800/30">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white font-medium">{subscriber.email}</p>
                              {subscriber.firstName && (
                                <p className="text-gray-400 text-sm">{subscriber.firstName}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                              {subscriber.source}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(subscriber.subscribedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {subscriber.isSynced ? (
                              <div className="flex items-center gap-1 text-green-400">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs">Synced</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-red-400">
                                <XCircle className="w-4 h-4" />
                                <span className="text-xs">Not Synced</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-800/50 px-6 py-3 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing {((subscribers.pagination.currentPage - 1) * subscribers.pagination.limit) + 1} to{' '}
                    {Math.min(subscribers.pagination.currentPage * subscribers.pagination.limit, subscribers.pagination.totalCount)} of{' '}
                    {subscribers.pagination.totalCount} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!subscribers.pagination.hasPrev}
                      className="px-3 py-1 bg-gray-700 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-400">
                      Page {subscribers.pagination.currentPage} of {subscribers.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!subscribers.pagination.hasNext}
                      className="px-3 py-1 bg-gray-700 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-lime-400" />
          <span className="text-lg">Loading dashboard...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}