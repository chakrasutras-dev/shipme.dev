'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Settings,
  Shield,
  Activity,
  Calendar,
  User,
  Loader2,
} from 'lucide-react'

interface AdminLog {
  id: string
  action: string
  target_type: string
  target_id: string | null
  details: Record<string, any>
  created_at: string
  admin: {
    full_name: string
  }
}

export default function AdminSettingsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string; email: string; full_name: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const supabase = createClient()

      // Get current admin info
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        setCurrentAdmin({
          id: user.id,
          email: user.email || '',
          full_name: profile?.full_name || 'Admin',
        })
      }

      // Fetch admin activity logs
      const { data: activityLogs, error } = await supabase
        .from('admin_activity_logs')
        .select(`
          *,
          admin:profiles!admin_id(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Failed to fetch logs:', error)
      } else {
        setLogs(activityLogs || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'text-green-400'
    if (action.includes('update') || action.includes('promote')) return 'text-[#00f5ff]'
    if (action.includes('delete') || action.includes('demote')) return 'text-red-400'
    return 'text-slate-400'
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'create_service': 'Created service',
      'update_service': 'Updated service',
      'delete_service': 'Deleted service',
      'promote_to_admin': 'Promoted user to admin',
      'demote_from_admin': 'Demoted admin to user',
    }
    return labels[action] || action
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white font-['Syne']">Admin Settings</h1>
        <p className="text-slate-400 mt-1">View admin activity and platform settings</p>
      </div>

      {/* Current Admin Info */}
      {currentAdmin && (
        <div className="card-cyber rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-400" />
            Current Admin
          </h2>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{currentAdmin.full_name}</p>
              <p className="text-slate-400">{currentAdmin.email}</p>
              <p className="text-xs text-slate-500 font-mono mt-1">ID: {currentAdmin.id.slice(0, 8)}...</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Activity Logs */}
      <div className="card-cyber rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-[#00f5ff]" />
          Admin Activity Logs
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 text-[#00f5ff] animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No admin activity recorded yet</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className={`font-medium ${getActionColor(log.action)}`}>
                      {getActionLabel(log.action)}
                    </p>
                    <p className="text-sm text-slate-500">
                      by {(log.admin as any)?.full_name || 'Unknown admin'}
                      {log.details?.service_key && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-white/10 text-xs">
                          {log.details.service_key}
                        </span>
                      )}
                      {log.details?.new_role && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-white/10 text-xs">
                          → {log.details.new_role}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Settings */}
      <div className="card-cyber rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#d4ff00]" />
          Platform Settings
        </h2>
        <p className="text-slate-500 text-center py-8">
          Advanced platform settings coming in future update.
        </p>
      </div>
    </div>
  )
}
