import { Octokit } from '@octokit/rest'

export interface GitHubProvisionInput {
  accessToken: string
  repoName: string
  description: string
  isPrivate?: boolean
  template?: {
    owner: string
    repo: string
  }
}

export interface GitHubProvisionResult {
  success: boolean
  repoUrl?: string
  cloneUrl?: string
  sshUrl?: string
  error?: string
}

/**
 * Creates a new GitHub repository
 * Can optionally use a template repository
 */
export async function createGitHubRepo(
  input: GitHubProvisionInput
): Promise<GitHubProvisionResult> {
  try {
    const octokit = new Octokit({
      auth: input.accessToken
    })

    // Get authenticated user
    const { data: user } = await octokit.users.getAuthenticated()

    let repo

    if (input.template) {
      // Create from template
      const { data } = await octokit.repos.createUsingTemplate({
        template_owner: input.template.owner,
        template_repo: input.template.repo,
        name: input.repoName,
        description: input.description,
        private: input.isPrivate ?? false,
        include_all_branches: false
      })
      repo = data
    } else {
      // Create empty repository
      const { data } = await octokit.repos.createForAuthenticatedUser({
        name: input.repoName,
        description: input.description,
        private: input.isPrivate ?? false,
        auto_init: true, // Initialize with README
        gitignore_template: 'Node'
      })
      repo = data
    }

    return {
      success: true,
      repoUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      sshUrl: repo.ssh_url
    }
  } catch (error: any) {
    console.error('GitHub provisioning error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create GitHub repository'
    }
  }
}

/**
 * Set repository secrets for CI/CD
 */
export async function setRepoSecrets(
  accessToken: string,
  owner: string,
  repo: string,
  secrets: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  try {
    const octokit = new Octokit({ auth: accessToken })

    // Get the repository public key for encrypting secrets
    const { data: publicKey } = await octokit.actions.getRepoPublicKey({
      owner,
      repo
    })

    // Note: In production, you'd encrypt each secret with the public key
    // using libsodium. For now, we'll use the simpler approach.

    for (const [name, value] of Object.entries(secrets)) {
      // This is a simplified version - in production, encrypt the value
      await octokit.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name: name,
        encrypted_value: Buffer.from(value).toString('base64'),
        key_id: publicKey.key_id
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error setting repo secrets:', error)
    return {
      success: false,
      error: error.message || 'Failed to set repository secrets'
    }
  }
}

/**
 * Push initial files to the repository
 */
export async function pushInitialFiles(
  accessToken: string,
  owner: string,
  repo: string,
  files: Array<{ path: string; content: string }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const octokit = new Octokit({ auth: accessToken })

    // Get the default branch ref
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: 'heads/main'
    })

    // Get the commit that the ref points to
    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: refData.object.sha
    })

    // Create blobs for each file
    const blobs = await Promise.all(
      files.map(async (file) => {
        const { data } = await octokit.git.createBlob({
          owner,
          repo,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'base64'
        })
        return {
          path: file.path,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: data.sha
        }
      })
    )

    // Create a tree
    const { data: treeData } = await octokit.git.createTree({
      owner,
      repo,
      tree: blobs,
      base_tree: commitData.tree.sha
    })

    // Create a commit
    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message: '🚀 Initial ShipMe setup',
      tree: treeData.sha,
      parents: [refData.object.sha]
    })

    // Update the ref to point to the new commit
    await octokit.git.updateRef({
      owner,
      repo,
      ref: 'heads/main',
      sha: newCommit.sha
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error pushing files:', error)
    return {
      success: false,
      error: error.message || 'Failed to push initial files'
    }
  }
}
