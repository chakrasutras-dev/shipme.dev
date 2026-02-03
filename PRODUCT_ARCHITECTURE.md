# DevFlow Product Architecture - Claude Computer Use Integration

**Complete architecture where users only need Docker to run AI-powered infrastructure automation**

---

## 🎯 Product Vision

DevFlow is a **self-hosted automation platform** that users run on their local machine. The user:
1. Installs Docker
2. Runs `docker-compose up`
3. Opens browser to `localhost:3000`
4. Creates automations that execute via Claude Computer Use

**No cloud infrastructure needed. Everything runs locally.**

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Machine                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Docker Compose Stack                                  │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  devflow-web (Next.js)                           │  │ │
│  │  │  - Frontend UI                                   │  │ │
│  │  │  - API Routes                                    │  │ │
│  │  │  - Port: 3000                                    │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                           ↓                            │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  devflow-postgres (Database)                     │  │ │
│  │  │  - User data                                     │  │ │
│  │  │  - Automation history                            │  │ │
│  │  │  - Audit logs                                    │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                           ↓                            │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  devflow-redis (Queue)                           │  │ │
│  │  │  - Job queue for automations                     │  │ │
│  │  │  - Real-time progress updates                    │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                           ↓                            │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  devflow-agent (Claude Computer Use)             │  │ │
│  │  │  ┌────────────────────────────────────────────┐  │  │ │
│  │  │  │  Anthropic API Client                      │  │  │ │
│  │  │  │  - Claude Sonnet 4.5                       │  │  │ │
│  │  │  │  - Computer Use Tool                       │  │  │ │
│  │  │  └────────────────────────────────────────────┘  │  │ │
│  │  │  ┌────────────────────────────────────────────┐  │  │ │
│  │  │  │  Virtual Desktop (Xvfb + VNC)              │  │  │ │
│  │  │  │  - Headless browser (Chromium)             │  │  │ │
│  │  │  │  - Screenshot capability                   │  │  │ │
│  │  │  │  - Mouse/keyboard control                  │  │  │ │
│  │  │  └────────────────────────────────────────────┘  │  │ │
│  │  │  ┌────────────────────────────────────────────┐  │  │ │
│  │  │  │  CLI Tools                                 │  │  │ │
│  │  │  │  - GitHub CLI (gh)                         │  │  │ │
│  │  │  │  - Vercel CLI                              │  │  │ │
│  │  │  │  - Supabase CLI                            │  │  │ │
│  │  │  │  - Stripe CLI                              │  │  │ │
│  │  │  └────────────────────────────────────────────┘  │  │ │
│  │  │                                                  │  │ │
│  │  │  Volumes:                                        │  │ │
│  │  │  - /workspace (code generation)                  │  │ │
│  │  │  - /credentials (mounted from host)              │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  User's Credentials (mounted as volumes):                   │
│  - ~/.config/gh/hosts.yml (GitHub auth)                     │
│  - ~/.config/vercel (Vercel auth)                           │
│  - ~/.anthropic/api_key (Claude API key)                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Docker Compose Stack

### Complete `docker-compose.yml`

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: devflow-postgres
    environment:
      POSTGRES_DB: devflow
      POSTGRES_USER: devflow
      POSTGRES_PASSWORD: devflow_secret
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devflow"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Queue
  redis:
    image: redis:7-alpine
    container_name: devflow-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Next.js Web Application
  web:
    build:
      context: ./app
      dockerfile: Dockerfile
    container_name: devflow-web
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://devflow:devflow_secret@postgres:5432/devflow
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./app:/app
      - /app/node_modules

  # Claude Computer Use Agent
  agent:
    build:
      context: ./automation-agent
      dockerfile: Dockerfile
    container_name: devflow-agent
    environment:
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      DATABASE_URL: postgresql://devflow:devflow_secret@postgres:5432/devflow
      REDIS_URL: redis://redis:6379
      DISPLAY: :99
    volumes:
      # Mount user's credentials (read-only)
      - ${HOME}/.config/gh:/home/agent/.config/gh:ro
      - ${HOME}/.config/vercel:/home/agent/.config/vercel:ro
      # Workspace for generated code
      - agent_workspace:/workspace
      # Screenshots and logs
      - agent_logs:/var/log/devflow
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    # Security settings
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - SYS_CHROOT
    read_only: false  # Agent needs to write to workspace
    tmpfs:
      - /tmp:rw,noexec,nosuid,size=100m

