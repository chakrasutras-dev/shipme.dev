# ShipMe v2.0 Implementation Plan (Revised)
**Incremental Deployment Strategy | Same Repo | Phase-by-Phase Migration**
**META: Self-Deployment via MCP Servers ("Eating Our Own Dog Food")**

## Executive Summary

Transform ShipMe v1.0 → v2.0 in the **same repository** with **5 deployable phases**. Each phase is independently tested and deployed to shipme.dev before moving to the next.

**🎯 NEW INSIGHT (Feb 4, 2026):**
**ShipMe should deploy ITSELF using MCP servers and Codespaces** - validating the entire platform approach by using it for its own deployment.

**Key Strategy:**
- ✅ Work in existing repo (no separate template repo initially)
- ✅ Backup v1.0 to `v1.0-archive` branch before starting
- ✅ Remove v1.0 folders progressively as v2.0 features are deployed
- ✅ Each phase deploys to shipme.dev for validation
- ✅ Incremental user-facing changes (no big-bang replacement)
- 🆕 **Use ShipMe's own MCP servers to deploy ShipMe.dev itself**
- 🆕 **User authenticates once in Codespace → MCP servers do the rest**

## Meta-Deployment Architecture ("Dogfooding")

### The Insight

ShipMe helps users deploy apps via MCP servers in Codespaces. ShipMe itself should be deployed the same way - creating a recursive validation of the platform.

### How It Works

```
User: "Deploy ShipMe"
    ↓
Opens ShipMe GitHub Codespace
    ↓
User authenticates once:
  - gh auth login (GitHub)
  - Provides Supabase access token
  - Provides Netlify auth token
    ↓
Claude Code orchestrates via MCP servers:
  - GitHub MCP: Ensure repo configured
  - Supabase MCP: Create project + run migrations
  - Netlify MCP: Deploy site + set env vars
    ↓
ShipMe.dev is LIVE
    ↓
Can now deploy OTHER projects
```

### Benefits

1. **Validates the approach** - If it works for ShipMe, it works for users
2. **Demonstrates the platform** - Best proof of concept
3. **Reduces manual steps** - User authenticates once, automation handles rest
4. **Creates meta-architecture** - ShipMe orchestrates MCP servers
5. **Builds confidence** - Robust dependency management and reproducibility

### Implementation Additions

**New Components Needed:**

1. **Root Devcontainer** (`.devcontainer/`)
   - Self-deployment configuration
   - MCP server connections
   - Claude Code instructions

2. **Supabase MCP Server** (`template-components/mcp-servers/supabase/`)
   - `create_project` - Create Supabase project
   - `execute_sql` - Run migrations
   - `configure_auth_provider` - Set up GitHub OAuth

3. **Netlify MCP Server** (`template-components/mcp-servers/netlify/`)
   - `create_site` - Create Netlify site
   - `configure_env_vars` - Set environment variables
   - `deploy_site` - Deploy application

4. **Deployment Orchestration** (`.devcontainer/deploy-shipme.md`)
   - Step-by-step instructions for Claude Code
   - Dependency management
   - State tracking

### Revised Phase Priorities

**Phase 1-2:** ✅ Complete (code ready, awaiting MCP deployment)
**Phase 3 (CURRENT):** Build Supabase + Netlify MCP servers **NOW**
**Phase 4:** Deploy ShipMe.dev using these MCPs via Codespace
**Phase 5:** Use deployed ShipMe to deploy user projects, validate end-to-end

### Key Decisions (Feb 4, 2026)

✅ **Timing:** Build MCPs NOW and use for ShipMe deployment (no manual deployment)
✅ **OAuth:** Manual GitHub OAuth app creation (not automated via MCP yet)
✅ **Environment:** Single production environment (shipme.dev)
✅ **Dependencies:** Robust devcontainer with all tools pre-configured

---

## IMMEDIATE NEXT STEPS: MCP-Based Self-Deployment

### Week 1: Build MCP Servers for ShipMe Deployment

#### 1. Supabase MCP Server (`template-components/mcp-servers/supabase/`)

**Tools to Implement:**
```typescript
- create_project(name, region, db_password) → {project_id, url, anon_key, service_role_key}
- execute_sql(project_ref, sql) → {success, rows_affected}
- configure_auth_provider(project_ref, provider, client_id, client_secret) → {success}
- get_project_info(project_ref) → {url, api_keys, region, status}
```

**Authentication:** Requires `SUPABASE_ACCESS_TOKEN` (Management API)
**Pattern:** Follow `mcp-servers/github/index.ts` structure
**Files:**
- `supabase/index.ts` (~400 lines)
- `supabase/types.ts` (~50 lines)

#### 2. Netlify MCP Server (`template-components/mcp-servers/netlify/`)

**Tools to Implement:**
```typescript
- create_site(name) → {site_id, url, admin_url}
- configure_env_vars(site_id, env_vars) → {success}
- deploy_site(site_id, directory, branch) → {deploy_id, url, state}
- get_site_info(site_id) → {url, state, build_settings}
```

**Authentication:** Requires `NETLIFY_AUTH_TOKEN` (Personal Access Token)
**Pattern:** Follow `mcp-servers/github/index.ts` structure
**Files:**
- `netlify/index.ts` (~300 lines)
- `netlify/types.ts` (~50 lines)

#### 3. Root Devcontainer for ShipMe Self-Deployment

**Location:** `.devcontainer/` (in root, not in template-components)

**Files to Create:**

**`.devcontainer/devcontainer.json`:**
```json
{
  "name": "ShipMe Self-Deployment",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "customizations": {
    "vscode": {
      "extensions": ["anthropic.claude-code"],
      "settings": {
        "mcp.servers": {
          "github": {
            "command": "node",
            "args": ["template-components/mcp-servers/github/index.js"],
            "env": {"GITHUB_TOKEN": "${GITHUB_TOKEN}"}
          },
          "supabase": {
            "command": "node",
            "args": ["template-components/mcp-servers/supabase/index.js"],
            "env": {"SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"}
          },
          "netlify": {
            "command": "node",
            "args": ["template-components/mcp-servers/netlify/index.js"],
            "env": {"NETLIFY_AUTH_TOKEN": "${NETLIFY_AUTH_TOKEN}"}
          }
        }
      }
    }
  },
  "postCreateCommand": "bash .devcontainer/post-create.sh",
  "forwardPorts": [3000],
  "secrets": {
    "GITHUB_TOKEN": {"description": "GitHub PAT"},
    "SUPABASE_ACCESS_TOKEN": {"description": "Supabase Management API token"},
    "NETLIFY_AUTH_TOKEN": {"description": "Netlify personal access token"}
  }
}
```

