# Claude Computer Use Architecture for DevFlow

**Document Version**: 1.0.0
**Date**: January 5, 2026
**Status**: Designed (Not Yet Implemented)

---

## Executive Summary

This document outlines the complete architecture for integrating Claude's computer use capability into DevFlow to enable secure, compliant desktop automation for infrastructure provisioning.

**Key Findings**:
- ✅ No local installation required - runs entirely on backend
- ✅ Docker-safe with proper hardening
- ✅ 100% compliance achievable through multi-layer security
- ✅ Credential security via proxy pattern
- ✅ Production-ready reference implementation available

---

## What is Claude Computer Use?

Claude's **computer use** is a beta feature that enables Claude to interact with desktop environments by:

- **Screenshot capture**: Viewing the current screen state
- **Mouse control**: Clicking, dragging, moving the cursor
- **Keyboard input**: Typing text and executing keyboard shortcuts
- **Desktop automation**: Interacting with any application or interface

**Current Status** (January 2026):
- Beta feature requiring beta headers
- Available in: Claude Opus 4.5, Sonnet 4.5, Haiku 4.5, Opus 4.1

**Available Actions**:
- **Basic**: screenshot, left_click, type, key, mouse_move
- **Enhanced** (Sonnet 4.5+): scroll, left_click_drag, right_click, double_click, triple_click, left_mouse_down/up, hold_key, wait
- **Advanced** (Opus 4.5): zoom action for detailed screen region inspection

---

## Architecture Overview

### Core Architecture Flow

```
User Request → DevFlow Frontend
  ↓
API Gateway (authentication, validation)
  ↓
Task Queue (Redis/RabbitMQ)
  ↓
Worker Pool (Docker Containers)
  ├─ Agent Container
  │  ├─ Claude Agent SDK
  │  ├─ Computer Use Tool
  │  ├─ Virtual Display (Xvfb)
  │  ├─ Browser automation
  │  ├─ CLI tools (gh, vercel, supabase)
  │  └─ Network: NONE (isolated)
  │     ↓ Unix Socket IPC
  │
  └─ Proxy Service (Host)
     ├─ Domain allowlist
     ├─ Credential injection
     ├─ Traffic logging
     └─ Request validation
        ↓
External Services (GitHub, Vercel, Supabase, Stripe)
```

### Key Architectural Principles

1. **Complete Backend Execution**: No client-side software required
2. **Container Isolation**: Each task runs in ephemeral, isolated container
3. **Zero Network Access**: Containers have `--network none`
4. **Credential Security**: API keys never exposed to agent
5. **Audit Everything**: Complete logging for compliance

---

## Deployment Architecture

