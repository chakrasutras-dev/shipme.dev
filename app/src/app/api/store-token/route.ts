import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 })
    }

    const cookieStore = await cookies()
    cookieStore.set('github_provider_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[StoreToken] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