**`.devcontainer/post-create.sh`:**
```bash
#!/bin/bash
echo "🚀 Setting up ShipMe self-deployment environment..."

# Install dependencies
npm install

# Build MCP servers
cd template-components/mcp-servers && npm install && npm run build && cd ../..

# Install app dependencies
cd app && npm install && cd ..

echo "✅ Environment ready!"
echo ""
echo "📋 To deploy ShipMe:"
echo "  1. Authenticate: gh auth login"
echo "  2. Set tokens as Codespace secrets"
echo "  3. Run: @claude Deploy ShipMe.dev"
```

**`.devcontainer/DEPLOY_SHIPME.md`:**
```markdown
# ShipMe Self-Deployment Guide

## Overview
This Codespace deploys shipme.dev using its own MCP servers.

## Prerequisites
User must provide (via Codespace secrets):
- GITHUB_TOKEN (from gh auth login)
- SUPABASE_ACCESS_TOKEN (from Supabase dashboard)
- NETLIFY_AUTH_TOKEN (from Netlify dashboard)

## Deployment Steps

### 1. Create Supabase Project
Tool: supabase.create_project
Input: name="shipme-prod", region="us-east-1"
Output: Store {project_id, url, anon_key, service_role_key} in secret vault

### 2. Run Database Migrations
Tool: supabase.execute_sql
Input: SQL from /app/supabase/schema.sql
Creates: profiles, automation_plans, codespace_launches, provisioning_events tables

### 3. Configure GitHub OAuth (Manual)
User creates OAuth app on GitHub:
  - Homepage URL: https://shipme.dev
  - Callback URL: https://shipme.dev/auth/callback
Provides: CLIENT_ID, CLIENT_SECRET

Tool: supabase.configure_auth_provider
Input: provider="github", client_id, client_secret

### 4. Build Application
Shell: cd app && npm run build
Output: .next/ directory

### 5. Create Netlify Site
Tool: netlify.create_site
Input: name="shipme-prod"
Output: Store {site_id, url} in vault

### 6. Configure Environment Variables
Tool: netlify.configure_env_vars
Input: site_id, env_vars from vault:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - NEXTAUTH_SECRET (generate)
  - GITHUB_ID, GITHUB_SECRET (from OAuth app)

### 7. Deploy to Netlify
Tool: netlify.deploy_site
Input: site_id, directory="app/.next"
Output: Live URL

### 8. Verification
- Visit live URL
- Test GitHub OAuth login
- Verify database connection
- Test "Launch Codespace" flow

## Success Criteria
✅ ShipMe.dev is live
✅ Authentication works
✅ Can create test Codespace
✅ All MCP servers functional
```

### Week 2: Deploy ShipMe via Codespace

**Process:**
1. User opens Codespace from shipme.dev repo
2. Authenticates to GitHub, Supabase, Netlify (once)
3. Runs: `@claude Deploy ShipMe.dev`
4. Claude orchestrates using MCP servers
5. ShipMe.dev is live in ~10 minutes

**Validation:**
- Deployment completes successfully
- Site is accessible at shipme.dev (or Netlify URL)
- GitHub OAuth works
- Can launch test Codespaces
- Database operations functional

---

## Phase 0: Backup & Preparation (Day 1)

### Goal
Preserve v1.0 and prepare repository for incremental migration.

### Tasks

1. **Create v1.0 Archive Branch**
   ```bash
   git checkout main
   git checkout -b v1.0-archive
   git push origin v1.0-archive
   git checkout main
   ```

2. **Document Current State**
   - Take screenshots of current shipme.dev
   - Export current environment variables
   - Document all active integrations
   - List all v1.0 routes and pages

3. **Set Up Development Branch**
   ```bash
   git checkout -b v2.0-development
   ```

### Deliverables
- ✅ `v1.0-archive` branch created and pushed
- ✅ Current state documented
- ✅ Ready to start Phase 1

**Deployment:** None (preparation only)

---

## Phase 1: Foundation + Simplified Landing (Week 1)

### Goal
Deploy simplified v2.0 landing page while keeping v1.0 provisioning functional as fallback.

### Repository Structure Changes

**Remove (v1.0 Dashboard):**
- `/app/src/app/(dashboard)/` - Entire dashboard group
- `/app/src/app/(admin)/` - Admin panel (not needed for MVP)
- `/app/src/components/StackCustomizer.tsx` - v1.0 UI component
- `/app/src/components/ProvisioningComplete.tsx` - v1.0 UI component

**Keep (Temporarily):**
- `/app/src/app/api/provision/` - Keep as fallback during migration
- `/app/src/lib/provisioning/` - Will adapt for MCP servers

**Create New:**
- `/app/src/app/api/launch-codespace/route.ts` - New Codespace launcher
- `/app/src/lib/auth/supabase-auth.ts` - Auth helpers
- `/app/src/app/auth/callback/route.ts` - OAuth callback

### Landing Page Simplification

**File:** `/app/src/app/page.tsx`

**Changes:**
```typescript
// REMOVE (lines ~35-150):
// - Infrastructure selection cards
// - Detailed stack configuration UI
// - Manual credential input forms
// - Complex dashboard navigation

// KEEP:
// - Hero section
// - Project idea textarea
// - AI stack recommendation flow
// - Basic styling

// ADD:
// - "Launch Development Environment" CTA
// - GitHub OAuth button
// - Simple flow: Describe → Analyze → Launch
```

### Authentication Setup

**New Files:**

1. **`/app/src/lib/auth/supabase-auth.ts`**
   ```typescript
   import { createClient } from '@/lib/supabase/client'

   export async function signInWithGitHub() {
     const supabase = createClient()
     const { data, error } = await supabase.auth.signInWithOAuth({
       provider: 'github',
       options: {
         redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
         scopes: 'repo read:user'
       }
     })
     return { data, error }
   }

   export async function getSession() {
     const supabase = createClient()
     const { data: { session } } = await supabase.auth.getSession()
     return session
   }

   export async function signOut() {
     const supabase = createClient()
     await supabase.auth.signOut()
   }
   ```

2. **`/app/src/app/auth/callback/route.ts`**
   ```typescript
   import { createClient } from '@/lib/supabase/server'
   import { NextResponse } from 'next/server'

   export async function GET(request: Request) {
     const requestUrl = new URL(request.url)
     const code = requestUrl.searchParams.get('code')

     if (code) {
       const supabase = createClient()
       await supabase.auth.exchangeCodeForSession(code)
     }

     return NextResponse.redirect(new URL('/', requestUrl.origin))
   }
   ```

