# DevFlow - AI-Powered Infrastructure Automation Platform

DevFlow is a cutting-edge web platform that automates full-stack development environment setup using Claude Desktop's browser automation capabilities. Built with Next.js 15, TypeScript, and a distinctive neo-brutalist design aesthetic.

## 🚀 Features

- **Lightning-Fast Setup**: Deploy complete infrastructure in under 10 minutes
- **AI-Powered Automation**: Claude Desktop orchestrates your entire stack
- **Zero Credential Storage**: Your auth tokens never leave your machine
- **Full-Stack Templates**: Pre-built setups for Next.js, React Native, Django, and more
- **Real-time Progress Tracking**: Watch your infrastructure provision live
- **Cost Estimation**: Know your monthly costs before you deploy

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom neo-brutalist design system
- **UI Components**: Custom components with Lucide React icons
- **State Management**: React Context + Zustand
- **Form Handling**: React Hook Form + Zod
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: Anthropic Claude API
- **Payments**: Stripe
- **Containerization**: Docker + Docker Compose

## 📦 Installation & Setup

### Prerequisites

- Node.js 20+ (or Docker)
- npm or pnpm
- Git

### Local Development (Without Docker)

1. **Clone and navigate to the app directory**:
   ```bash
   cd app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your credentials:
   - Supabase URL and keys
   - Anthropic API key
   - Stripe keys (optional for dev)

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Development (Recommended)

1. **Start the development server**:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Access the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Stop the server**:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

### Production Docker Build

1. **Build the production image**:
   ```bash
   docker-compose build
   ```

2. **Run the production container**:
   ```bash
   docker-compose up
   ```

## 🎨 Design System

DevFlow features a distinctive **Neo-Brutalist Tech** aesthetic:

- **Color Palette**: Electric Cyan (#00bfff) + Deep Indigo (#1e1b4b)
- **Typography**: Monospace fonts for technical feel
- **Brutal Borders**: 3px solid black borders with offset shadows
- **Glitch Effects**: Hover animations with chromatic aberration
- **Terminal Aesthetics**: Code-block inspired UI elements
- **Pixelated Accents**: Retro-futuristic corner clipping

## 📂 Project Structure

```
app/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Authentication pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/     # Protected dashboard routes
│   │   ├── api/             # API routes
│   │   └── page.tsx         # Landing page
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI primitives
│   │   ├── forms/          # Form components
│   │   └── shared/         # Shared components
│   ├── lib/                # Utilities and configs
│   │   ├── supabase/       # Supabase client
│   │   ├── utils.ts        # Helper functions
│   ├── types/              # TypeScript types
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
├── Dockerfile             # Production Docker config
├── docker-compose.yml     # Production compose
├── docker-compose.dev.yml # Development compose
└── tailwind.config.ts     # Tailwind configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🌐 Environment Variables

Required environment variables (see `.env.local.example`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic Claude API
ANTHROPIC_API_KEY=your-api-key

# Stripe (Optional for development)
STRIPE_SECRET_KEY=your-stripe-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-public
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎯 Current Implementation Status

### ✅ Completed

- [x] Next.js 15 project setup with TypeScript
- [x] Tailwind CSS with custom neo-brutalist design system
- [x] Landing page with hero, features, pricing sections
- [x] Authentication UI (Login/Signup pages)
- [x] Docker configuration (dev + production)
- [x] Custom utility functions and styling

### 🚧 In Progress

- [ ] Multi-step questionnaire form
- [ ] Dashboard layout with navigation
- [ ] Template marketplace gallery
- [ ] Automation progress tracking UI
- [ ] Supabase integration
- [ ] API routes implementation

### 📋 Planned

- [ ] MCP server for Claude Desktop integration
- [ ] Real-time WebSocket progress updates
- [ ] Stripe payment integration
- [ ] Email notifications
- [ ] Team collaboration features
- [ ] Cost monitoring and alerts

## 🤝 Contributing

This is a development project. Follow these steps to contribute:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Private project - All rights reserved

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com)
- [Anthropic Claude](https://anthropic.com)

---

Built with ❤️ using Claude Code and Next.js 15