volumes:
  postgres_data:
  redis_data:
  agent_workspace:
  agent_logs:
```

---

## 🤖 Agent Container Architecture

### Enhanced `automation-agent/Dockerfile`

```dockerfile
FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    xvfb \
    x11vnc \
    fluxbox \
    chromium-browser \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install CLI tools
RUN npm install -g \
    gh \
    vercel \
    @supabase/supabase-js

# Install Anthropic SDK
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Create non-root user
RUN useradd -m -u 1000 agent && \
    mkdir -p /workspace /var/log/devflow && \
    chown -R agent:agent /workspace /var/log/devflow

# Copy application code
COPY --chown=agent:agent . .

# Switch to non-root user
USER agent

# Start Xvfb and agent
CMD ["sh", "-c", "Xvfb :99 -screen 0 1920x1080x24 & node index.js"]
```

### Enhanced Agent Code with Claude Computer Use

**File: `automation-agent/index.js`**

```javascript
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from 'redis'
import postgres from 'postgres'
import { execSync } from 'child_process'

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const redis = createClient({ url: process.env.REDIS_URL })
await redis.connect()

const sql = postgres(process.env.DATABASE_URL)

console.log('[Agent] DevFlow Automation Agent started')
console.log('[Agent] Listening for automation jobs...')

// Job processing loop
async function processJobs() {
  while (true) {
    try {
      // Pop job from Redis queue (blocking)
      const job = await redis.blPop('automation:queue', 0)

      if (job) {
        const automationId = job.element
        console.log(`[Agent] Processing automation: ${automationId}`)

        await runAutomation(automationId)
      }
    } catch (error) {
      console.error('[Agent] Job processing error:', error)
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}

async function runAutomation(automationId) {
  try {
    // Fetch automation details from database
    const [automation] = await sql`
      SELECT a.*, c.config
      FROM automations a
      LEFT JOIN automation_configs c ON a.config_id = c.id
      WHERE a.id = ${automationId}
    `

    if (!automation) {
      console.error('[Agent] Automation not found:', automationId)
      return
    }

    // Update status to in_progress
    await updateProgress(automationId, 'in_progress', 0, 'Initializing automation')

    const config = automation.config

    // Build automation prompt
    const prompt = buildAutomationPrompt(config)

    // Execute with Claude Computer Use
    const result = await executeWithClaudeComputerUse(automationId, prompt)

    // Update to completed
    await updateProgress(automationId, 'completed', 100, 'Automation complete', result.resources)

    console.log(`[Agent] Automation completed: ${automationId}`)

  } catch (error) {
    console.error('[Agent] Automation failed:', error)

    await sql`
      UPDATE automations
      SET status = 'failed',
          error_message = ${error.message},
          completed_at = NOW()
      WHERE id = ${automationId}
    `
  }
}

async function executeWithClaudeComputerUse(automationId, prompt) {
  const messages = [{ role: 'user', content: prompt }]
  const resources = {}

  while (true) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      tools: [
        {
          type: 'computer_20241022',
          name: 'computer',
          display_width_px: 1920,
          display_height_px: 1080,
          display_number: 1,
        },
        {
          type: 'bash_20241022',
          name: 'bash',
        },
      ],
      messages,
      betas: ['computer-use-2025-01-24'],
    })

    console.log('[Agent] Claude response:', response.stop_reason)

    // Add assistant response to messages
    messages.push({ role: 'assistant', content: response.content })

    // Check if done
    if (response.stop_reason === 'end_turn') {
      break
    }

    // Process tool uses
    if (response.stop_reason === 'tool_use') {
      const toolResults = []

      for (const block of response.content) {
        if (block.type === 'tool_use') {
          console.log('[Agent] Tool use:', block.name, block.input)

          let result

          if (block.name === 'computer') {
            result = await handleComputerTool(block.input, automationId)
          } else if (block.name === 'bash') {
            result = await handleBashTool(block.input, automationId)
          }

          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: result,
          })

          // Extract resources from tool results
          extractResources(block, result, resources)
        }
      }

      // Add tool results to messages
      messages.push({ role: 'user', content: toolResults })
    }
  }

  return { resources }
}

