'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Search,
  Shield,
  ShieldOff,
  Mail,
  Calendar,
  MoreVertical,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface User {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string
  created_at: string
  email?: string
  automations_count?: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const supabase = createClient()

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get automation counts for each user
      const usersWithCounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count } = await supabase
            .from('automations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)

          return {
            ...profile,
            automations_count: count || 0,
          }
        })
      )

      setUsers(usersWithCounts)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleAdmin(userId: string, currentRole: string) {
    setUpdating(userId)
    try {
      const supabase = createClient()
      const newRole = currentRole === 'admin' ? 'user' : 'admin'

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Log admin activity
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('admin_activity_logs').insert({
        admin_id: user?.id,
        action: newRole === 'admin' ? 'promote_to_admin' : 'demote_from_admin',
        target_type: 'user',
        target_id: userId,
        details: { new_role: newRole },
      })

      // Update local state
      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ))
    } catch (error) {
      console.error('Failed to update role:', error)
    } finally {
      setUpdating(null)
    }
  }

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.includes(searchTerm)
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Syne']">User Management</h1>
          <p className="text-slate-400 mt-1">View and manage platform users</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
          <Users className="h-5 w-5 text-slate-400" />
          <span className="text-white font-semibold">{users.length}</span>
          <span className="text-slate-400">total users</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search users by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f5ff]/50"
        />
      </div>

      {/* Users Table */}
      <div className="card-cyber rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-sm font-semibold text-slate-400">User</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-400">Role</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-400">Provisions</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-400">Joined</th>
              <th className="text-right p-4 text-sm font-semibold text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <Loader2 className="h-8 w-8 text-[#00f5ff] animate-spin mx-auto" />
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || 'User'}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00f5ff] to-[#d4ff00] flex items-center justify-center">
                          <span className="text-[#0a0a0f] font-bold">
                            {user.full_name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{user.full_name || 'Unnamed User'}</p>
                        <p className="text-xs text-slate-500 font-mono">{user.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    }`}>
                      {user.role === 'admin' ? (
                        <Shield className="h-3 w-3" />
                      ) : (
                        <Users className="h-3 w-3" />
                      )}
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-white">{user.automations_count || 0}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleAdmin(user.id, user.role)}
                      disabled={updating === user.id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        user.role === 'admin'
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          : 'bg-[#00f5ff]/10 text-[#00f5ff] hover:bg-[#00f5ff]/20'
                      }`}
                    >
                      {updating === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : user.role === 'admin' ? (
                        <>
                          <ShieldOff className="h-4 w-4" />
                          Remove Admin
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4" />
                          Make Admin
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Admin Legend */}
      <div className="flex items-center gap-6 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <span>Admin - Full platform access</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-slate-500" />
          <span>User - Standard access</span>
        </div>
      </div>
    </div>
  )
}