```yaml
┌─────────────────────────────────────────────────────────────┐
│                   DevFlow SaaS Platform                      │
├─────────────────────────────────────────────────────────────┤
│ Frontend (Next.js)                                           │
│ ├─ Landing page (current)                                   │
│ ├─ Dashboard                                                 │
│ └─ Progress tracking UI                                      │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ API Gateway                                                  │
│ ├─ Authentication (Supabase)                                │
│ ├─ Rate limiting                                             │
│ ├─ Request validation                                        │
│ └─ User authorization                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ Task Queue (Redis/RabbitMQ)                                 │
│ ├─ Job queuing                                              │
│ ├─ Priority management                                       │
│ └─ Status tracking                                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ Worker Pool (Kubernetes/Docker Swarm)                        │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Hardened Agent Container (Ephemeral)                  │  │
│  │ ┌─────────────────────────────────────────────────┐   │  │
│  │ │ Security Configuration:                         │   │  │
│  │ │ ├─ --cap-drop ALL                               │   │  │
│  │ │ ├─ --security-opt no-new-privileges             │   │  │
│  │ │ ├─ --read-only (immutable filesystem)           │   │  │
│  │ │ ├─ --network none (no internet)                 │   │  │
│  │ │ ├─ --memory 2g (resource limit)                 │   │  │
│  │ │ ├─ --cpus 2                                     │   │  │
│  │ │ ├─ --pids-limit 100                             │   │  │
│  │ │ ├─ --user 1000:1000 (non-root)                  │   │  │
│  │ │ └─ --tmpfs /tmp:rw,noexec,nosuid                │   │  │
│  │ └─────────────────────────────────────────────────┘   │  │
│  │                                                         │  │
│  │ Container Contents:                                    │  │
│  │ ├─ Claude Agent SDK                                    │  │
│  │ ├─ Computer Use Tool                                   │  │
│  │ ├─ Virtual Display (Xvfb)                              │  │
│  │ ├─ Browser (Chromium)                                  │  │
│  │ ├─ CLI Tools:                                          │  │
│  │ │  ├─ gh (GitHub CLI)                                  │  │
│  │ │  ├─ vercel (Vercel CLI)                              │  │
│  │ │  ├─ supabase (Supabase CLI)                          │  │
│  │ │  └─ stripe (Stripe CLI)                              │  │
│  │ └─ Unix Socket Mount:                                  │  │
│  │    └─ /var/run/proxy.sock (read-only)                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           │ IPC via Unix Socket              │
│                           ↓                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Proxy Service (Host Machine)                          │  │
│  │ ├─ Unix socket server                                 │  │
│  │ ├─ Domain allowlist:                                  │  │
│  │ │  ├─ github.com                                      │  │
│  │ │  ├─ api.github.com                                  │  │
│  │ │  ├─ vercel.com                                      │  │
│  │ │  ├─ api.vercel.com                                  │  │
│  │ │  ├─ supabase.com                                    │  │
│  │ │  ├─ api.supabase.io                                 │  │
│  │ │  └─ api.stripe.com                                  │  │
│  │ ├─ Credential injection (server-side)                 │  │
│  │ ├─ Traffic logging (audit trail)                      │  │
│  │ ├─ Request validation                                 │  │
│  │ └─ Response filtering                                 │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ Credential Store (HashiCorp Vault / AWS Secrets Manager)    │
│ ├─ GitHub Personal Access Tokens                            │
│ ├─ Vercel API Keys                                          │
│ ├─ Supabase API Keys                                        │
│ ├─ Stripe API Keys                                          │
│ └─ User-provided credentials (encrypted)                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ Audit Logging System                                         │
│ ├─ All actions performed                                    │
│ ├─ Screenshots (optional)                                   │
│ ├─ API calls made                                           │
│ ├─ Errors and exceptions                                    │
│ └─ Timestamps and user IDs                                  │
└─────────────────────────────────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ External Services (via Proxy)                                │
│ ├─ GitHub API (create repos, push code)                     │
│ ├─ Vercel API (deploy projects)                             │
│ ├─ Supabase API (provision databases)                       │
│ └─ Stripe API (configure payments)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Implementation

### Layer 1: Container Isolation

**Hardened Docker Configuration**:

```bash
docker run \
  --name devflow-agent-$TASK_ID \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --security-opt seccomp=/etc/devflow/seccomp-profile.json \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=100m \
  --tmpfs /home/agent:rw,noexec,nosuid,size=500m \
  --network none \
  --memory 2g \
  --cpus 2 \
  --pids-limit 100 \
  --user 1000:1000 \
  -v /var/run/proxy.sock:/var/run/proxy.sock:ro \
  -v /etc/devflow/allowed-commands.txt:/etc/allowed-commands.txt:ro \
  -e TASK_ID=$TASK_ID \
  -e USER_ID=$USER_ID \
  devflow-agent:latest
