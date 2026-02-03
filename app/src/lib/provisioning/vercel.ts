const VERCEL_API_URL = 'https://api.vercel.com'

export interface VercelProvisionInput {
  accessToken: string
  projectName: string
  framework: 'nextjs' | 'vite' | 'remix' | 'astro' | 'other'
  gitRepository: {
    type: 'github'
    repo: string // format: owner/repo
  }
  teamId?: string
  environmentVariables?: Array<{
    key: string
    value: string
    target: ('production' | 'preview' | 'development')[]
  }>
}

export interface VercelProvisionResult {
  success: boolean
  projectId?: string
  projectUrl?: string
  dashboardUrl?: string
  error?: string
}

/**
 * Create a Vercel project linked to a GitHub repository
 */
export async function createVercelProject(
  input: VercelProvisionInput
): Promise<VercelProvisionResult> {
  try {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${input.accessToken}`,
      'Content-Type': 'application/json'
    }

    // Create project
    const createUrl = new URL('/v10/projects', VERCEL_API_URL)
    if (input.teamId) {
      createUrl.searchParams.set('teamId', input.teamId)
    }

    const createResponse = await fetch(createUrl.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: input.projectName,
        framework: input.framework === 'nextjs' ? 'nextjs' : input.framework,
        gitRepository: {
          type: input.gitRepository.type,
          repo: input.gitRepository.repo
        },
        // Enable automatic deployments
        autoExposeSystemEnvs: true
      })
    })

    if (!createResponse.ok) {
      const error = await createResponse.json()
      throw new Error(error.error?.message || 'Failed to create Vercel project')
    }

    const project = await createResponse.json()

    // Set environment variables if provided
    if (input.environmentVariables && input.environmentVariables.length > 0) {
      const envUrl = new URL(`/v10/projects/${project.id}/env`, VERCEL_API_URL)
      if (input.teamId) {
        envUrl.searchParams.set('teamId', input.teamId)
      }

      for (const envVar of input.environmentVariables) {
        await fetch(envUrl.toString(), {
          method: 'POST',
          headers,
          body: JSON.stringify({
            key: envVar.key,
            value: envVar.value,
            target: envVar.target,
            type: 'encrypted'
          })
        })
      }
    }

    return {
      success: true,
      projectId: project.id,
      projectUrl: `https://${input.projectName}.vercel.app`,
      dashboardUrl: `https://vercel.com/${input.teamId || project.accountId}/${input.projectName}`
    }
  } catch (error: any) {
    console.error('Vercel provisioning error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create Vercel project'
    }
  }
}

/**
 * Trigger a deployment for a Vercel project
 */
export async function triggerDeployment(
  accessToken: string,
  projectId: string,
  teamId?: string
): Promise<{ success: boolean; deploymentUrl?: string; error?: string }> {
  try {
    const url = new URL('/v13/deployments', VERCEL_API_URL)
    if (teamId) {
      url.searchParams.set('teamId', teamId)
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: projectId,
        project: projectId,
        target: 'production'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to trigger deployment')
    }

    const deployment = await response.json()

    return {
      success: true,
      deploymentUrl: deployment.url
    }
  } catch (error: any) {
    console.error('Deployment error:', error)
    return {
      success: false,
      error: error.message || 'Failed to trigger deployment'
    }
  }
}

/**
 * Get deployment status
 */
export async function getDeploymentStatus(
  accessToken: string,
  deploymentId: string,
  teamId?: string
): Promise<{ status: string; url?: string; error?: string }> {
  try {
    const url = new URL(`/v13/deployments/${deploymentId}`, VERCEL_API_URL)
    if (teamId) {
      url.searchParams.set('teamId', teamId)
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to get deployment status')
    }

    const deployment = await response.json()

    return {
      status: deployment.readyState, // QUEUED, BUILDING, READY, ERROR
      url: deployment.url
    }
  } catch (error: any) {
    return {
      status: 'ERROR',
      error: error.message
    }
  }
}