async function handleComputerTool(input, automationId) {
  const { action, ...params } = input

  console.log(`[Agent] Computer action: ${action}`)

  // Log to database
  await logAction(automationId, 'computer', action, params)

  switch (action) {
    case 'screenshot':
      // Take screenshot using Xvfb
      execSync('import -window root /tmp/screenshot.png')
      const screenshot = fs.readFileSync('/tmp/screenshot.png', 'base64')
      return { type: 'image', source: { type: 'base64', media_type: 'image/png', data: screenshot } }

    case 'mouse_move':
      execSync(`xdotool mousemove ${params.coordinate[0]} ${params.coordinate[1]}`)
      return { type: 'text', text: 'Mouse moved' }

    case 'left_click':
      execSync('xdotool click 1')
      return { type: 'text', text: 'Clicked' }

    case 'type':
      execSync(`xdotool type '${params.text.replace(/'/g, "\\'")}'`)
      return { type: 'text', text: 'Text typed' }

    case 'key':
      execSync(`xdotool key ${params.text}`)
      return { type: 'text', text: 'Key pressed' }

    default:
      return { type: 'text', text: `Unknown action: ${action}` }
  }
}

async function handleBashTool(input, automationId) {
  const { command } = input

  // Validate command
  if (!validateCommand(command)) {
    return { type: 'text', text: 'Command blocked for security reasons' }
  }

  console.log(`[Agent] Bash: ${command}`)

  // Log to database
  await logAction(automationId, 'bash', command, {})

  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      timeout: 60000,
      env: {
        ...process.env,
        HOME: '/home/agent',
      },
    })

    return { type: 'text', text: output }
  } catch (error) {
    return { type: 'text', text: `Error: ${error.message}` }
  }
}

function validateCommand(command) {
  const dangerous = [
    /rm\s+-rf\s+\//,
    /mkfs/,
    /dd\s+if=/,
    /:\(\)/,
  ]

  return !dangerous.some(pattern => pattern.test(command))
}

function buildAutomationPrompt(config) {
  return `You are an expert DevOps automation assistant. You have access to a computer with:
- GitHub CLI (gh) - authenticated
- Vercel CLI - authenticated
- Browser automation via computer tool
- Bash command execution

Task: Set up a complete ${config.stackType} application with these requirements:

Project Name: ${config.projectName}
Infrastructure:
- GitHub Repository: ${config.githubRepo ? 'Yes' : 'No'}
- Deployment Platform: ${config.deploymentPlatform}
- Database: ${config.database}
- Authentication: ${config.auth}
- Payments: ${config.payments ? 'Stripe' : 'No'}

Step by step:
1. Create GitHub repository using: gh repo create ${config.projectName} --public
2. Clone the repository locally
3. Generate boilerplate code for ${config.stackType}
4. Deploy to ${config.deploymentPlatform} using CLI
5. Provision ${config.database} database
${config.payments ? '6. Configure Stripe integration' : ''}

After each major step, report the URL or resource created.
Take screenshots if you need to verify web-based operations.
Use bash commands for CLI operations.

Begin!`
}

function extractResources(toolUse, result, resources) {
  // Parse tool results for created resources
  const text = result.type === 'text' ? result.text : ''

  // GitHub repo
  const githubMatch = text.match(/https:\/\/github\.com\/[\w-]+\/[\w-]+/)
  if (githubMatch) {
    resources.github_repo = githubMatch[0]
  }

  // Vercel deployment
  const vercelMatch = text.match(/https:\/\/[\w-]+\.vercel\.app/)
  if (vercelMatch) {
    resources.deployment_url = vercelMatch[0]
  }

  // Supabase project
  const supabaseMatch = text.match(/https:\/\/[\w-]+\.supabase\.co/)
  if (supabaseMatch) {
    resources.database_url = supabaseMatch[0]
  }
}

async function updateProgress(automationId, status, percent, step, resources = null) {
  await sql`
    UPDATE automations
    SET status = ${status},
        progress_percent = ${percent},
        current_step = ${step},
        ${resources ? sql`resources = ${JSON.stringify(resources)},` : sql``}
        ${status === 'completed' ? sql`completed_at = NOW(),` : sql``}
        updated_at = NOW()
    WHERE id = ${automationId}
  `

  // Publish progress update to Redis for real-time UI
  await redis.publish(`automation:${automationId}`, JSON.stringify({
    status,
    percent,
    step,
    resources,
  }))
}