3. **Update `/app/src/middleware.ts`**
   ```typescript
   import { createClient } from '@/lib/supabase/server'
   import { NextResponse } from 'next/server'
   import type { NextRequest } from 'next/server'

   export async function middleware(request: NextRequest) {
     const supabase = createClient()
     const { data: { session } } = await supabase.auth.getSession()

     // Protect /api/launch-codespace
     if (request.nextUrl.pathname.startsWith('/api/launch-codespace')) {
       if (!session) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
       }
     }

     return NextResponse.next()
   }

   export const config = {
     matcher: ['/api/launch-codespace/:path*']
   }
   ```

### Codespace Launcher (Stub Implementation)

**File:** `/app/src/app/api/launch-codespace/route.ts`

**Phase 1 Version (Basic):**
```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
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
    nextSteps: 'Template repository creation in progress'
  })
}
```

### Database Migration

**File:** `/app/supabase/schema.sql`

**Add v2.0 tables:**
```sql
-- Track Codespace launches
CREATE TABLE IF NOT EXISTS codespace_launches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_description TEXT,
  stack_config JSONB,
  codespace_url TEXT,
  template_repo_url TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'created', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track provisioning steps
CREATE TABLE IF NOT EXISTS provisioning_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codespace_id UUID REFERENCES codespace_launches(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  tool_name TEXT,
  status TEXT NOT NULL, -- 'started', 'completed', 'failed'
  details JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE codespace_launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE provisioning_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own codespace launches"
  ON codespace_launches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own codespace launches"
  ON codespace_launches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own provisioning events"
  ON provisioning_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM codespace_launches
      WHERE id = provisioning_events.codespace_id
      AND user_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_codespace_launches_updated_at
  BEFORE UPDATE ON codespace_launches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Testing Phase 1

**Test Scenarios:**
1. ✅ Visit shipme.dev → See simplified landing page
2. ✅ Click "Launch Environment" → GitHub OAuth flow
3. ✅ After auth → Call `/api/launch-codespace` → Get "pending" response
4. ✅ Database tables created successfully
5. ✅ No errors in production

### Deployment Phase 1

```bash
# Run database migration
supabase db push

# Deploy to Netlify
git add .
git commit -m "Phase 1: Simplified landing + auth + database"
git push origin v2.0-development

# Deploy via Netlify CLI or dashboard
netlify deploy --prod
```

### Phase 1 Deliverables
- ✅ Simplified landing page deployed to shipme.dev
- ✅ GitHub OAuth working
- ✅ Database schema updated
- ✅ Auth flow functional
- ✅ Codespace launcher endpoint (stub)
- ✅ v1.0 dashboard removed
- ✅ Site still functional (no broken links)

**User-Facing Change:** Simplified UI, OAuth login added, "Launch Environment" button (shows coming soon)

---

## Phase 2: Template Repository + GitHub MCP (Week 2)

### Goal
Create the shipme-starter-template repository and implement GitHub MCP server. Deploy working Codespace launcher.

### Create Template Repository

**New Repository:** `github.com/<your-org>/shipme-starter-template`

**Structure:**
```
shipme-starter-template/
├── .devcontainer/
│   ├── devcontainer.json
│   └── post-create.sh
├── .shipme/
│   ├── project.json (placeholder)
│   ├── claude-instructions.md
│   └── provisioning-plan.template.json
├── mcp-servers/
│   ├── package.json
│   ├── tsconfig.json
│   ├── github/
│   │   ├── index.ts
│   │   └── types.ts
│   └── shared/
│       ├── secret-vault.ts
│       └── plan-generator.ts
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

### devcontainer.json Configuration

**File:** `.devcontainer/devcontainer.json`

```json
{
  "name": "ShipMe Development Environment",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",

  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },

  "customizations": {
    "vscode": {
      "extensions": [
        "anthropic.claude-code",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ],
      "settings": {
        "mcp.servers": {
          "github": {
            "command": "node",
            "args": ["mcp-servers/github/index.js"]
          }
        }
      }
    }
  },

  "forwardPorts": [3000],

  "postCreateCommand": "bash .devcontainer/post-create.sh",

  "remoteUser": "node"
}
```

### Post-Create Script

**File:** `.devcontainer/post-create.sh`

```bash
#!/bin/bash

echo "🚀 Setting up ShipMe development environment..."

# Install dependencies
npm install

# Build MCP servers
cd mcp-servers && npm install && npm run build && cd ..

# Install global tools
npm install -g netlify-cli supabase

echo "✅ Environment ready!"
echo ""
echo "📋 Next Steps:"
echo "1. Read .shipme/project.json for your project configuration"
echo "2. Claude Code will automatically start provisioning"
echo "3. Watch the terminal for progress"
echo ""
echo "🤖 Type '@claude help' to get started"
```

### GitHub MCP Server

**File:** `mcp-servers/github/index.ts`

**Reuse from v1.0:** `/app/src/lib/provisioning/github.ts`

