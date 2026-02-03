import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

export async function POST(request: Request) {
  try {
    const { service, token, organizationId } = await request.json()

    if (!service || !token) {
      return NextResponse.json({
        valid: false,
        error: 'Service and token are required'
      }, { status: 400 })
    }

    switch (service) {
      case 'github':
        return await validateGitHub(token)
      case 'vercel':
        return await validateVercel(token)
      case 'supabase':
        return await validateSupabase(token, organizationId)
      default:
        return NextResponse.json({
          valid: false,
          error: 'Unknown service'
        }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Token validation error:', error)
    return NextResponse.json({
      valid: false,
      error: error.message || 'Validation failed'
    }, { status: 500 })
  }
}

async function validateGitHub(token: string) {
  try {
    const octokit = new Octokit({ auth: token })
    const { data: user } = await octokit.users.getAuthenticated()

    return NextResponse.json({
      valid: true,
      user: {
        login: user.login,
        name: user.name,
        avatar: user.avatar_url
      }
    })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid GitHub token. Make sure it has the correct scopes (repo, workflow).'
      })
    }
    throw error
  }
}

async function validateVercel(token: string) {
  try {
    const response = await fetch('https://api.vercel.com/v2/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({
          valid: false,
          error: 'Invalid Vercel token. Please generate a new one with Full Account access.'
        })
      }
      throw new Error('Vercel API error')
    }

    const data = await response.json()

    return NextResponse.json({
      valid: true,
      user: {
        username: data.user.username,
        email: data.user.email
      }
    })
  } catch (error) {
    throw error
  }
}

async function validateSupabase(token: string, organizationId?: string) {
  try {
    // First validate the token by getting organizations
    const orgsResponse = await fetch('https://api.supabase.com/v1/organizations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!orgsResponse.ok) {
      if (orgsResponse.status === 401 || orgsResponse.status === 403) {
        return NextResponse.json({
          valid: false,
          error: 'Invalid Supabase token. Please generate a new Access Token from your dashboard.'
        })
      }
      throw new Error('Supabase API error')
    }

    const organizations = await orgsResponse.json()

    // If organizationId is provided, verify it exists
    if (organizationId) {
      const org = organizations.find((o: any) => o.id === organizationId)
      if (!org) {
        return NextResponse.json({
          valid: false,
          error: `Organization "${organizationId}" not found. Available organizations: ${organizations.map((o: any) => o.name).join(', ')}`
        })
      }

      return NextResponse.json({
        valid: true,
        organization: {
          id: org.id,
          name: org.name
        }
      })
    }

    // Return list of organizations if no specific one provided
    return NextResponse.json({
      valid: true,
      organizations: organizations.map((o: any) => ({
        id: o.id,
        name: o.name
      })),
      message: organizations.length === 1
        ? `Found organization: ${organizations[0].name}`
        : `Found ${organizations.length} organizations. Please select one.`
    })
  } catch (error) {
    throw error
  }
}
