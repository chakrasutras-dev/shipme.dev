# 🤖 Claude Computer Use Setup Guide

**Complete guide to enable Claude Desktop computer use for DevFlow automation**

---

## 📋 Overview

Claude Computer Use allows Claude to interact with your desktop by:
- Taking screenshots to see what's on screen
- Controlling the mouse (clicking, scrolling, dragging)
- Using the keyboard (typing, shortcuts)
- Running terminal commands
- Interacting with any application or browser

**For DevFlow**, this enables:
- Automating GitHub repo creation via web interface
- Deploying to Vercel through their dashboard
- Provisioning Supabase databases
- Configuring Stripe payments
- All without exposing your credentials!

---

## 🎯 Two Deployment Options

### Option 1: API-Based (Recommended for SaaS)

Use the Anthropic API directly from your backend. **No local installation required.**

**Pros:**
- ✅ Runs entirely on your server
- ✅ Users don't install anything
- ✅ Full control over execution
- ✅ Scalable to multiple users

**Cons:**
- ⚠️ Requires backend infrastructure
- ⚠️ Computer use API costs apply

### Option 2: Claude Desktop App (For Personal Use)

Use Claude Desktop on your local machine with MCP server.

**Pros:**
- ✅ Free for personal use
- ✅ Direct desktop access
- ✅ Easy to test and debug

**Cons:**
- ⚠️ Requires app installation
- ⚠️ Only works on your machine
- ⚠️ Not suitable for multi-user SaaS

---

## 🚀 Setup: Option 1 (API-Based - DevFlow Production)

### Step 1: Get Anthropic API Key

1. Visit https://console.anthropic.com
2. Sign up or log in
3. Go to **API Keys** section
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)

**Add to `.env.local`:**
```env
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

### Step 2: Install Dependencies

The automation engine already has the SDK:

```bash
cd automation-engine
npm install  # Already has @anthropic-ai/sdk
```

### Step 3: Enable Computer Use Beta Header

The automation engine code already includes this, but here's how it works:

```javascript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const response = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 4096,
  tools: [{
    type: 'computer_20241022', // Computer use tool
    name: 'computer',
    display_width_px: 1920,
    display_height_px: 1080,
    display_number: 1,
  }],
  messages: [{
    role: 'user',
    content: 'Create a GitHub repository called my-awesome-app',
  }],
  betas: ['computer-use-2025-01-24'], // Enable beta feature
})
```

### Step 4: Run the Automation Engine

**With Docker (Recommended):**

```bash
# Build the hardened container
cd automation-engine
docker build -t devflow-agent:latest .

# Run with security isolation
docker run \
  --name devflow-agent \
  --cap-drop ALL \
  --network none \
  --read-only \
  --user 1000:1000 \
  --memory 2g \
  --cpus 2 \
  --tmpfs /tmp:rw,noexec,nosuid,size=100m \
  -v /var/run/proxy.sock:/var/run/proxy.sock:ro \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  -e AUTOMATION_ID=your-automation-id \
  devflow-agent:latest
```

**Without Docker (For Testing):**

```bash
cd automation-engine
node index.js <automation-id>
```

### Step 5: Authenticate CLI Tools

The automation needs access to service CLIs:

**GitHub:**
```bash
gh auth login
# Follow prompts to authenticate
```

**Vercel:**
```bash
vercel login
# Opens browser for authentication
```

**Supabase:**
```bash
npm install -g supabase
supabase login
```

### Step 6: Test the Complete Flow

1. Visit http://localhost:3000/new
2. Fill out the 4-step wizard
3. Click "Start Automation"
4. Get the automation ID from the response
5. Run the engine:
   ```bash
   cd automation-engine
   node index.js <automation-id>
   ```
6. Watch the automation progress at http://localhost:3000/automation/<id>

---

## 🖥️ Setup: Option 2 (Claude Desktop - Personal Use)

### Step 1: Install Claude Desktop

1. Download from https://claude.ai/download
2. Install the application
3. Sign in with your Anthropic account

### Step 2: Enable Computer Use

Claude Desktop has built-in computer use capability. No additional setup needed!

### Step 3: Create MCP Server for DevFlow

Create a custom MCP server that Claude Desktop can use:

**File: `devflow-mcp-server/index.js`**

```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const server = new Server(
  {
    name: 'devflow-automation',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
)

// Define tools for DevFlow automation
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'create_github_repo',
        description: 'Create a new GitHub repository',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Repository name' },
            private: { type: 'boolean', description: 'Make repository private' },
          },
          required: ['name'],
        },
      },
      {
        name: 'deploy_to_vercel',
        description: 'Deploy project to Vercel',
        inputSchema: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Project path' },
            name: { type: 'string', description: 'Project name' },
          },
          required: ['path', 'name'],
        },
      },
    ],
  }
})

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params

  if (name === 'create_github_repo') {
    const visibility = args.private ? '--private' : '--public'
    const { stdout, stderr } = await execAsync(
      `gh repo create ${args.name} ${visibility} --confirm`
    )
    return {
      content: [{ type: 'text', text: stdout || stderr }],
    }
  }

  if (name === 'deploy_to_vercel') {
    const { stdout, stderr } = await execAsync(
      `cd ${args.path} && vercel --prod --yes --name ${args.name}`
    )
    return {
      content: [{ type: 'text', text: stdout || stderr }],
    }
  }

  throw new Error(`Unknown tool: ${name}`)
})