```typescript
import { Octokit } from '@octokit/rest'
import { Server } from '@modelcontextprotocol/sdk/server'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio'

// Import from v1.0 (adapt)
// Original: /app/src/lib/provisioning/github.ts

interface GitHubMCPConfig {
  token: string
}

class GitHubMCPServer {
  private octokit: Octokit
  private server: Server

  constructor(config: GitHubMCPConfig) {
    this.octokit = new Octokit({ auth: config.token })
    this.server = new Server({
      name: 'github-mcp',
      version: '1.0.0'
    })

    this.setupTools()
  }

  private setupTools() {
    // Tool 1: Create Repository
    this.server.tool(
      'create_repository',
      'Create a new GitHub repository',
      {
        name: { type: 'string', description: 'Repository name' },
        description: { type: 'string', description: 'Repository description' },
        private: { type: 'boolean', description: 'Is private?', default: false }
      },
      async (params) => {
        // Reuse from v1.0: createGitHubRepo()
        const repo = await this.octokit.repos.createForAuthenticatedUser({
          name: params.name,
          description: params.description,
          private: params.private,
          auto_init: true
        })

        return {
          success: true,
          repo_url: repo.data.html_url,
          clone_url: repo.data.clone_url
        }
      }
    )

    // Tool 2: Create Secret
    this.server.tool(
      'create_secret',
      'Add a secret to a repository',
      {
        repo: { type: 'string', description: 'Repository name (owner/repo)' },
        secret_name: { type: 'string', description: 'Secret name' },
        secret_value: { type: 'string', description: 'Secret value' }
      },
      async (params) => {
        const [owner, repo] = params.repo.split('/')

        // Get public key (required for encryption)
        const { data: publicKey } = await this.octokit.actions.getRepoPublicKey({
          owner,
          repo
        })

        // Encrypt secret (reuse from v1.0)
        const encrypted = await this.encryptSecret(params.secret_value, publicKey.key)

        await this.octokit.actions.createOrUpdateRepoSecret({
          owner,
          repo,
          secret_name: params.secret_name,
          encrypted_value: encrypted,
          key_id: publicKey.key_id
        })

        return { success: true }
      }
    )

    // Tool 3: Push Files
    this.server.tool(
      'push_files',
      'Push files to repository',
      {
        repo: { type: 'string', description: 'Repository name (owner/repo)' },
        files: { type: 'array', description: 'Files to push' },
        message: { type: 'string', description: 'Commit message' }
      },
      async (params) => {
        // Reuse from v1.0: pushInitialFiles()
        const [owner, repo] = params.repo.split('/')

        // Create tree
        const tree = await this.createGitTree(owner, repo, params.files)

        // Create commit
        const commit = await this.createCommit(owner, repo, tree.sha, params.message)

        // Update ref
        await this.updateRef(owner, repo, commit.sha)

        return { success: true, commit_sha: commit.sha }
      }
    )
  }

  private async encryptSecret(value: string, publicKey: string) {
    // Reuse encryption logic from v1.0
    const sodium = require('libsodium-wrappers')
    await sodium.ready

    const binkey = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL)
    const binsec = sodium.from_string(value)
    const encBytes = sodium.crypto_box_seal(binsec, binkey)

    return sodium.to_base64(encBytes, sodium.base64_variants.ORIGINAL)
  }

  private async createGitTree(owner: string, repo: string, files: any[]) {
    // Reuse tree creation from v1.0
    const tree = files.map(file => ({
      path: file.path,
      mode: '100644',
      type: 'blob',
      content: file.content
    }))

    const { data } = await this.octokit.git.createTree({
      owner,
      repo,
      tree
    })

    return data
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
  }
}

// Start server
const token = process.env.GITHUB_TOKEN || ''
const server = new GitHubMCPServer({ token })
server.run()
```

### Secret Vault Implementation

**File:** `mcp-servers/shared/secret-vault.ts`

```typescript
import crypto from 'crypto'

export class SecretVault {
  private secrets: Map<string, string> = new Map()
  private encryptionKey: Buffer

  constructor() {
    // Generate random encryption key (AES-256)
    this.encryptionKey = crypto.randomBytes(32)
  }

  async store(key: string, value: string): Promise<void> {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv)

    let encrypted = cipher.update(value, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // Store: iv:encrypted
    this.secrets.set(key, `${iv.toString('hex')}:${encrypted}`)
  }

  async retrieve(key: string): Promise<string | null> {
    const stored = this.secrets.get(key)
    if (!stored) return null

    const [ivHex, encrypted] = stored.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  async resolve(reference: string): Promise<string> {
    // Handle {{secrets.xxx}} format
    const match = reference.match(/\{\{secrets\.(\w+)\}\}/)
    if (!match) return reference

    const value = await this.retrieve(match[1])
    return value || reference
  }

  destroy(): void {
    this.secrets.clear()
    // Overwrite encryption key
    this.encryptionKey.fill(0)
  }
}
```

### Update Codespace Launcher (Real Implementation)

**File:** `/app/src/app/api/launch-codespace/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Octokit } from '@octokit/rest'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectName, description, stack } = await request.json()

  try {
    // Get GitHub token from session
    const githubToken = session.provider_token // From GitHub OAuth
    const octokit = new Octokit({ auth: githubToken })

    // 1. Create repo from template
    const repo = await octokit.repos.createUsingTemplate({
      template_owner: process.env.TEMPLATE_OWNER || 'your-org',
      template_repo: 'shipme-starter-template',
      name: projectName,
      description,
      private: false
    })

    // 2. Inject project configuration
    const projectConfig = {
      name: projectName,
      description,
      stack,
      createdAt: new Date().toISOString()
    }

    await octokit.repos.createOrUpdateFileContents({
      owner: session.user.user_metadata.user_name,
      repo: projectName,
      path: '.shipme/project.json',
      message: 'Add project configuration',
      content: Buffer.from(JSON.stringify(projectConfig, null, 2)).toString('base64')
    })

    // 3. Track in database
    const { data: launch } = await supabase
      .from('codespace_launches')
      .insert({
        user_id: session.user.id,
        project_name: projectName,
        project_description: description,
        stack_config: stack,
        template_repo_url: repo.data.html_url,
        status: 'created'
      })
      .select()
      .single()

    // 4. Generate Codespace URL
    const codespaceUrl = `https://github.com/codespaces/new?repo=${repo.data.full_name}`

    // 5. Update with Codespace URL
    await supabase
      .from('codespace_launches')
      .update({ codespace_url: codespaceUrl })
      .eq('id', launch.id)

    return NextResponse.json({
      success: true,
      codespace_url: codespaceUrl,
      repo_url: repo.data.html_url,
      launch_id: launch.id
    })

  } catch (error: any) {
    console.error('Codespace launch error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to launch Codespace'
    }, { status: 500 })
  }
}
```

### Claude Instructions

**File:** `.shipme/claude-instructions.md` (in template repo)

```markdown
# ShipMe Infrastructure Provisioning

You are an AI DevOps assistant helping provision cloud infrastructure.

## Your Task
1. Read `.shipme/project.json` to understand the project requirements
2. Use available MCP servers to provision infrastructure
3. Provide clear progress updates
4. Store credentials securely in the secret vault

## Available Tools (MCP Servers)
- **github**: Repository management (already configured)
- **supabase**: Database + auth (coming in Phase 3)
- **netlify**: Deployment (coming in Phase 3)
- **gcp**: OAuth setup (coming in Phase 4)

## Phase 2 Capabilities
Currently you can:
- Create GitHub repositories
- Add repository secrets
- Push code to repositories

## Example Workflow
```
1. Read project config from .shipme/project.json
2. Confirm requirements with user
3. Execute provisioning steps
4. Report completion with URLs
```

Start by greeting the user and reading their project configuration!
```

### Testing Phase 2

**Test Scenarios:**
1. ✅ Template repo created and accessible
2. ✅ Codespace launches from template
3. ✅ Claude Code extension loads in Codespace
4. ✅ GitHub MCP server works (create repo test)
5. ✅ `/api/launch-codespace` creates repo and returns Codespace URL
6. ✅ User can click URL and land in VS Code
7. ✅ `.shipme/project.json` is injected correctly

### Deployment Phase 2

```bash
# Commit changes to main repo
git add .
git commit -m "Phase 2: Template repo + GitHub MCP + working Codespace launcher"
git push origin v2.0-development