```

**Security Options Explained**:

| Option | Purpose | Security Benefit |
|--------|---------|-----------------|
| `--cap-drop ALL` | Removes all Linux capabilities | Prevents privilege escalation, no NET_ADMIN, SYS_ADMIN |
| `--security-opt no-new-privileges` | Blocks setuid/setgid | Cannot gain more privileges than parent process |
| `--read-only` | Makes root filesystem immutable | Agent cannot persist malicious code |
| `--tmpfs /tmp:noexec,nosuid` | Provides writable temp space | Prevents execution of uploaded binaries |
| `--network none` | Removes all network interfaces | Zero network access, can't exfiltrate data |
| `--memory 2g` | Limits memory usage | Prevents resource exhaustion attacks |
| `--cpus 2` | Limits CPU usage | Prevents CPU exhaustion |
| `--pids-limit 100` | Limits process count | Prevents fork bomb attacks |
| `--user 1000:1000` | Runs as non-root user | Reduces attack surface |

### Layer 2: Credential Management

**Proxy Pattern Implementation**:

```typescript
// devflow-proxy-service/src/proxy.ts
import { createServer } from 'http';
import { Server } from 'socket.io';
import { VaultClient } from './vault';

class DevFlowProxy {
  private vault: VaultClient;
  private allowedDomains: string[];

  constructor() {
    this.vault = new VaultClient(process.env.VAULT_URL);
    this.allowedDomains = [
      'github.com',
      'api.github.com',
      'vercel.com',
      'api.vercel.com',
      'supabase.com',
      'api.supabase.io',
      'stripe.com',
      'api.stripe.com'
    ];
  }

  async handleRequest(req: ProxyRequest): Promise<ProxyResponse> {
    // Step 1: Validate domain allowlist
    const domain = new URL(req.url).hostname;
    if (!this.allowedDomains.includes(domain)) {
      await this.logBlocked(req, 'Domain not in allowlist');
      throw new Error(`Domain ${domain} not allowed`);
    }

    // Step 2: Retrieve credentials from vault
    const credentials = await this.vault.getCredentials(
      req.userId,
      req.service
    );

    // Step 3: Inject credentials into request
    const headers = {
      ...req.headers,
      'Authorization': `Bearer ${credentials.token}`,
      'User-Agent': 'DevFlow-Automation/1.0'
    };

    // Step 4: Log request for audit
    await this.auditLog.record({
      timestamp: new Date(),
      userId: req.userId,
      taskId: req.taskId,
      service: req.service,
      method: req.method,
      url: req.url,
      status: 'pending'
    });

    // Step 5: Make request to external service
    try {
      const response = await fetch(req.url, {
        method: req.method,
        headers: headers,
        body: req.body
      });

      // Step 6: Log successful response
      await this.auditLog.update(req.taskId, {
        status: 'success',
        statusCode: response.status
      });

      // Step 7: Return sanitized response (no credentials)
      return {
        statusCode: response.status,
        headers: this.sanitizeHeaders(response.headers),
        body: await response.text()
      };
    } catch (error) {
      // Step 8: Log error
      await this.auditLog.update(req.taskId, {
        status: 'error',
        error: error.message
      });
      throw error;
    }
  }

  private sanitizeHeaders(headers: Headers): Record<string, string> {
    // Remove sensitive headers before returning to agent
    const sanitized: Record<string, string> = {};
    const allowedHeaders = ['content-type', 'content-length', 'date'];

    headers.forEach((value, key) => {
      if (allowedHeaders.includes(key.toLowerCase())) {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  private async logBlocked(req: ProxyRequest, reason: string) {
    await this.auditLog.record({
      timestamp: new Date(),
      userId: req.userId,
      taskId: req.taskId,
      action: 'blocked_request',
      reason: reason,
      url: req.url
    });
  }
}
```

**Key Security Properties**:
- ✅ Credentials NEVER enter agent container
- ✅ Agent only sees successful API responses
- ✅ All requests logged before execution
- ✅ Domain allowlist prevents data exfiltration
- ✅ Response sanitization removes sensitive headers

### Layer 3: Permission Hooks

**Permission Validation System**:

```typescript
// devflow-backend/src/hooks/permission-hooks.ts
import { HookInput, HookOutput } from '@anthropic-ai/agent-sdk';

export async function validateToolUse(input: HookInput): Promise<HookOutput> {
  const { tool_name, tool_input, context } = input;

  // Hook 1: Bash Command Validation
  if (tool_name === 'Bash') {
    return await validateBashCommand(tool_input.command, context);
  }

  // Hook 2: Web Fetch Validation
  if (tool_name === 'WebFetch') {
    return await validateWebFetch(tool_input.url, context);
  }

  // Hook 3: File Operation Validation
  if (['Write', 'Edit'].includes(tool_name)) {
    return await validateFileOperation(tool_input, context);
  }

  // Default: Allow
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'allow'
    }
  };
}

async function validateBashCommand(
  command: string,
  context: any
): Promise<HookOutput> {
  // Block list of dangerous commands
  const dangerousPatterns = [
    /rm\s+-rf/,              // Recursive delete
    /dd\s+if=/,              // Disk operations
    /mkfs/,                  // Format filesystem
    /:\(\)\{\s*:\|:&\s*\};:/, // Fork bomb
    /curl.*\|\s*bash/,       // Pipe to bash
    /wget.*\|\s*sh/,         // Pipe to shell
    /nc\s+-l/,               // Netcat listener
    /chmod\s+777/,           // Insecure permissions
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(command)) {
      await logSecurityEvent({
        event: 'dangerous_command_blocked',
        command: command,
        userId: context.userId,
        taskId: context.taskId
      });

      return {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: `Dangerous command pattern detected: ${command}`
        }
      };
    }
  }

