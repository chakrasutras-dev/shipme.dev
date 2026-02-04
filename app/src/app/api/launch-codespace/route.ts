import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectName, description, stack } = await request.json()

  // Phase 1: Return placeholder
  // Phase 2: Will actually create Codespace
  return NextResponse.json({
    status: 'pending',
    message: 'Codespace launcher coming in Phase 2',
    projectName,
    description,
    stack,
    nextSteps: 'Template repository creation in progress'
  })
}