const transport = new StdioServerTransport()
await server.connect(transport)
```

### Step 4: Configure Claude Desktop

**File: `~/Library/Application Support/Claude/claude_desktop_config.json`** (macOS)

```json
{
  "mcpServers": {
    "devflow": {
      "command": "node",
      "args": ["/path/to/devflow-mcp-server/index.js"]
    }
  }
}
```

### Step 5: Use in Claude Desktop

Open Claude Desktop and type:

```
Create a GitHub repository called "my-awesome-app" and deploy it to Vercel
```

Claude will use the MCP server tools to automate the task!

---

## 🔒 Security Best Practices

### 1. Container Isolation

Always run automation in hardened containers:

```bash
# Drop all capabilities
--cap-drop ALL

# No network access (use proxy)
--network none

# Read-only filesystem
--read-only

# Non-root user
--user 1000:1000

# Resource limits
--memory 2g --cpus 2 --pids-limit 100
```

### 2. Credential Management

**NEVER expose credentials to the agent:**

```javascript
// ❌ BAD: Don't do this
const ghToken = process.env.GITHUB_TOKEN
execSync(`gh auth login --with-token <<< "${ghToken}"`)

// ✅ GOOD: Use proxy pattern
// Agent makes request to proxy
// Proxy injects credentials server-side
const response = await proxyRequest({
  service: 'github',
  endpoint: '/repos',
  method: 'POST',
  body: { name: 'my-repo' }
})
```

### 3. Command Validation

Block dangerous commands before execution:

```javascript
const DANGEROUS_PATTERNS = [
  /rm\s+-rf/,           // Recursive delete
  /dd\s+if=/,           // Disk operations
  /mkfs/,               // Format filesystem
  /:\(\)\{\s*:\|:&\s*\};:/, // Fork bomb
  /curl.*\|\s*bash/,    // Pipe to bash
]

function validateCommand(cmd) {
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(cmd)) {
      throw new Error(`Dangerous command blocked: ${cmd}`)
    }
  }
  return true
}
```

### 4. Audit Everything

Log all actions for compliance:

```javascript
await supabase.from('audit_logs').insert({
  user_id: userId,
  automation_id: automationId,
  event_type: 'tool_use',
  tool_name: 'Bash',
  tool_input: { command },
  tool_output: { output },
  status: 'success',
  timestamp: new Date(),
})
```

---

## 💰 Cost Estimation

### API Usage Costs

**Claude Sonnet 4.5 Pricing:**
- Input: $3 per million tokens
- Output: $15 per million tokens

**Typical Automation:**
- System prompt: ~500 tokens
- Tool definitions: ~700 tokens
- Screenshots: ~300 tokens each (1 per action)
- 5-10 iterations: ~10,000-15,000 total tokens

**Cost per automation: $0.05-$0.15**

### Infrastructure Costs

**Docker container runtime:**
- AWS EC2 t3.small: $0.0208/hour
- 10-minute automation: ~$0.003

**Total cost per automation: ~$0.06-$0.20**

**Monthly cost (100 automations):** $6-$20

---

## 🧪 Testing Computer Use

### Test 1: Simple Command

```bash
cd automation-engine

node -e "
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const response = await client.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 1024,
  tools: [{
    type: 'computer_20241022',
    name: 'computer',
    display_width_px: 1920,
    display_height_px: 1080,
  }],
  messages: [{ role: 'user', content: 'Take a screenshot' }],
  betas: ['computer-use-2025-01-24'],
})

console.log(response)
"
```

### Test 2: GitHub Automation

```bash
# Ensure gh CLI is authenticated
gh auth status

# Run automation
node index.js test-automation-id
```

### Test 3: Full Stack Deployment

```bash
# Create test automation via API
curl -X POST http://localhost:3000/api/automation/create \
  -H "Content-Type: application/json" \
  -d '{
    "stack_type": "nextjs_fullstack",
    "config": {
      "projectName": "test-app",
      "githubRepo": true,
      "deploymentPlatform": "vercel",
      "database": "supabase",
      "payments": true
    }
  }'

# Get automation ID from response
# Run engine
node automation-engine/index.js <automation-id>
```

---

## 🐛 Troubleshooting

### Issue: "Computer use requires beta header"

**Solution:** Make sure you're using the correct beta header:
```javascript
betas: ['computer-use-2025-01-24']
```

### Issue: "gh: command not found"

**Solution:** Install GitHub CLI:
```bash
# macOS
brew install gh

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### Issue: "Vercel authentication required"

**Solution:** Run `vercel login` and authenticate through browser

### Issue: "Screenshot capture failed"

**Solution:** Ensure virtual display is running:
```bash
# Start Xvfb (virtual display)
Xvfb :99 -screen 0 1920x1080x24 &
export DISPLAY=:99
```

### Issue: "Command blocked by security"

**Solution:** Check the dangerous command patterns in the automation engine. If the command is safe, add it to the allowlist.

---

## 📚 Additional Resources

- [Anthropic Computer Use Docs](https://docs.anthropic.com/claude/docs/computer-use)
- [Claude API Reference](https://docs.anthropic.com/claude/reference)
- [MCP Server Guide](https://modelcontextprotocol.io/docs)
- [GitHub CLI Docs](https://cli.github.com/manual/)
- [Vercel CLI Docs](https://vercel.com/docs/cli)

---

## ✅ Quick Checklist

Before running production automations:

- [ ] Anthropic API key added to `.env.local`
- [ ] Supabase project created and configured
- [ ] Database schema applied
- [ ] GitHub CLI authenticated (`gh auth status`)
- [ ] Vercel CLI authenticated (`vercel whoami`)
- [ ] Docker installed and running
- [ ] Proxy service started
- [ ] Automation engine tested
- [ ] Security settings reviewed
- [ ] Audit logging verified

---

**You're now ready to enable Claude Computer Use for DevFlow!** 🎉

For demo mode (no setup required), just start the automation and it will simulate the process.
For production mode, follow the steps above to enable real automation.