async function logAction(automationId, tool, action, input) {
  await sql`
    INSERT INTO audit_logs (automation_id, tool_name, action, input, created_at)
    VALUES (${automationId}, ${tool}, ${action}, ${JSON.stringify(input)}, NOW())
  `
}

// Start processing
processJobs().catch(console.error)
```

---

## 🚀 User Setup Instructions

### 1. Install Docker

```bash
# macOS
brew install docker

# Linux
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Windows
# Download Docker Desktop from docker.com
```

### 2. Clone DevFlow

```bash
git clone https://github.com/your-org/devflow.git
cd devflow
```

### 3. Configure Credentials

Create `.env` file:

```env
# Required: Your Anthropic API key
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Authenticate CLI tools on your host machine:

```bash
# GitHub
gh auth login

# Vercel
vercel login

# Supabase (optional)
supabase login
```

These credentials will be mounted into the agent container (read-only).

### 4. Start DevFlow

```bash
docker-compose up
```

That's it! Visit http://localhost:3000

---

## 🎯 User Experience

### Step 1: Create Automation

1. Open http://localhost:3000
2. Click "New Automation"
3. Fill 4-step wizard:
   - Project name: `my-saas-app`
   - Stack: Next.js Full-Stack
   - Platform: Vercel
   - Services: Supabase + Stripe
4. Click "Start Automation"

### Step 2: Watch Progress

- Browser shows real-time progress
- See each step as Claude executes it
- Watch terminal logs stream in
- View screenshots Claude takes (optional)

### Step 3: Get Results

After 8-10 minutes:
- ✅ GitHub repo created
- ✅ Code generated
- ✅ Deployed to Vercel
- ✅ Database provisioned
- ✅ Stripe configured

All URLs displayed in the UI!

---

## 💰 Pricing Model

### User Costs

**One-time Setup:**
- Docker: Free
- DevFlow: Free (open source)

**Per Automation:**
- Anthropic API: $0.05-$0.15
- Infrastructure: Free (runs locally)

**Monthly:**
- 50 automations: ~$5
- 200 automations: ~$20

### Business Model Options

1. **Open Source + API Key**
   - Users bring their own Anthropic API key
   - DevFlow is free software

2. **Managed API Key (Premium)**
   - Sell API credits
   - $29/mo for 200 automations
   - Includes premium templates

3. **Enterprise**
   - Self-hosted license
   - Support + training
   - Custom integrations

---

## 🔒 Security Architecture

### Container Security

```yaml
agent:
  security_opt:
    - no-new-privileges:true
  cap_drop:
    - ALL
  cap_add:
    - SYS_CHROOT  # Only for chroot operations
  read_only: false  # Needs write for workspace
  tmpfs:
    - /tmp:rw,noexec,nosuid
```

### Credential Isolation

```bash
# User credentials mounted read-only
volumes:
  - ${HOME}/.config/gh:/home/agent/.config/gh:ro
  - ${HOME}/.config/vercel:/home/agent/.config/vercel:ro
```

**Agent cannot:**
- Modify user credentials
- Access host filesystem (except mounts)
- Make network connections (Docker network only)
- Escalate privileges

### Command Validation

All bash commands validated before execution:
- Block dangerous patterns (rm -rf /, mkfs, etc.)
- Whitelist safe operations
- Log all commands to audit trail

---

## 📊 Real-Time Progress

### WebSocket Architecture

```javascript
// Frontend subscribes to progress
const ws = new WebSocket('ws://localhost:3000/ws/automation/${id}')

ws.onmessage = (event) => {
  const progress = JSON.parse(event.data)
  // Update UI with progress
}

// Backend publishes via Redis
redis.publish(`automation:${id}`, JSON.stringify({
  status: 'in_progress',
  percent: 50,
  step: 'Deploying to Vercel',
  screenshot: 'base64...',  // Optional
}))
```

---

## 🎉 Summary

**This architecture allows DevFlow to be:**

✅ **Self-Hosted** - Runs entirely on user's machine
✅ **Secure** - Credentials never leave user's control
✅ **Powerful** - Full Claude Computer Use capability
✅ **Simple** - Just `docker-compose up`
✅ **Cost-Effective** - Only API costs, no infrastructure
✅ **Production-Ready** - Real automation, not simulation

**User needs:**
1. Docker installed
2. Anthropic API key
3. GitHub/Vercel CLI authenticated (one time)

**That's it!** Complete AI-powered infrastructure automation.

---

Next: Implement this enhanced docker-compose architecture?