  // Production deployment requires human approval
  if (command.includes('--prod') || command.includes('--production')) {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask_user',
        permissionDecisionReason: 'Production deployment requires approval',
        permissionRequestMessage: `Approve production deployment?\nCommand: ${command}`
      }
    };
  }

  // Allow command
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'allow'
    }
  };
}

async function validateWebFetch(
  url: string,
  context: any
): Promise<HookOutput> {
  const allowedDomains = [
    'github.com',
    'vercel.com',
    'supabase.com',
    'stripe.com',
    // Documentation sites
    'docs.github.com',
    'vercel.com/docs',
    'supabase.com/docs'
  ];

  const domain = new URL(url).hostname;

  if (!allowedDomains.some(allowed => domain.endsWith(allowed))) {
    await logSecurityEvent({
      event: 'blocked_domain',
      url: url,
      userId: context.userId,
      taskId: context.taskId
    });

    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `Domain ${domain} not in allowlist`
      }
    };
  }

  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'allow'
    }
  };
}

async function validateFileOperation(
  toolInput: any,
  context: any
): Promise<HookOutput> {
  const { file_path } = toolInput;

  // Block writes to sensitive paths
  const forbiddenPaths = [
    '/etc/',
    '/usr/',
    '/bin/',
    '/sbin/',
    '/root/',
    '/.ssh/',
  ];

  if (forbiddenPaths.some(path => file_path.startsWith(path))) {
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `Cannot write to system path: ${file_path}`
      }
    };
  }

  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'allow'
    }
  };
}
```

### Layer 4: Audit Logging

**Comprehensive Audit System**:

```typescript
// devflow-backend/src/services/audit-log.ts
interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  taskId: string;
  eventType: 'tool_use' | 'api_call' | 'security_event' | 'error';
  toolName?: string;
  toolInput?: any;
  toolOutput?: any;
  apiService?: string;
  apiEndpoint?: string;
  screenshot?: string;  // Base64 encoded (optional)
  status: 'success' | 'error' | 'blocked' | 'pending';
  errorMessage?: string;
  metadata?: Record<string, any>;
}

class AuditLogService {
  async recordToolUse(entry: {
    userId: string;
    taskId: string;
    toolName: string;
    toolInput: any;
    toolOutput: any;
    status: 'success' | 'error';
    screenshot?: string;
  }): Promise<void> {
    await db.auditLogs.insert({
      id: generateId(),
      timestamp: new Date(),
      eventType: 'tool_use',
      ...entry
    });
  }

  async recordAPICall(entry: {
    userId: string;
    taskId: string;
    service: string;
    endpoint: string;
    method: string;
    statusCode: number;
    status: 'success' | 'error';
  }): Promise<void> {
    await db.auditLogs.insert({
      id: generateId(),
      timestamp: new Date(),
      eventType: 'api_call',
      apiService: entry.service,
      apiEndpoint: entry.endpoint,
      metadata: {
        method: entry.method,
        statusCode: entry.statusCode
      },
      ...entry
    });
  }