# Deploy to Netlify
netlify deploy --prod

# Make template repo public
# (via GitHub UI)
```

### Phase 2 Deliverables
- ✅ Template repository created and public
- ✅ GitHub MCP server functional
- ✅ Secret vault implemented
- ✅ Codespace launcher creates repos
- ✅ Users can launch Codespaces
- ✅ Basic Claude Code integration working
- ✅ Deployed to shipme.dev

**User-Facing Change:** "Launch Environment" button now works, creates GitHub repo, opens Codespace with Claude Code

---

## Phase 3: Supabase + Netlify MCP Servers (Week 3)

### Goal
Add Supabase and Netlify MCP servers for full infrastructure provisioning.

### Supabase MCP Server

**File:** `mcp-servers/supabase/index.ts` (in template repo)

**Reuse from v1.0:** `/app/src/lib/provisioning/supabase.ts`

```typescript
import { Server } from '@modelcontextprotocol/sdk/server'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio'
import { createClient } from '@supabase/supabase-js'

class SupabaseMCPServer {
  private server: Server
  private managementToken: string

  constructor(managementToken: string) {
    this.managementToken = managementToken
    this.server = new Server({
      name: 'supabase-mcp',
      version: '1.0.0'
    })

    this.setupTools()
  }

  private setupTools() {
    // Tool 1: Create Project
    this.server.tool(
      'create_project',
      'Create a new Supabase project',
      {
        name: { type: 'string', description: 'Project name' },
        region: { type: 'string', description: 'Region (e.g., us-east-1)', default: 'us-east-1' },
        db_password: { type: 'string', description: 'Database password' }
      },
      async (params) => {
        // Reuse from v1.0: createSupabaseProject()
        const response = await fetch('https://api.supabase.com/v1/projects', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.managementToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: params.name,
            organization_id: process.env.SUPABASE_ORG_ID,
            region: params.region,
            db_pass: params.db_password
          })
        })

        const project = await response.json()

        return {
          success: true,
          project_id: project.id,
          project_url: `https://${project.id}.supabase.co`,
          anon_key: project.anon_key,
          service_role_key: project.service_role_key
        }
      }
    )

    // Tool 2: Run Migration
    this.server.tool(
      'run_migration',
      'Execute SQL migration',
      {
        project_id: { type: 'string', description: 'Project ID' },
        sql: { type: 'string', description: 'SQL to execute' }
      },
      async (params) => {
        // Reuse from v1.0: runMigrations()
        const supabase = createClient(
          `https://${params.project_id}.supabase.co`,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { error } = await supabase.rpc('exec_sql', { sql: params.sql })

        if (error) throw error

        return { success: true }
      }
    )

    // Tool 3: Configure Auth
    this.server.tool(
      'configure_auth',
      'Configure OAuth provider',
      {
        project_id: { type: 'string', description: 'Project ID' },
        provider: { type: 'string', description: 'Provider (google, github)' },
        client_id: { type: 'string', description: 'OAuth client ID' },
        client_secret: { type: 'string', description: 'OAuth client secret' }
      },
      async (params) => {
        const response = await fetch(
          `https://api.supabase.com/v1/projects/${params.project_id}/config/auth`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${this.managementToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              [params.provider]: {
                enabled: true,
                client_id: params.client_id,
                secret: params.client_secret
              }
            })
          }
        )

        return { success: true }
      }
    )
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
  }
}

const server = new SupabaseMCPServer(process.env.SUPABASE_MANAGEMENT_TOKEN!)
server.run()
```

### Netlify MCP Server

**File:** `mcp-servers/netlify/index.ts` (in template repo)

```typescript
import { Server } from '@modelcontextprotocol/sdk/server'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio'

class NetlifyMCPServer {
  private server: Server
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
    this.server = new Server({
      name: 'netlify-mcp',
      version: '1.0.0'
    })

    this.setupTools()
  }

  private setupTools() {
    // Tool 1: Create Site
    this.server.tool(
      'create_site',
      'Create a new Netlify site',
      {
        name: { type: 'string', description: 'Site name' },
        repo: { type: 'string', description: 'GitHub repo (owner/repo)' }
      },
      async (params) => {
        const response = await fetch('https://api.netlify.com/api/v1/sites', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: params.name,
            repo: {
              provider: 'github',
              repo: params.repo,
              private: false,
              branch: 'main'
            }
          })
        })

        const site = await response.json()

        return {
          success: true,
          site_id: site.id,
          site_url: site.url,
          admin_url: site.admin_url
        }
      }
    )

    // Tool 2: Set Environment Variables
    this.server.tool(
      'set_env_vars',
      'Configure environment variables',
      {
        site_id: { type: 'string', description: 'Site ID' },
        env_vars: { type: 'object', description: 'Environment variables' }
      },
      async (params) => {
        for (const [key, value] of Object.entries(params.env_vars)) {
          await fetch(`https://api.netlify.com/api/v1/sites/${params.site_id}/env`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              key,
              values: [{ value, context: 'all' }]
            })
          })
        }

        return { success: true }
      }
    )

    // Tool 3: Deploy
    this.server.tool(
      'deploy',
      'Trigger deployment',
      {
        site_id: { type: 'string', description: 'Site ID' }
      },
      async (params) => {
        const response = await fetch(
          `https://api.netlify.com/api/v1/sites/${params.site_id}/builds`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          }
        )

        const build = await response.json()

        return {
          success: true,
          build_id: build.id,
          deploy_url: build.deploy_url
        }
      }
    )
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
  }
}

const server = new NetlifyMCPServer(process.env.NETLIFY_ACCESS_TOKEN!)
server.run()
```

### Update devcontainer.json

**File:** `.devcontainer/devcontainer.json` (in template repo)

```json
{
  "name": "ShipMe Development Environment",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",

  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },

  "customizations": {
    "vscode": {
      "extensions": [
        "anthropic.claude-code",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ],
      "settings": {
        "mcp.servers": {
          "github": {
            "command": "node",
            "args": ["mcp-servers/github/index.js"]
          },
          "supabase": {
            "command": "node",
            "args": ["mcp-servers/supabase/index.js"],
            "env": {
              "SUPABASE_MANAGEMENT_TOKEN": "${SUPABASE_MANAGEMENT_TOKEN}",
              "SUPABASE_ORG_ID": "${SUPABASE_ORG_ID}"
            }
          },
          "netlify": {
            "command": "node",
            "args": ["mcp-servers/netlify/index.js"],
            "env": {
              "NETLIFY_ACCESS_TOKEN": "${NETLIFY_ACCESS_TOKEN}"
            }
          }
        }
      }
    }
  },

  "forwardPorts": [3000],

  "postCreateCommand": "bash .devcontainer/post-create.sh",

  "remoteUser": "node",

  "secrets": {
    "SUPABASE_MANAGEMENT_TOKEN": {
      "description": "Supabase Management API token",
      "documentationUrl": "https://supabase.com/docs/guides/platform/access-control"
    },
    "NETLIFY_ACCESS_TOKEN": {
      "description": "Netlify Personal Access Token",
      "documentationUrl": "https://docs.netlify.com/api/get-started/#authentication"
    }
  }
}
```

### Update Claude Instructions

**File:** `.shipme/claude-instructions.md` (in template repo)

```markdown
# ShipMe Infrastructure Provisioning - Phase 3

