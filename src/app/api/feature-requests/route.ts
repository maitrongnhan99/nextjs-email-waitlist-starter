import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, featureRequest } = await request.json()

    // Validate required fields
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!featureRequest || typeof featureRequest !== 'string') {
      return NextResponse.json(
        { error: 'Feature request is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate feature request length
    const trimmedRequest = featureRequest.trim()
    if (trimmedRequest.length < 10) {
      return NextResponse.json(
        { error: 'Feature request must be at least 10 characters long' },
        { status: 400 }
      )
    }

    if (trimmedRequest.length > 1000) {
      return NextResponse.json(
        { error: 'Feature request must be less than 1000 characters' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()

    // Check if Supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured - feature request collection disabled')
      return NextResponse.json(
        { error: 'Feature request collection not available' },
        { status: 503 }
      )
    }

    // Save feature request to Supabase
    const { data: entry, error: supabaseError } = await supabase
      .from('feature_requests')
      .insert([
        {
          email: normalizedEmail,
          feature_request: trimmedRequest
        }
      ])
      .select()
      .single()

    if (supabaseError) {
      console.error('Error saving feature request to Supabase:', supabaseError)
      return NextResponse.json(
        { error: 'Failed to save feature request' },
        { status: 500 }
      )
    }

    console.log(`New feature request from: ${normalizedEmail}`)
    console.log(`Feature request: ${trimmedRequest.substring(0, 100)}...`)

    return NextResponse.json(
      { 
        message: 'Feature request submitted successfully',
        id: entry.id
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing feature request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        totalRequests: 0,
        message: 'Feature requests API is running (database not configured)'
      })
    }

    // Get feature requests count from Supabase
    const { count, error } = await supabase
      .from('feature_requests')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error fetching feature requests stats:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      totalRequests: count || 0,
      message: 'Feature requests API is running'
    })
  } catch (error) {
    console.error('Error in GET /api/feature-requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}