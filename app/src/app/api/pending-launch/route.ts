import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// POST: Store pending launch data before OAuth
export async function POST(request: Request) {
  try {
    const launchData = await request.json()

    // Generate a unique token using built-in crypto
    const token = crypto.randomUUID()

    // Store in Supabase
    const supabase = await createClient()
    const { error } = await supabase
      .from('pending_launches')
      .insert({
        token,
        launch_data: launchData,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      })

    if (error) {
      console.error('[PendingLaunch] Failed to store:', error)
      return NextResponse.json({ error: 'Failed to store launch data' }, { status: 500 })
    }

    // Also set the token in a cookie as backup
    const cookieStore = await cookies()
    cookieStore.set('pending_launch_token', token, {
      httpOnly: false, // Needs to be readable by client
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    })

    console.log('[PendingLaunch] Stored with token:', token)
    return NextResponse.json({ success: true, token })
  } catch (err) {
    console.error('[PendingLaunch] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// GET: Retrieve pending launch data after OAuth
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    let token = url.searchParams.get('token')

    // If no token in URL, try cookie
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get('pending_launch_token')?.value || null
    }

    if (!token) {
      console.log('[PendingLaunch] No token found')
      return NextResponse.json({ error: 'No pending launch token' }, { status: 404 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('pending_launches')
      .select('launch_data')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      console.log('[PendingLaunch] Not found or expired:', error)
      return NextResponse.json({ error: 'Launch data not found or expired' }, { status: 404 })
    }

    // Delete the pending launch after retrieval
    await supabase
      .from('pending_launches')
      .delete()
      .eq('token', token)

    // Clear the cookie
    const cookieStore = await cookies()
    cookieStore.delete('pending_launch_token')

    console.log('[PendingLaunch] Retrieved and deleted:', token)
    return NextResponse.json({ success: true, launchData: data.launch_data })
  } catch (err) {
    console.error('[PendingLaunch] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