## Available MCP Servers
- ✅ **github**: Repository management
- ✅ **supabase**: Database + authentication
- ✅ **netlify**: Hosting + deployment

## Provisioning Workflow

1. **Read Configuration**
   ```
   Read .shipme/project.json
   Understand: name, description, stack requirements
   ```

2. **Provision Supabase**
   ```
   Tool: supabase.create_project
   Generate secure DB password
   Store credentials in secret vault:
     - {{secrets.supabase_url}}
     - {{secrets.supabase_anon_key}}
   ```

3. **Run Database Migration**
   ```
   Tool: supabase.run_migration
   Execute schema from starter template
   ```

4. **Deploy to Netlify**
   ```
   Tool: netlify.create_site
   Link to GitHub repo
   Set environment variables from secret vault
   ```

5. **Report Completion**
   ```
   Provide URLs:
     - Supabase dashboard
     - Netlify site URL
     - GitHub repository
   ```

## Example Output
```
✓ Created Supabase project: my-app-db
  → Dashboard: https://app.supabase.com/project/xxx
✓ Configured database schema
✓ Created Netlify site: my-app
  → Live URL: https://my-app.netlify.app
✓ All credentials stored securely

Your infrastructure is ready! 🚀
```

Begin provisioning now!
```

### Testing Phase 3

**Test Scenarios:**
1. ✅ Launch Codespace with all 3 MCP servers
2. ✅ Claude Code creates Supabase project
3. ✅ Claude Code runs database migration
4. ✅ Claude Code creates Netlify site
5. ✅ Claude Code sets environment variables
6. ✅ End-to-end: Describe app → Launch → Fully provisioned in <10 min
7. ✅ Credentials stored in secret vault (not exposed)

### Deployment Phase 3

```bash
# Update template repo
cd shipme-starter-template
git add .
git commit -m "Phase 3: Add Supabase + Netlify MCP servers"
git push origin main

# Update main repo (update template reference)
cd ../shipme.dev
git add .
git commit -m "Phase 3: Update template with Supabase + Netlify support"
git push origin v2.0-development

# Deploy
netlify deploy --prod
```

### Phase 3 Deliverables
- ✅ Supabase MCP server functional
- ✅ Netlify MCP server functional
- ✅ Full provisioning flow working
- ✅ Database migrations automated
- ✅ Deployment automated
- ✅ Environment variables configured
- ✅ Template repo updated
- ✅ Deployed to shipme.dev

**User-Facing Change:** Complete infrastructure provisioning (database + hosting) now works end-to-end

---

## Phase 4: GCP MCP + Final Integration (Week 4)

### Goal
Add Google Cloud Platform MCP for OAuth automation and complete all integrations.

### GCP MCP Server

**File:** `mcp-servers/gcp/index.ts` (in template repo)

```typescript
import { Server } from '@modelcontextprotocol/sdk/server'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio'
import { google } from 'googleapis'

class GCPMCPServer {
  private server: Server
  private oauth2Client: any

  constructor() {
    this.server = new Server({
      name: 'gcp-mcp',
      version: '1.0.0'
    })

    // Initialize Google OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GCP_CLIENT_ID,
      process.env.GCP_CLIENT_SECRET,
      process.env.GCP_REDIRECT_URI
    )

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GCP_REFRESH_TOKEN
    })

    this.setupTools()
  }

  private setupTools() {
    // Tool 1: Create OAuth Client
    this.server.tool(
      'create_oauth_client',
      'Create OAuth 2.0 client ID',
      {
        project_id: { type: 'string', description: 'GCP Project ID' },
        name: { type: 'string', description: 'OAuth client name' },
        redirect_uris: { type: 'array', description: 'Authorized redirect URIs' }
      },
      async (params) => {
        const iap = google.iap({ version: 'v1', auth: this.oauth2Client })

        const response = await iap.projects.brands.identityAwareProxyClients.create({
          parent: `projects/${params.project_id}/brands/-`,
          requestBody: {
            displayName: params.name,
            redirectUris: params.redirect_uris
          }
        })

        return {
          success: true,
          client_id: response.data.name,
          client_secret: response.data.secret
        }
      }
    )

    // Tool 2: Configure Consent Screen
    this.server.tool(
      'configure_consent_screen',
      'Set up OAuth consent screen',
      {
        project_id: { type: 'string', description: 'GCP Project ID' },
        app_name: { type: 'string', description: 'Application name' },
        support_email: { type: 'string', description: 'Support email' }
      },
      async (params) => {
        const iap = google.iap({ version: 'v1', auth: this.oauth2Client })

        await iap.projects.brands.create({
          parent: `projects/${params.project_id}`,
          requestBody: {
            applicationTitle: params.app_name,
            supportEmail: params.support_email
          }
        })

        return { success: true }
      }
    )

    // Tool 3: Add Authorized Origins
    this.server.tool(
      'add_authorized_origin',
      'Add authorized JavaScript origin',
      {
        client_id: { type: 'string', description: 'OAuth client ID' },
        origin: { type: 'string', description: 'Origin URL (e.g., https://myapp.com)' }
      },
      async (params) => {
        // Update OAuth client with new origin
        const iap = google.iap({ version: 'v1', auth: this.oauth2Client })

        await iap.projects.brands.identityAwareProxyClients.patch({
          name: params.client_id,
          updateMask: 'redirectUris',
          requestBody: {
            redirectUris: [params.origin]
          }
        })

        return { success: true }
      }
    )
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
  }
}

const server = new GCPMCPServer()
server.run()
```

### Provisioning Plan Generator

**File:** `mcp-servers/shared/plan-generator.ts` (in template repo)

**Reuse from v1.0:** `/app/src/lib/provisioning/orchestrator.ts`

```typescript
interface ProjectConfig {
  name: string
  description: string
  stack: {
    framework: string
    database: string
    hosting: string
    auth: string[]
  }
}

