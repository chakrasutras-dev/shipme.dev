'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Plus,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check auth status
    // TODO: Replace with actual Supabase auth check
    setUser({ email: 'demo@shipme.dev', full_name: 'Demo User' })
  }, [])

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Automation', href: '/new', icon: Plus },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#141419] border-r border-[#1f1f28] transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-[#1f1f28]">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f5ff] to-[#d4ff00] flex items-center justify-center">
                <Zap className="h-5 w-5 text-[#0a0a0f]" />
              </div>
              <span className="text-xl font-['Syne'] font-bold text-white">ShipMe</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-['Space_Grotesk'] font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00f5ff]/20 to-[#d4ff00]/10 text-[#00f5ff] border-l-2 border-[#00f5ff]'
                      : 'text-slate-400 hover:text-white hover:bg-[#1f1f28]'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-[#1f1f28]">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#1f1f28]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00f5ff] to-[#d4ff00] flex items-center justify-center text-[#0a0a0f] font-['Syne'] font-bold">
                {user?.full_name?.charAt(0) || 'D'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {user?.full_name || 'Demo User'}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {user?.email || 'demo@shipme.dev'}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full mt-2 flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1f1f28] transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 h-16 bg-[#141419]/80 backdrop-blur-lg border-b border-[#1f1f28]">
          <div className="flex items-center justify-between h-full px-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <Link
                href="/new"
                className="btn-cyber px-6 py-2 rounded-lg text-sm font-['Syne'] font-semibold"
              >
                + New Automation
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  )
}