  async recordSecurityEvent(entry: {
    userId: string;
    taskId: string;
    event: string;
    reason: string;
    command?: string;
    url?: string;
  }): Promise<void> {
    await db.auditLogs.insert({
      id: generateId(),
      timestamp: new Date(),
      eventType: 'security_event',
      status: 'blocked',
      metadata: {
        event: entry.event,
        reason: entry.reason,
        command: entry.command,
        url: entry.url
      },
      ...entry
    });
  }

  async getTaskAuditTrail(taskId: string): Promise<AuditLogEntry[]> {
    return await db.auditLogs
      .where({ taskId })
      .orderBy('timestamp', 'asc')
      .getAll();
  }

  async getUserAuditTrail(
    userId: string,
    limit: number = 100
  ): Promise<AuditLogEntry[]> {
    return await db.auditLogs
      .where({ userId })
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .getAll();
  }

  async exportComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceReport> {
    const logs = await db.auditLogs
      .whereBetween('timestamp', [startDate, endDate])
      .getAll();

    return {
      period: { startDate, endDate },
      totalEvents: logs.length,
      toolUsage: this.aggregateByTool(logs),
      securityEvents: logs.filter(l => l.eventType === 'security_event'),
      errorRate: this.calculateErrorRate(logs),
      userActivity: this.aggregateByUser(logs)
    };
  }
}
```

---

## Cost Analysis

### Token Usage per Task

**Typical automation task breakdown**:
- System prompt: ~500 tokens
- Tool definitions: ~700 tokens
- Screenshots: ~300 tokens each (1 per action)
- Agent loop: 5-10 iterations
- **Total: 8,000-15,000 tokens per task**

### Pricing Calculation

**Claude Sonnet 4.5 (Recommended)**:
- Input: $3 per million tokens
- Output: $15 per million tokens
- Average task: 10,000 input + 2,000 output
- **Cost per task: $0.03 + $0.03 = $0.06**

**Infrastructure costs**:
- Container runtime: $0.01-0.05 per task (5-10 min)
- Proxy service: Negligible (always running)
- Database/storage: < $0.01 per task
- **Total infrastructure: ~$0.03 per task**

**Total cost per automation: $0.09-$0.12**

### Pricing Strategy

**Free Tier**:
- 1 automation per month
- Cost: $0.10
- Margin: -$0.10 (acquisition cost)

**Pro Tier ($29/month)**:
- Unlimited automations
- Average usage: 20-50 automations/month
- Cost: $2.00-$6.00
- **Margin: $23-$27 per customer**

---

## Implementation Guide

### Phase 1: Docker Container Setup (Week 1)

1. **Create base image**:
```dockerfile
# Dockerfile.agent
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    chromium \
    xvfb \
    git \
    curl

# Install CLI tools
RUN npm install -g \
    @anthropic-ai/agent-sdk \
    @supabase/cli \
    vercel \
    stripe

# Create non-root user
RUN addgroup -g 1000 agent && \
    adduser -D -u 1000 -G agent agent

# Set up workspace
WORKDIR /workspace
RUN chown agent:agent /workspace

# Switch to non-root user
USER agent

# Copy agent code
COPY --chown=agent:agent ./agent-code /workspace

# Entry point
CMD ["node", "/workspace/index.js"]
```

2. **Test container isolation**:
```bash
# Run test container
docker run --rm \
  --cap-drop ALL \
  --network none \
  --read-only \
  --tmpfs /tmp:size=100m \
  devflow-agent:latest \
  node -e "console.log('Container isolated')"
```

### Phase 2: Proxy Service (Week 1)

1. **Implement Unix socket server**:
```typescript
// proxy-service/src/server.ts
import net from 'net';
import { ProxyHandler } from './proxy-handler';

const SOCKET_PATH = '/var/run/proxy.sock';
const proxy = new ProxyHandler();

const server = net.createServer((socket) => {
  socket.on('data', async (data) => {
    const request = JSON.parse(data.toString());
    const response = await proxy.handleRequest(request);
    socket.write(JSON.stringify(response));
  });
});

