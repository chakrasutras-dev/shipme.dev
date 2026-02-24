import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/launch-codespace
 *
 * Generates a GitHub Codespace URL for an existing repo.
 * Provisioning (GitHub repo creation, Supabase, Netlify) is now handled
 * by /api/provision/start and /api/provision/status.
 *
 * Body: { repoId: number } or { repoUrl: string }
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { repoId, repoUrl } = body

  if (!repoId && !repoUrl) {
    return NextResponse.json({ error: 'repoId or repoUrl required' }, { status: 400 })
  }

  let codespaceUrl: string
  if (repoId) {
    codespaceUrl = `https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=${repoId}`
  } else {
    // Extract repo path from URL: https://github.com/user/repo → user/repo
    const repoPath = repoUrl.replace('https://github.com/', '')
    codespaceUrl = `https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=${encodeURIComponent(repoPath)}`
  }

  return NextResponse.json({ codespace_url: codespaceUrl })
}