interface ProvisioningStep {
  id: string
  name: string
  tool: string
  params: any
  dependencies?: string[]
}

interface ProvisioningPlan {
  steps: ProvisioningStep[]
}

export function generateProvisioningPlan(config: ProjectConfig): ProvisioningPlan {
  const steps: ProvisioningStep[] = []

  // Step 1: Create GitHub repo (always)
  steps.push({
    id: 'github_repo',
    name: 'Create GitHub Repository',
    tool: 'github.create_repository',
    params: {
      name: config.name,
      description: config.description,
      private: false
    }
  })

  // Step 2: Create Supabase project (if using Supabase)
  if (config.stack.database === 'supabase') {
    steps.push({
      id: 'supabase_project',
      name: 'Provision Supabase Database',
      tool: 'supabase.create_project',
      params: {
        name: `${config.name}-db`,
        region: 'us-east-1',
        db_password: '{{generate_password}}' // Will be generated
      }
    })

    // Step 3: Run database migration
    steps.push({
      id: 'supabase_schema',
      name: 'Set Up Database Schema',
      tool: 'supabase.run_migration',
      params: {
        project_id: '{{supabase_project.project_id}}',
        sql: '{{read_file:./database/schema.sql}}'
      },
      dependencies: ['supabase_project']
    })
  }

  // Step 4: Configure OAuth (if auth enabled)
  if (config.stack.auth.includes('google')) {
    steps.push({
      id: 'gcp_oauth',
      name: 'Configure Google OAuth',
      tool: 'gcp.create_oauth_client',
      params: {
        project_id: '{{ask_user:gcp_project_id}}',
        name: config.name,
        redirect_uris: ['{{supabase_project.project_url}}/auth/v1/callback']
      },
      dependencies: ['supabase_project']
    })

    steps.push({
      id: 'supabase_auth',
      name: 'Configure Supabase Auth',
      tool: 'supabase.configure_auth',
      params: {
        project_id: '{{supabase_project.project_id}}',
        provider: 'google',
        client_id: '{{gcp_oauth.client_id}}',
        client_secret: '{{secrets.gcp_oauth_secret}}'
      },
      dependencies: ['supabase_project', 'gcp_oauth']
    })
  }

  // Step 5: Deploy to Netlify
  if (config.stack.hosting === 'netlify') {
    steps.push({
      id: 'netlify_site',
      name: 'Deploy to Netlify',
      tool: 'netlify.create_site',
      params: {
        name: config.name,
        repo: '{{github_repo.repo_full_name}}'
      },
      dependencies: ['github_repo']
    })

    // Step 6: Set environment variables
    if (config.stack.database === 'supabase') {
      steps.push({
        id: 'netlify_env',
        name: 'Configure Environment Variables',
        tool: 'netlify.set_env_vars',
        params: {
          site_id: '{{netlify_site.site_id}}',
          env_vars: {
            NEXT_PUBLIC_SUPABASE_URL: '{{secrets.supabase_url}}',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: '{{secrets.supabase_anon_key}}',
            SUPABASE_SERVICE_ROLE_KEY: '{{secrets.supabase_service_key}}'
          }
        },
        dependencies: ['netlify_site', 'supabase_project']
      })
    }
  }

  return { steps }
}
```

### Update devcontainer.json (Final)

**File:** `.devcontainer/devcontainer.json` (in template repo)

```json
{
  "name": "ShipMe Development Environment",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",

  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },

  "customizations": {
    "vscode": {
      "extensions": [
        "anthropic.claude-code",
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ],
      "settings": {
        "mcp.servers": {
          "github": {
            "command": "node",
            "args": ["mcp-servers/github/index.js"]
          },
          "supabase": {
            "command": "node",
            "args": ["mcp-servers/supabase/index.js"]
          },
          "netlify": {
            "command": "node",
            "args": ["mcp-servers/netlify/index.js"]
          },
          "gcp": {
            "command": "node",
            "args": ["mcp-servers/gcp/index.js"]
          }
        }
      }
    }
  },

  "forwardPorts": [3000],

  "postCreateCommand": "bash .devcontainer/post-create.sh",

  "remoteUser": "node"
}
```

### Testing Phase 4

**Test Scenarios:**
1. ✅ Full provisioning with Google OAuth
2. ✅ GCP MCP creates OAuth client
3. ✅ Supabase auth configured automatically
4. ✅ End-to-end test: SaaS app with auth fully provisioned
5. ✅ User intervention: Claude asks for GCP project ID
6. ✅ All secrets stored in vault
7. ✅ No credential exposure in logs

### Deployment Phase 4

```bash
# Update template repo
cd shipme-starter-template
git add .
git commit -m "Phase 4: Add GCP MCP + plan generator"
git push origin main

# Update main repo
cd ../shipme.dev
git add .
git commit -m "Phase 4: Complete v2.0 integration"
git push origin v2.0-development

# Deploy
netlify deploy --prod
```

### Phase 4 Deliverables
- ✅ GCP MCP server functional
- ✅ OAuth automation working
- ✅ Plan generator creates comprehensive plans
- ✅ All 4 MCP servers integrated
- ✅ Complete provisioning flow (5-10 min)
- ✅ User intervention handled gracefully
- ✅ Deployed to shipme.dev

**User-Facing Change:** Full automation including OAuth setup, complete infrastructure in <10 minutes

---

## Phase 5: Final Polish + Launch (Week 5-6)

### Goal
Production hardening, documentation, testing, and public launch.

### Final Cleanup

**Remove v1.0 Code:**
```bash
# Remove all v1.0 provisioning routes
rm -rf app/src/app/api/provision
rm -rf app/src/app/(dashboard)
rm -rf app/src/app/(admin)

# Remove v1.0 components
rm app/src/components/ServiceConnector.tsx
rm app/src/components/StackCustomizer.tsx
rm app/src/components/ProvisioningComplete.tsx
rm app/src/components/FreeTierInfo.tsx