server.listen(SOCKET_PATH);
console.log(`Proxy server listening on ${SOCKET_PATH}`);
```

2. **Test credential injection**:
```typescript
// Test script
const request = {
  service: 'github',
  method: 'POST',
  url: 'https://api.github.com/user/repos',
  body: JSON.stringify({ name: 'test-repo' })
};

const response = await proxy.handleRequest(request);
console.log('Repo created:', response.body);
// Agent never saw the GitHub token!
```

### Phase 3: Permission Hooks (Week 2)

1. **Implement hook system**:
```typescript
// agent/src/agent.ts
import { query, ClaudeAgentOptions } from '@anthropic-ai/agent-sdk';
import { validateToolUse } from './hooks/permissions';

const options: ClaudeAgentOptions = {
  hooks: {
    PreToolUse: [
      {
        matcher: '*',  // Apply to all tools
        hooks: [validateToolUse]
      }
    ]
  }
};

const result = await query(
  prompt: "Create a GitHub repo called 'my-project'",
  options: options
);
```

2. **Test permission blocking**:
```typescript
// Should be blocked
await query("Run: rm -rf /");
// Expected: Hook blocks with "Dangerous command pattern detected"

// Should require approval
await query("Deploy to production: vercel --prod");
// Expected: Hook asks user for approval
```

### Phase 4: Integration Testing (Week 2)

1. **End-to-end test**:
```typescript
// test/e2e/github-automation.test.ts
test('Create GitHub repo via computer use', async () => {
  // Submit task
  const task = await api.post('/api/automation/create', {
    type: 'github_repo',
    name: 'test-repo-' + Date.now()
  });

  // Wait for completion
  const result = await waitForTask(task.id, { timeout: 60000 });

  // Verify
  expect(result.status).toBe('success');
  expect(result.resources.github_repo).toMatch(/github\.com/);

  // Verify audit log
  const auditLog = await api.get(`/api/audit-log/${task.id}`);
  expect(auditLog.entries.length).toBeGreaterThan(0);
  expect(auditLog.entries).toContainEqual(
    expect.objectContaining({
      toolName: 'Bash',
      status: 'success'
    })
  );
});
```

---

## Security Checklist

| Security Requirement | Status | Implementation | Verification |
|---------------------|--------|----------------|--------------|
| Container isolation | ✅ Designed | `--cap-drop ALL`, `--network none` | Security audit |
| Credential security | ✅ Designed | Proxy injection pattern | Penetration test |
| Network restrictions | ✅ Designed | Domain allowlist | Traffic analysis |
| Audit logging | ✅ Designed | All actions logged | Compliance review |
| Permission system | ✅ Designed | PreToolUse hooks | Security test |
| Resource limits | ✅ Designed | Memory/CPU/PID limits | Load testing |
| Immutable infrastructure | ✅ Designed | Read-only filesystem | Container inspection |
| Non-root execution | ✅ Designed | `--user 1000:1000` | Process audit |
| Incident response | ✅ Designed | Kill switch, termination | Disaster recovery test |
| Monitoring | ✅ Designed | Health checks, alerts | Monitoring setup |

---

## References

### Official Documentation
- [Claude Computer Use Tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool.md)
- [Securely Deploying AI Agents](https://platform.claude.com/docs/en/agent-sdk/secure-deployment.md)
- [Agent SDK Permissions](https://platform.claude.com/docs/en/agent-sdk/permissions.md)
- [Agent SDK Hooks](https://platform.claude.com/docs/en/agent-sdk/hooks.md)

### Reference Implementation
- [Anthropic Computer Use Demo](https://github.com/anthropics/anthropic-quickstarts/tree/main/computer-use-demo)

### Security Resources
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Container Hardening Guide](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)

---

**Document Status**: Architecture Complete, Implementation Pending
**Next Step**: Begin Phase 1 implementation (Docker container setup)
**Timeline**: 2-3 weeks for full implementation

Built with security-first principles for DevFlow 🔒
