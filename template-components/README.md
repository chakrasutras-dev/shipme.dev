# ShipMe Starter Template - Phase 2 Components

This directory contains all the components needed for the `shipme-starter-template` repository that will be created in Phase 2.

## 📁 Directory Structure

```
template-components/
├── .devcontainer/
│   ├── devcontainer.json       # VS Code dev container configuration
│   └── post-create.sh          # Post-creation setup script
├── .shipme/
│   ├── project.json.template   # Project configuration template
│   └── claude-instructions.md  # Instructions for Claude Code
├── mcp-servers/
│   ├── github/
│   │   ├── index.ts           # GitHub MCP server implementation
│   │   └── types.ts           # TypeScript type definitions
│   ├── shared/
│   │   └── secret-vault.ts    # Encrypted credential storage
│   ├── package.json           # MCP servers dependencies
│   └── tsconfig.json          # TypeScript configuration
├── database/
│   └── schema.sql             # Example database schema
└── README.md                  # This file
```

## 🚀 Phase 2 Status

### Completed ✅
- ✅ devcontainer.json configuration with Claude Code extension
- ✅ post-create.sh setup script
- ✅ GitHub MCP server (adapted from v1.0 code)
- ✅ Secret Vault implementation with AES-256 encryption
- ✅ Claude instructions for automated provisioning
- ✅ Project configuration template
- ✅ Example database schema

### Pending ⏳
- ⏳ Create actual `shipme-starter-template` repository on GitHub
- ⏳ Move these components to the template repository
- ⏳ Update Codespace launcher to inject project.json
- ⏳ Test end-to-end Codespace creation flow

## 📋 Next Steps

### 1. Create Template Repository
```bash
# On GitHub, create new repository: shipme-starter-template
# Then copy these components to the new repo
```

### 2. Copy Components
```bash
# Copy all files from template-components/ to shipme-starter-template/
cp -r template-components/.devcontainer shipme-starter-template/
cp -r template-components/.shipme shipme-starter-template/
cp -r template-components/mcp-servers shipme-starter-template/
cp -r template-components/database shipme-starter-template/
```

### 3. Add Next.js Starter Code
```bash
cd shipme-starter-template
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
```

### 4. Configure Package.json
Add MCP server build scripts to the main package.json:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "mcp:build": "cd mcp-servers && npm run build"
  }
}
```

## 🔧 How It Works

### Codespace Launch Flow

1. **User clicks "Launch Environment" on shipme.dev**
   - `/api/launch-codespace` creates repo from template
   - Injects `.shipme/project.json` with user's project config

2. **Codespace opens with dev container**
   - `devcontainer.json` loads Claude Code extension
   - Configures GitHub MCP server
   - Runs `post-create.sh` to install dependencies

3. **Claude Code starts provisioning**
   - Reads `.shipme/project.json`
   - Follows instructions in `.shipme/claude-instructions.md`
   - Uses GitHub MCP to provision infrastructure
   - Stores credentials in secret vault

4. **User gets working environment**
   - GitHub repository created and configured
   - Dependencies installed
   - Development server ready to run

## 🛠️ MCP Servers

### GitHub MCP Server
**Tools:**
- `create_repository` - Create GitHub repos
- `create_secret` - Add encrypted repo secrets
- `push_files` - Push code to repository

**Features:**
- Template repository support
- Proper secret encryption with libsodium
- Atomic git operations

### Secret Vault
**Features:**
- AES-256-CBC encryption
- In-memory only (never persisted to disk)
- Template variable resolution (`{{secrets.xxx}}`)
- Automatic cleanup on destroy

## 📝 Configuration Files

### devcontainer.json
Configures the Codespace environment with:
- Node.js 20 runtime
- GitHub CLI
- Docker-in-Docker
- Claude Code extension
- GitHub MCP server

### post-create.sh
Setup script that:
- Installs npm dependencies
- Builds MCP servers
- Installs global tools (netlify-cli, supabase)
- Displays welcome message

### claude-instructions.md
Instructions for Claude Code:
- Read project configuration
- Greet user with project details
- Execute provisioning steps
- Store credentials securely
- Report completion

## 🔐 Security

### Credentials
- GitHub token stored in Codespace secrets
- All provisioned credentials encrypted in secret vault
- Never logged or displayed in plain text
- Vault destroyed after provisioning

### Best Practices
- Repository secrets properly encrypted with libsodium
- Environment variables scoped to Codespace
- No credentials in git history

## 🧪 Testing

Once Phase 2 is deployed:

1. **Test Codespace Creation**
   ```bash
   curl -X POST https://shipme.dev/api/launch-codespace \
     -H "Authorization: Bearer <token>" \
     -d '{"projectName": "test-app", "description": "Test", "stack": {...}}'
   ```

2. **Verify Codespace Opens**
   - Click returned `codespace_url`
   - Wait for dev container to build
   - Check Claude Code loads

3. **Test GitHub MCP**
   - Ask Claude: "Create a test repository"
   - Verify repo created on GitHub
   - Check MCP server logs

## 📚 References

- [Phase 2 Implementation Plan](../docs/implementation/phase-2-plan.md)
- [GitHub MCP Protocol](https://modelcontextprotocol.io)
- [Codespaces Documentation](https://docs.github.com/en/codespaces)
- [Claude Code Extension](https://claude.ai/claude-code)

---

**Phase 2 Components Ready** ✅
Ready to be moved to `shipme-starter-template` repository