# Keep only:
# - /app/src/app/page.tsx (simplified landing)
# - /app/src/app/api/analyze-idea (AI recommendation - 100% reusable)
# - /app/src/app/api/launch-codespace (new launcher)
# - /app/src/lib/provisioning/* (adapted for MCP)
```

### Production Hardening

1. **Error Handling**
   - Add retry logic to all MCP tools
   - Implement exponential backoff
   - Clear error messages for users
   - Fallback to manual instructions if automation fails

2. **Security Audit**
   - Verify no credentials in logs
   - Test secret vault encryption
   - Validate RLS policies
   - Penetration testing

3. **Performance Optimization**
   - Optimize Codespace startup time
   - Reduce template repo size
   - Cache MCP server builds
   - Parallel provisioning where possible

4. **Monitoring**
   - Add Sentry for error tracking
   - Add analytics (PostHog/Mixpanel)
   - Track success rates
   - Monitor API rate limits

### Documentation

**Create:**
1. **README.md** (main repo) - Updated for v2.0
2. **CONTRIBUTING.md** - How to contribute
3. **docs/MCP_SERVERS.md** - MCP server documentation
4. **docs/TROUBLESHOOTING.md** - Common issues
5. **Video demo** - Screen recording of full flow

### Testing

**Test Matrix:**
| Stack | Database | Hosting | Auth | Status |
|-------|----------|---------|------|--------|
| Next.js | Supabase | Netlify | None | ✅ |
| Next.js | Supabase | Netlify | Google | ✅ |
| Next.js | Supabase | Netlify | GitHub | ✅ |

**Performance Benchmarks:**
- Codespace start: < 2 minutes ✅
- GitHub repo creation: < 30 seconds ✅
- Supabase provisioning: < 3 minutes ✅
- Netlify deployment: < 2 minutes ✅
- **Total time:** 5-10 minutes ✅

### Launch Checklist

**Pre-Launch:**
- ✅ All test scenarios passing (>90% success rate)
- ✅ Error handling robust
- ✅ Documentation complete
- ✅ Demo video recorded
- ✅ Blog post written
- ✅ Social media posts drafted

**Launch Day:**
- ✅ Merge v2.0-development → main
- ✅ Deploy to production (shipme.dev)
- ✅ Announce on Twitter/X
- ✅ Post on Hacker News (Show HN)
- ✅ Email v1.0 users
- ✅ Monitor for issues

**Post-Launch (Week 1):**
- ✅ Respond to feedback within 24 hours
- ✅ Fix critical bugs immediately
- ✅ Gather user testimonials
- ✅ Track metrics (signups, completions, errors)

### Phase 5 Deliverables
- ✅ All v1.0 code removed
- ✅ Production hardened
- ✅ Comprehensive documentation
- ✅ >90% success rate
- ✅ Public launch
- ✅ First 20+ beta users
- ✅ Positive feedback

**User-Facing Change:** Fully polished v2.0, all v1.0 references removed, production-ready

---

## Success Metrics

### Technical Metrics (End of Phase 5)
- ✅ Codespace launch success rate: >85%
- ✅ Provisioning completion rate: >80%
- ✅ Average time to deploy: <12 minutes
- ✅ Zero credential leaks
- ✅ API error rate: <10%

### User Metrics
- ✅ 20+ beta users successfully provision infrastructure
- ✅ Time to first working app: <20 minutes
- ✅ Support requests: <20% of users
- ✅ NPS score: >40

### Business Metrics
- ✅ Clear product-market fit signal
- ✅ Positive user testimonials
- ✅ Hacker News/Twitter engagement
- ✅ Email list growth

---

## Phase Summary

| Phase | Duration | Key Deliverable | Deployment |
|-------|----------|----------------|------------|
| **0** | Day 1 | v1.0 backup, prep | None |
| **1** | Week 1 | Simplified landing + auth | shipme.dev |
| **2** | Week 2 | Template repo + GitHub MCP | shipme.dev |
| **3** | Week 3 | Supabase + Netlify MCP | shipme.dev |
| **4** | Week 4 | GCP MCP + integration | shipme.dev |
| **5** | Week 5-6 | Polish + launch | shipme.dev |

**Total Timeline:** 5-6 weeks

**Critical Path:**
1. Phase 1: Foundation (enables all other phases)
2. Phase 2: Template + GitHub MCP (core infrastructure)
3. Phase 3: Supabase + Netlify (completes provisioning)
4. Phase 4: GCP OAuth (final automation piece)
5. Phase 5: Launch (polish + go-to-market)

---

## Daily Workflow (Solo Founder)

### Morning (3-4 hours)
- Deep work on current phase tasks
- No interruptions

### Afternoon (2-3 hours)
- Testing previous day's work
- Bug fixes
- Deploy to shipme.dev

### Evening (1-2 hours)
- Documentation
- Planning next day
- Community engagement

### Weekly Cadence
- **Monday:** Start new phase
- **Tuesday-Thursday:** Build + test
- **Friday:** Deploy + document
- **Weekend:** Buffer for catch-up

---

## Risk Mitigation

### Risk 1: Timeline Slip
**Mitigation:**
- Each phase is independently valuable
- Can skip GCP MCP (manual OAuth) if behind
- Phase 5 polish can be post-launch

### Risk 2: MCP Complexity
**Mitigation:**
- Start with GitHub (easiest)
- Test each server independently
- Fallback to manual instructions

### Risk 3: Production Issues
**Mitigation:**
- v1.0-archive branch available for rollback
- Each phase deployed before next starts
- Incremental user-facing changes

---

## Repository Structure (Final State)

```
shipme.dev/
├── app/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx (simplified landing)
│   │   │   ├── auth/
│   │   │   │   └── callback/route.ts
│   │   │   └── api/
│   │   │       ├── analyze-idea/route.ts (from v1.0)
│   │   │       └── launch-codespace/route.ts (new)
│   │   ├── lib/
│   │   │   ├── auth/
│   │   │   │   └── supabase-auth.ts
│   │   │   ├── provisioning/ (kept for reference)
│   │   │   └── supabase/
│   │   └── middleware.ts
│   ├── supabase/
│   │   └── schema.sql (updated with v2.0 tables)
│   ├── package.json
│   └── netlify.toml
├── product_spec/
│   └── v2.0-PRODUCT_SPEC.md
└── README.md

shipme-starter-template/ (separate repo)
├── .devcontainer/
│   ├── devcontainer.json
│   └── post-create.sh
├── .shipme/
│   ├── project.json
│   ├── claude-instructions.md
│   └── provisioning-plan.template.json
├── mcp-servers/
│   ├── github/index.ts
│   ├── supabase/index.ts
│   ├── netlify/index.ts
│   ├── gcp/index.ts
│   └── shared/
│       ├── secret-vault.ts
│       └── plan-generator.ts
├── src/ (Next.js starter)
└── database/
    └── schema.sql
```

---

## Conclusion

This revised plan delivers ShipMe v2.0 in **5-6 weeks** through **5 deployable phases**, each tested on shipme.dev before proceeding. By working incrementally in the same repository with progressive v1.0 removal, you maintain a working product throughout development while building toward the Codespaces-first vision.

**Next Action:** Begin Phase 0 (backup v1.0 and prepare repository)
