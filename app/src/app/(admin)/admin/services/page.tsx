'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Layers,
  Plus,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Loader2,
  Save,
  X,
  Github,
  Globe,
  Database,
  CreditCard,
  Layers as LayersIcon,
  Code,
  AlertCircle,
} from 'lucide-react'

interface ServiceIntegration {
  id: string
  service_key: string
  display_name: string
  description: string
  category: string
  icon_name: string
  color: string
  is_enabled: boolean
  is_coming_soon: boolean
  token_url: string
  docs_url: string
  free_tier_limits: Record<string, any>
  api_spec: Record<string, any>
  provisioning_steps: Array<{ step: number; action: string; description: string }>
  created_at: string
}

const CATEGORIES = [
  { value: 'source_control', label: 'Source Control' },
  { value: 'hosting', label: 'Hosting' },
  { value: 'database', label: 'Database' },
  { value: 'payments', label: 'Payments' },
  { value: 'auth', label: 'Authentication' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'storage', label: 'Storage' },
]

const ICONS = [
  'Github', 'Globe', 'Database', 'CreditCard', 'Layers', 'Code',
  'Cloud', 'Server', 'Lock', 'Key', 'Zap', 'Activity',
]

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<ServiceIntegration | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    service_key: '',
    display_name: '',
    description: '',
    category: 'hosting',
    icon_name: 'Globe',
    color: 'slate',
    token_url: '',
    docs_url: '',
    is_enabled: true,
    is_coming_soon: false,
    free_tier_limits: '{}',
    api_spec: '{}',
    provisioning_steps: '[]',
  })

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('service_integrations')
        .select('*')
        .order('display_name', { ascending: true })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingService(null)
    setFormData({
      service_key: '',
      display_name: '',
      description: '',
      category: 'hosting',
      icon_name: 'Globe',
      color: 'slate',
      token_url: '',
      docs_url: '',
      is_enabled: true,
      is_coming_soon: false,
      free_tier_limits: '{}',
      api_spec: '{}',
      provisioning_steps: '[]',
    })
    setShowModal(true)
  }

  function openEditModal(service: ServiceIntegration) {
    setEditingService(service)
    setFormData({
      service_key: service.service_key,
      display_name: service.display_name,
      description: service.description || '',
      category: service.category,
      icon_name: service.icon_name || 'Globe',
      color: service.color || 'slate',
      token_url: service.token_url || '',
      docs_url: service.docs_url || '',
      is_enabled: service.is_enabled,
      is_coming_soon: service.is_coming_soon,
      free_tier_limits: JSON.stringify(service.free_tier_limits || {}, null, 2),
      api_spec: JSON.stringify(service.api_spec || {}, null, 2),
      provisioning_steps: JSON.stringify(service.provisioning_steps || [], null, 2),
    })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const supabase = createClient()

      const serviceData = {
        service_key: formData.service_key.toLowerCase().replace(/\s+/g, '_'),
        display_name: formData.display_name,
        description: formData.description,
        category: formData.category,
        icon_name: formData.icon_name,
        color: formData.color,
        token_url: formData.token_url,
        docs_url: formData.docs_url,
        is_enabled: formData.is_enabled,
        is_coming_soon: formData.is_coming_soon,
        free_tier_limits: JSON.parse(formData.free_tier_limits || '{}'),
        api_spec: JSON.parse(formData.api_spec || '{}'),
        provisioning_steps: JSON.parse(formData.provisioning_steps || '[]'),
      }

      if (editingService) {
        const { error } = await supabase
          .from('service_integrations')
          .update(serviceData)
          .eq('id', editingService.id)

        if (error) throw error
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        const { error } = await supabase
          .from('service_integrations')
          .insert({
            ...serviceData,
            created_by: user?.id,
          })

        if (error) throw error
      }

      // Log admin activity
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('admin_activity_logs').insert({
        admin_id: user?.id,
        action: editingService ? 'update_service' : 'create_service',
        target_type: 'service',
        details: { service_key: serviceData.service_key },
      })

      setShowModal(false)
      fetchServices()
    } catch (error) {
      console.error('Failed to save service:', error)
      alert('Failed to save service. Check console for details.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleService(service: ServiceIntegration) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('service_integrations')
        .update({ is_enabled: !service.is_enabled })
        .eq('id', service.id)

      if (error) throw error

      setServices(services.map(s =>
        s.id === service.id ? { ...s, is_enabled: !s.is_enabled } : s
      ))
    } catch (error) {
      console.error('Failed to toggle service:', error)
    }
  }

  async function deleteService(service: ServiceIntegration) {
    if (!confirm(`Delete "${service.display_name}"? This cannot be undone.`)) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('service_integrations')
        .delete()
        .eq('id', service.id)

      if (error) throw error

      setServices(services.filter(s => s.id !== service.id))
    } catch (error) {
      console.error('Failed to delete service:', error)
    }
  }

  const filteredServices = services.filter(s =>
    s.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.service_key.includes(searchTerm.toLowerCase())
  )

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      source_control: 'text-slate-400',
      hosting: 'text-[#00f5ff]',
      database: 'text-[#d4ff00]',
      payments: 'text-purple-400',
      auth: 'text-orange-400',
      monitoring: 'text-pink-400',
      storage: 'text-blue-400',
    }
    return colors[category] || 'text-slate-400'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Syne']">Service Integrations</h1>
          <p className="text-slate-400 mt-1">Manage services available for LLM provisioning</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-cyber px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Service
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f5ff]/50"
        />
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-xl bg-[#00f5ff]/10 border border-[#00f5ff]/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#00f5ff] mt-0.5" />
          <div>
            <p className="text-sm text-white font-medium">How Service Integrations Work</p>
            <p className="text-xs text-slate-400 mt-1">
              Services you add here become available in the AI provisioning flow. The LLM uses the API spec
              and provisioning steps to automatically provision resources for users. Make sure to include
              accurate API documentation for the AI to work correctly.
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-[#00f5ff] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`card-cyber rounded-xl p-5 ${
                !service.is_enabled ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/5`}>
                    {service.icon_name === 'Github' && <Github className="h-6 w-6 text-slate-400" />}
                    {service.icon_name === 'Globe' && <Globe className="h-6 w-6 text-slate-400" />}
                    {service.icon_name === 'Database' && <Database className="h-6 w-6 text-slate-400" />}
                    {service.icon_name === 'CreditCard' && <CreditCard className="h-6 w-6 text-slate-400" />}
                    {service.icon_name === 'Layers' && <LayersIcon className="h-6 w-6 text-slate-400" />}
                    {service.icon_name === 'Code' && <Code className="h-6 w-6 text-slate-400" />}
                    {!['Github', 'Globe', 'Database', 'CreditCard', 'Layers', 'Code'].includes(service.icon_name) && (
                      <Layers className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{service.display_name}</h3>
                    <p className={`text-xs ${getCategoryColor(service.category)}`}>
                      {CATEGORIES.find(c => c.value === service.category)?.label || service.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleService(service)}
                  className="text-slate-400 hover:text-white"
                >
                  {service.is_enabled ? (
                    <ToggleRight className="h-6 w-6 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6" />
                  )}
                </button>
              </div>

              <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                {service.description || 'No description'}
              </p>

              <div className="flex items-center gap-2 mb-4">
                {service.is_coming_soon && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    Coming Soon
                  </span>
                )}
                {service.is_enabled && !service.is_coming_soon && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    Active
                  </span>
                )}
                {!service.is_enabled && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">
                    Disabled
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => openEditModal(service)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-sm"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                {service.docs_url && (
                  <a
                    href={service.docs_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <button
                  onClick={() => deleteService(service)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f0f14] rounded-2xl border border-white/10 shadow-2xl">
            <div className="sticky top-0 bg-[#0f0f14] p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Service Key
                  </label>
                  <input
                    type="text"
                    value={formData.service_key}
                    onChange={(e) => setFormData({ ...formData, service_key: e.target.value })}
                    placeholder="e.g., netlify"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00f5ff]/50"
                    disabled={!!editingService}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="e.g., Netlify"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00f5ff]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of what this service does..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00f5ff]/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00f5ff]/50"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Icon
                  </label>
                  <select
                    value={formData.icon_name}
                    onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00f5ff]/50"
                  >
                    {ICONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.is_coming_soon ? 'coming_soon' : (formData.is_enabled ? 'enabled' : 'disabled')}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData({
                        ...formData,
                        is_enabled: val === 'enabled',
                        is_coming_soon: val === 'coming_soon',
                      })
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00f5ff]/50"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>
              </div>

              {/* URLs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Token URL
                  </label>
                  <input
                    type="url"
                    value={formData.token_url}
                    onChange={(e) => setFormData({ ...formData, token_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00f5ff]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Docs URL
                  </label>
                  <input
                    type="url"
                    value={formData.docs_url}
                    onChange={(e) => setFormData({ ...formData, docs_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00f5ff]/50"
                  />
                </div>
              </div>

              {/* JSON Fields */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Free Tier Limits (JSON)
                </label>
                <textarea
                  value={formData.free_tier_limits}
                  onChange={(e) => setFormData({ ...formData, free_tier_limits: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#00f5ff]/50"
                  placeholder='{"bandwidth": "100GB", "deployments": "unlimited"}'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  API Spec (JSON) - For LLM
                </label>
                <textarea
                  value={formData.api_spec}
                  onChange={(e) => setFormData({ ...formData, api_spec: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#00f5ff]/50"
                  placeholder='{"create_project": {"method": "POST", "path": "/api/projects"}}'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Provisioning Steps (JSON Array) - For LLM
                </label>
                <textarea
                  value={formData.provisioning_steps}
                  onChange={(e) => setFormData({ ...formData, provisioning_steps: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-[#00f5ff]/50"
                  placeholder='[{"step": 1, "action": "create_site", "description": "Create site"}]'
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#0f0f14] p-6 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-cyber px-6 py-2 rounded-lg flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {editingService ? 'Save Changes' : 'Create Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
