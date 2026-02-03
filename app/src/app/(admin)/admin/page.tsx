'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Layers,
  Rocket,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
} from 'lucide-react'

interface Stats {
  totalUsers: number
  totalProvisions: number
  successfulProvisions: number
  failedProvisions: number
  activeServices: number
  recentActivity: Array<{
    id: string
    type: string
    user: string
    timestamp: string
    details: string
  }>
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProvisions: 0,
    successfulProvisions: 0,
    failedProvisions: 0,
    activeServices: 0,
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const supabase = createClient()

      // Fetch user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch automation stats
      const { data: automations } = await supabase
        .from('automations')
        .select('status')

      const successful = automations?.filter(a => a.status === 'completed').length || 0
      const failed = automations?.filter(a => a.status === 'failed').length || 0

      // Fetch active services
      const { count: serviceCount } = await supabase
        .from('service_integrations')
        .select('*', { count: 'exact', head: true })
        .eq('is_enabled', true)

      // Fetch recent audit logs
      const { data: recentLogs } = await supabase
        .from('audit_logs')
        .select(`
          id,
          event_type,
          created_at,
          profiles!inner(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      setStats({
        totalUsers: userCount || 0,
        totalProvisions: automations?.length || 0,
        successfulProvisions: successful,
        failedProvisions: failed,
        activeServices: serviceCount || 0,
        recentActivity: recentLogs?.map(log => ({
          id: log.id,
          type: log.event_type,
          user: (log.profiles as any)?.full_name || 'Unknown',
          timestamp: new Date(log.created_at).toLocaleString(),
          details: log.event_type,
        })) || [],
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'cyan',
      trend: '+12%',
    },
    {
      title: 'Total Provisions',
      value: stats.totalProvisions,
      icon: Rocket,
      color: 'lime',
      trend: '+8%',
    },
    {
      title: 'Success Rate',
      value: stats.totalProvisions > 0
        ? `${Math.round((stats.successfulProvisions / stats.totalProvisions) * 100)}%`
        : 'N/A',
      icon: CheckCircle,
      color: 'green',
      trend: '+2%',
    },
    {
      title: 'Active Services',
      value: stats.activeServices,
      icon: Layers,
      color: 'purple',
      trend: null,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white font-['Syne']">Admin Overview</h1>
        <p className="text-slate-400 mt-1">Monitor ShipMe platform health and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="card-cyber rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {loading ? '...' : stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.color === 'cyan' ? 'bg-[#00f5ff]/10' :
                stat.color === 'lime' ? 'bg-[#d4ff00]/10' :
                stat.color === 'green' ? 'bg-green-500/10' :
                'bg-purple-500/10'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.color === 'cyan' ? 'text-[#00f5ff]' :
                  stat.color === 'lime' ? 'text-[#d4ff00]' :
                  stat.color === 'green' ? 'text-green-500' :
                  'text-purple-500'
                }`} />
              </div>
            </div>
            {stat.trend && (
              <div className="flex items-center gap-1 mt-3">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">{stat.trend}</span>
                <span className="text-xs text-slate-500">vs last week</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card-cyber rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#00f5ff]" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/admin/users"
              className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
            >
              <Users className="h-6 w-6 text-[#00f5ff] mx-auto mb-2" />
              <span className="text-sm text-white">Manage Users</span>
            </a>
            <a
              href="/admin/services"
              className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
            >
              <Layers className="h-6 w-6 text-[#d4ff00] mx-auto mb-2" />
              <span className="text-sm text-white">Add Service</span>
            </a>
            <a
              href="/admin/settings"
              className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
            >
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <span className="text-sm text-white">View Logs</span>
            </a>
            <a
              href="/docs"
              className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
            >
              <AlertCircle className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <span className="text-sm text-white">Documentation</span>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-cyber rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#d4ff00]" />
            Recent Activity
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                >
                  <div>
                    <p className="text-sm text-white">{activity.type}</p>
                    <p className="text-xs text-slate-500">by {activity.user}</p>
                  </div>
                  <span className="text-xs text-slate-500">{activity.timestamp}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>

      {/* Provision Status */}
      <div className="card-cyber rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Provision Status</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-400 font-semibold">Successful</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.successfulProvisions}</p>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-400 font-semibold">Failed</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.failedProvisions}</p>
          </div>
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-yellow-400 font-semibold">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.totalProvisions - stats.successfulProvisions - stats.failedProvisions}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
