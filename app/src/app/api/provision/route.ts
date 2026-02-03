import { NextResponse } from 'next/server'
import { runProvisioning } from '@/lib/provisioning/orchestrator'
import type { ProvisioningInput, ProvisioningStep } from '@/lib/provisioning/types'

export async function POST(request: Request) {
  try {
    const body = await request.json() as ProvisioningInput

    // Validate input
    if (!body.projectName) {
      return NextResponse.json({
        success: false,
        error: 'Project name is required'
      }, { status: 400 })
    }

    if (!body.credentials.github?.accessToken) {
      return NextResponse.json({
        success: false,
        error: 'GitHub access token is required'
      }, { status: 400 })
    }

    // Collect progress updates
    const progressUpdates: ProvisioningStep[] = []

    // Run provisioning
    const result = await runProvisioning(body, (step) => {
      progressUpdates.push({ ...step, timestamp: new Date().toISOString() } as any)
      console.log(`[Provisioning] ${step.name}: ${step.status}`, step.message || '')
    })

    // Important: Clear credentials from memory after provisioning
    // In a real app, you'd want to be even more careful about this
    body.credentials = {} as any

    return NextResponse.json({
      success: result.success,
      resources: result.resources,
      steps: progressUpdates,
      errors: result.errors
    })

  } catch (error: any) {
    console.error('Provisioning error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Provisioning failed'
    }, { status: 500 })
  }
}

// For streaming progress updates (future enhancement)
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url)
//   const provisioningId = searchParams.get('id')
//
//   // Return SSE stream for real-time updates
//   const stream = new ReadableStream({
//     start(controller) {
//       // Subscribe to provisioning updates
//     }
//   })
//
//   return new Response(stream, {
//     headers: {
//       'Content-Type': 'text/event-stream',
//       'Cache-Control': 'no-cache',
//       'Connection': 'keep-alive'
//     }
//   })
// }
