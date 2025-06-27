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

    // Parse query parameters
    const url = request.nextUrl
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100) // Max 100 per page
    const search = url.searchParams.get('search') || ''
    const source = url.searchParams.get('source') || ''
    const format = url.searchParams.get('format') || 'json'
    const sortBy = url.searchParams.get('sortBy') || 'subscribed_at'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('waitlist')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%`)
    }

    // Apply source filter
    if (source) {
      query = query.eq('source', source)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: subscribers, count, error } = await query

    if (error) {
      console.error('Error fetching subscribers:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // Handle CSV export
    if (format === 'csv') {
      const csvData = generateCSV(subscribers || [])
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="subscribers_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    const response = {
      subscribers: subscribers?.map(subscriber => ({
        id: subscriber.id,
        email: subscriber.email,
        firstName: subscriber.first_name,
        subscribedAt: subscriber.subscribed_at,
        convertKitId: subscriber.convertkit_subscriber_id,
        source: subscriber.source,
        createdAt: subscriber.created_at,
        isSynced: !!subscriber.convertkit_subscriber_id
      })) || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: count || 0,
        hasNext,
        hasPrev,
        limit
      },
      filters: {
        search,
        source,
        sortBy,
        sortOrder
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in subscribers API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateCSV(subscribers: any[]): string {
  const headers = [
    'Email',
    'First Name',
    'Subscribed At',
    'Source',
    'ConvertKit ID',
    'Synced',
    'Created At'
  ]

  const csvRows = [
    headers.join(','),
    ...subscribers.map(sub => [
      `"${sub.email}"`,
      `"${sub.first_name || ''}"`,
      `"${sub.subscribed_at}"`,
      `"${sub.source || ''}"`,
      `"${sub.convertkit_subscriber_id || ''}"`,
      `"${sub.convertkit_subscriber_id ? 'Yes' : 'No'}"`,
      `"${sub.created_at}"`
    ].join(','))
  ]

  return csvRows.join('\n')
}

// POST endpoint for bulk operations (future enhancement)
export async function POST(request: NextRequest) {
  try {
    // Validate admin access
    if (!validateAdminAccess(request)) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const { action, subscriberIds } = await request.json()

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    switch (action) {
      case 'export_selected':
        // Export selected subscribers
        const { data: selectedSubscribers, error: exportError } = await supabase
          .from('waitlist')
          .select('*')
          .in('id', subscriberIds)

        if (exportError) {
          return NextResponse.json(
            { error: 'Export failed' },
            { status: 500 }
          )
        }

        const csvData = generateCSV(selectedSubscribers || [])
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="selected_subscribers.csv"',
          },
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in subscribers POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}