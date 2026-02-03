import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { plan_id, stack_type, config } = body

    // DEMO MODE: Skip Supabase for local testing
    const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('demo')

    if (isDemoMode) {
      // Return demo automation
      const demoAutomationId = `demo-${Date.now()}`

      console.log('[DEMO MODE] Automation created:', {
        id: demoAutomationId,
        stack_type,
        config,
      })

      return NextResponse.json({
        success: true,
        automation_id: demoAutomationId,
        status: 'pending',
        demo_mode: true,
        message: 'Demo automation created. Connect real Supabase to persist data.',
      })
    }

    // PRODUCTION MODE: Full Supabase integration
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create automation record
    const { data: automation, error } = await supabase
      .from('automations')
      .insert({
        user_id: user.id,
        plan_id,
        status: 'pending',
        progress_percent: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating automation:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // TODO: Trigger Claude Computer Use automation engine
    // This will be implemented in the automation worker

    return NextResponse.json({
      success: true,
      automation_id: automation.id,
      status: automation.status,
    })
  } catch (error: any) {
    console.error('Automation creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
