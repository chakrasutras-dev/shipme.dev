# ShipMe - Quick Start Guide

Welcome to ShipMe! This guide will help you get the application running in minutes.

## 🚀 Quick Start Options

### Option 1: Standard Development (Fastest)

```bash
# Navigate to the app directory
cd app

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

**Access the app**: http://localhost:3000

### Option 2: Docker Development

```bash
# Navigate to the app directory
cd app

# Start with Docker Compose
docker-compose -f docker-compose.dev.yml up
```

**Access the app**: http://localhost:3000

To stop: `docker-compose -f docker-compose.dev.yml down`

## 📱 What You'll See

### Landing Page (/)
- Hero section with terminal mockup
- Feature cards showcasing automation capabilities
- How It Works section with 3-step process
- Pricing tiers (Free & Pro)
- Professional neo-brutalist design

### Login Page (/login)
- Email/password authentication
- OAuth buttons (GitHub & Google - UI only, not yet connected)
- Clean card-based layout
- Remember me functionality

### Signup Page (/signup)
- Account creation form
- Full name, email, password fields
- OAuth options
- Terms agreement checkbox

## 🎨 Design Highlights

The UI features a **Neo-Brutalist Tech** aesthetic with:
- Electric Cyan (#00bfff) & Deep Indigo (#1e1b4b) color scheme
- 3px solid black borders with offset shadows
- Monospace typography for technical feel
- Glitch hover effects on key elements
- Terminal-inspired code blocks

## ⚙️ Current Features (Frontend Only)

✅ **Implemented**:
- Fully responsive landing page
- Authentication UI (login/signup)
- Neo-brutalist design system
- Docker configuration
- TypeScript + Tailwind CSS setup

🚧 **Not Yet Connected**:
- Supabase authentication (UI only)
- OAuth providers (UI only)
- Backend API routes
- Database integration

## 🔧 Available Pages

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Landing page | ✅ Complete |
| `/login` | Sign in page | ✅ UI Complete |
| `/signup` | Registration page | ✅ UI Complete |
| `/templates` | Template marketplace | 🚧 Planned |
| `/dashboard` | User dashboard | 🚧 Planned |
| `/new` | New automation wizard | 🚧 Planned |

## 🐛 Common Issues

### Port Already in Use
If port 3000 is occupied:
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Docker Issues
```bash
# Rebuild containers
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

## 📚 Next Steps

1. **Explore the UI**: Navigate through the landing page, login, and signup flows
2. **Check the Design**: Hover effects, animations, and responsive layouts
3. **View the Code**: Browse `src/app/page.tsx` and `src/app/(auth)/` for implementation details

## 🛠️ Development Tips

### Hot Reload
The development server supports hot module replacement - changes to code automatically refresh the browser.

### Tailwind Classes
All custom brutal design utilities are available:
- `brutal-border` - 3px solid black border
- `brutal-shadow` - 8px offset shadow
- `brutal-shadow-sm` - 4px offset shadow
- `brutal-shadow-lg` - 12px offset shadow

### Adding New Pages
1. Create a new folder in `src/app/`
2. Add a `page.tsx` file
3. Use the design tokens from [globals.css](src/app/globals.css)

## 📞 Need Help?

- Review the main [README.md](README.md) for full documentation
- Check [PRODUCT_SPEC.md](./PRODUCT_SPEC.md) for project specifications
- See [claude_plan.md](../claude_plan.md) for the implementation plan

---

**Current Build Status**: ✅ Frontend MVP Complete
**Ready for**: Backend integration, Supabase setup, API development

🎉 Enjoy exploring ShipMe!
