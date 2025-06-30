import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const CONVERTKIT_API_SECRET = process.env.CONVERTKIT_API_SECRET
const CONVERTKIT_FORM_ID = process.env.CONVERTKIT_FORM_ID
const CONVERTKIT_SEQUENCE_ID = process.env.CONVERTKIT_SEQUENCE_ID

export async function POST(request: NextRequest) {
  try {
    const { email, firstName } = await request.json()

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
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

    const normalizedEmail = email.toLowerCase()

    let supabaseEntry = null

    // Check if Supabase is configured
    if (supabase) {
      // Check if email already exists in Supabase
      const { data: existingEntry, error: checkError } = await supabase
        .from('waitlist')
        .select('id')
        .eq('email', normalizedEmail)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing email:', checkError)
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        )
      }

      if (existingEntry) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        )
      }

      // Save to Supabase first
      const { data: entry, error: supabaseError } = await supabase
        .from('waitlist')
        .insert([
          {
            email: normalizedEmail,
            first_name: firstName || null,
            source: 'waitlist'
          }
        ])
        .select()
        .single()

      if (supabaseError) {
        console.error('Error saving to Supabase:', supabaseError)
        return NextResponse.json(
          { error: 'Failed to save to database' },
          { status: 500 }
        )
      }

      supabaseEntry = entry
    } else {
      console.warn('Supabase not configured - email collection disabled')
      return NextResponse.json(
        { error: 'Email collection not available' },
        { status: 503 }
      )
    }

    let convertKitSubscriberId = null

    // Subscribe to ConvertKit if credentials are provided
    if (CONVERTKIT_API_SECRET && CONVERTKIT_FORM_ID) {
      try {
        const convertKitResponse = await fetch(
          `https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              api_secret: CONVERTKIT_API_SECRET,
              email: normalizedEmail,
              first_name: firstName || '',
            }),
          }
        )

        const convertKitData = await convertKitResponse.json()

        if (convertKitResponse.ok) {
          convertKitSubscriberId = convertKitData.subscription?.subscriber?.id
          
          // Update Supabase with ConvertKit subscriber ID
          if (convertKitSubscriberId && supabase && supabaseEntry) {
            await supabase
              .from('waitlist')
              .update({ convertkit_subscriber_id: convertKitSubscriberId.toString() })
              .eq('id', supabaseEntry.id)
          }

          // Subscribe to sequence for welcome/verification email
          if (CONVERTKIT_SEQUENCE_ID) {
            try {
              const sequenceResponse = await fetch(
                `https://api.convertkit.com/v3/sequences/${CONVERTKIT_SEQUENCE_ID}/subscribe`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    api_secret: CONVERTKIT_API_SECRET,
                    email: normalizedEmail,
                    first_name: firstName || '',
                  }),
                }
              )

              if (sequenceResponse.ok) {
                console.log(`Successfully subscribed ${normalizedEmail} to welcome sequence`)
              } else {
                const sequenceError = await sequenceResponse.json()
                console.error('ConvertKit Sequence Error:', sequenceError)
                // Don't fail the entire request if sequence fails
              }
            } catch (sequenceError) {
              console.error('ConvertKit sequence subscription error:', sequenceError)
              // Don't fail the entire request if sequence fails
            }
          }
        } else {
          console.error('ConvertKit API Error:', convertKitData)
          // Don't fail the entire request if ConvertKit fails
        }
      } catch (convertKitError) {
        console.error('ConvertKit subscription error:', convertKitError)
        // Don't fail the entire request if ConvertKit fails
      }
    }

    // Get total signups for response
    let count = 0
    if (supabase) {
      const result = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
      count = result.count || 0
    }

    console.log(`New waitlist signup: ${normalizedEmail}`)
    console.log(`Total signups: ${count}`)

    return NextResponse.json(
      { 
        message: 'Successfully added to waitlist',
        totalSignups: count,
        convertKitSynced: !!convertKitSubscriberId
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing waitlist signup:', error)
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
        totalSignups: 0,
        message: 'Waitlist API is running (database not configured)'
      })
    }

    // Get waitlist stats from Supabase
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error fetching waitlist stats:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      totalSignups: count || 0,
      message: 'Waitlist API is running'
    })
  } catch (error) {
    console.error('Error in GET /api/waitlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}