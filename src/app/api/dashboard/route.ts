import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY

function validateAdminAccess(request: NextRequest): boolean {
  if (!ADMIN_SECRET_KEY || ADMIN_SECRET_KEY === 'your_admin_secret_key_here') {
    return false
  }

  // Check query parameter
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret === ADMIN_SECRET_KEY) {
    return true
  }

  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${ADMIN_SECRET_KEY}`) {
    return true
  }

  return false
}

export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    if (!validateAdminAccess(request)) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    // Check if Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Get current date for calculations
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get total subscribers
    const { count: totalSubscribers, error: totalError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('Error fetching total subscribers:', totalError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // Get today's signups
    const { count: todaySignups, error: todayError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .gte('subscribed_at', todayStart.toISOString())

    // Get weekly signups
    const { count: weeklySignups, error: weeklyError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .gte('subscribed_at', weekAgo.toISOString())

    // Get monthly signups
    const { count: monthlySignups, error: monthlyError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .gte('subscribed_at', monthAgo.toISOString())

    // Get ConvertKit sync status
    const { count: convertKitSynced, error: convertKitError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .not('convertkit_subscriber_id', 'is', null)

    // Get feature requests count
    const { count: totalFeatureRequests, error: featureRequestError } = await supabase
      .from('feature_requests')
      .select('*', { count: 'exact', head: true })

    // Get recent signups for activity feed
    const { data: recentSignups, error: recentError } = await supabase
      .from('waitlist')
      .select('email, first_name, subscribed_at, source')
      .order('subscribed_at', { ascending: false })
      .limit(10)

    // Get signups by source
    const { data: sourceData, error: sourceError } = await supabase
      .from('waitlist')
      .select('source')

    // Process source distribution
    const sourceDistribution = sourceData?.reduce((acc: Record<string, number>, item) => {
      const source = item.source || 'unknown'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {}) || {}

    // Calculate growth rate (weekly signups as percentage of total)
    const growthRate = (totalSubscribers || 0) > 0 
      ? Math.round(((weeklySignups || 0) / (totalSubscribers || 1)) * 100 * 10) / 10
      : 0

    // Get daily signups for the last 30 days for chart data
    const { data: dailyData, error: dailyError } = await supabase
      .from('waitlist')
      .select('subscribed_at')
      .gte('subscribed_at', monthAgo.toISOString())
      .order('subscribed_at', { ascending: true })

    // Process daily signups for chart
    const dailySignups = dailyData?.reduce((acc: Record<string, number>, item) => {
      const date = new Date(item.subscribed_at).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {}) || {}

    const dashboardData = {
      stats: {
        totalSubscribers: totalSubscribers || 0,
        todaySignups: todaySignups || 0,
        weeklySignups: weeklySignups || 0,
        monthlySignups: monthlySignups || 0,
        convertKitSynced: convertKitSynced || 0,
        totalFeatureRequests: totalFeatureRequests || 0,
        growthRate,
        syncRate: (totalSubscribers || 0) > 0 ? Math.round((convertKitSynced || 0) / (totalSubscribers || 1) * 100) : 0
      },
      recentActivity: recentSignups?.map(signup => ({
        email: signup.email,
        firstName: signup.first_name,
        subscribedAt: signup.subscribed_at,
        source: signup.source,
        timeAgo: getTimeAgo(new Date(signup.subscribed_at))
      })) || [],
      sourceDistribution,
      dailySignups,
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Error in dashboard API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  return date.toLocaleDateString()
}