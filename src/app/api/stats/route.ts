import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      // Fallback to demo data if Supabase is not configured
      return NextResponse.json({
        totalSignups: 10247,
        growthRate: 12.5,
        lastUpdated: new Date().toISOString(),
        source: 'fallback'
      })
    }

    // Get total signups count
    const { count: totalSignups, error: countError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error fetching total signups:', countError)
      // Fallback to demo data if database fails
      return NextResponse.json({
        totalSignups: 10247,
        growthRate: 12.5,
        lastUpdated: new Date().toISOString(),
        source: 'fallback'
      })
    }

    // Get signups from last week for growth rate calculation
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { count: weeklySignups, error: weeklyError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .gte('subscribed_at', weekAgo.toISOString())

    // Calculate simple growth rate (weekly signups as percentage of total)
    const growthRate = totalSignups && totalSignups > 0 
      ? Math.round(((weeklySignups || 0) / totalSignups) * 100 * 10) / 10
      : 0

    const stats = {
      totalSignups: totalSignups || 0,
      growthRate,
      weeklySignups: weeklySignups || 0,
      lastUpdated: new Date().toISOString(),
      source: 'supabase'
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in GET /api/stats:', error)
    
    // Fallback to demo data if there's an error
    return NextResponse.json({
      totalSignups: 10247,
      growthRate: 12.5,
      lastUpdated: new Date().toISOString(),
      source: 'fallback'
    })
  }
}