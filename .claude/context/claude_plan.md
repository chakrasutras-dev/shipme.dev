# DevFlow Execution Plan for Claude Code

This document outlines the step-by-step plan for building DevFlow, an AI-powered infrastructure automation platform. Follow these steps sequentially.

## Phase 1: Foundation (Weeks 1-2)

### Step 1: Project Initialization
**Goal**: Set up the Next.js project with TypeScript, Tailwind, and shadcn/ui.

1.  **Create Project**:
    ```bash
    npx create-next-app@latest devflow \
      --typescript \
      --tailwind \
      --app \
      --src-dir \
      --import-alias "@/*"
    ```

2.  **Install Core Dependencies**:
    ```bash
    cd devflow
    pnpm install @supabase/supabase-js @supabase/auth-helpers-nextjs zod react-hook-form @hookform/resolvers zustand socket.io-client lucide-react
    ```

3.  **Initialize shadcn/ui**:
    ```bash
    pnpm dlx shadcn-ui@latest init
    ```
    *   Style: Default
    *   Base Color: Slate
    *   CSS Variables: Yes

4.  **Add UI Components**:
    ```bash
    pnpm dlx shadcn-ui@latest add button input card badge dialog select checkbox textarea table progress toast tabs avatar dropdown-menu
    ```

### Step 2: Folder Structure
**Goal**: Organize the project according to the architecture.

Create the following directory structure in `src/`:
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── new/
│   │   ├── plan/
│   │   ├── automation/
│   │   ├── templates/
│   │   └── settings/
│   ├── api/
│   │   ├── auth/
│   │   ├── questionnaire/
│   │   ├── plan/
│   │   ├── automation/
│   │   └── webhooks/
├── components/
│   ├── ui/              # shadcn components
│   ├── forms/
│   ├── automation/
│   └── shared/
├── lib/
│   ├── supabase/
│   ├── claude/
│   ├── stripe/
│   └── utils/
├── types/
└── hooks/
```

### Step 3: Database & Auth Setup
**Goal**: Configure Supabase and implement authentication.

1.  **Supabase Configuration**:
    *   Create `lib/supabase/client.ts` and `lib/supabase/server.ts` using `@supabase/auth-helpers-nextjs`.
    *   Set up `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

2.  **Database Schema**:
    *   Run the SQL schema provided in `devflow.docx` Section 3.1.
    *   Key tables: `profiles`, `questionnaire_responses`, `automation_plans`, `automations`.

3.  **Auth Pages**:
    *   Implement `app/(auth)/login/page.tsx` with Email and OAuth (GitHub/Google) login.
    *   Implement `app/auth/callback/route.ts` for OAuth redirects.

## Phase 2: Core Features (Weeks 3-6)

### Step 4: Landing Page & Dashboard
**Goal**: Create the public face and user dashboard.

1.  **Landing Page (`app/page.tsx`)**:
    *   Hero section with "Get Started" CTA.
    *   Features section.
    *   How it works section.

2.  **Dashboard Layout (`app/(dashboard)/layout.tsx`)**:
    *   Implement `Navigation` component with user avatar and dropdown.
    *   Protect routes using Supabase middleware.

### Step 5: Questionnaire System
**Goal**: Collect user requirements.

1.  **Form Schema**:
    *   Define Zod schema in `lib/validations/questionnaire.ts`.
    *   Fields: App Name, Tech Stack, Cloud Provider, Auth, Database, etc.

2.  **Form Component**:
    *   Create multi-step form in `components/forms/questionnaire-form.tsx`.
    *   Use `react-hook-form` and `zod`.

3.  **Cost Estimator**:
    *   Implement `app/api/estimate-cost/route.ts` to calculate costs based on selections.
    *   Display real-time estimates in the form.

### Step 6: Plan Generation (AI)
**Goal**: Generate automation plans using Claude.

1.  **Claude Client**:
    *   Setup `lib/claude/client.ts` with Anthropic SDK.
    *   Implement `generateAutomationPlan` function with the prompt from Section 8.

2.  **API Endpoint**:
    *   Create `app/api/generate-plan/route.ts`.
    *   Fetch questionnaire, call Claude API, save plan to `automation_plans` table.

## Phase 3: Automation Engine (Weeks 6-8)

### Step 7: MCP Server
**Goal**: Build the local server for browser automation.

1.  **Server Setup**:
    *   Initialize `devflow-mcp-server` directory.
    *   Install `@modelcontextprotocol/sdk`.

2.  **Tools**:
    *   Implement `execute-step` tool to perform browser actions.
    *   Implement `report-progress` tool to update status via WebSocket.

### Step 8: Real-time Progress
**Goal**: Show automation status to the user.

1.  **WebSocket Server**:
    *   Set up a WebSocket server (or use Supabase Realtime) to stream updates from MCP server to frontend.

2.  **Progress UI**:
    *   Create `components/automation/automation-progress.tsx`.
    *   Display current step, logs, and success/failure status.

## Phase 4: Polish & Launch (Weeks 9-12)

### Step 9: Templates & Payments
1.  **Templates**: Implement template gallery and usage.
2.  **Payments**: Integrate Stripe for Pro subscriptions.

## Key Instructions for Claude Code
*   **Reference**: Always refer to `devflow.docx` for exact schemas and API signatures.
*   **Testing**: Write tests for critical paths (Auth, Plan Generation).
*   **Security**: Ensure RLS policies are enabled on all Supabase tables.
