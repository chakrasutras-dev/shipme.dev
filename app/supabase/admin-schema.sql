-- ShipMe Admin Schema Extensions
-- Run this AFTER the main schema.sql

-- Add role to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update all profiles (for role management)
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service Integrations table (admin-managed)
CREATE TABLE IF NOT EXISTS service_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Service identification
  service_key TEXT NOT NULL UNIQUE, -- 'github', 'vercel', 'netlify', etc.
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'source_control', 'hosting', 'database', 'payments', 'auth'

  -- Service configuration
  base_url TEXT,
  auth_type TEXT DEFAULT 'bearer', -- 'bearer', 'basic', 'oauth2'
  required_scopes TEXT[],

  -- UI configuration
  icon_name TEXT, -- Lucide icon name
  color TEXT, -- Tailwind color class

  -- API configuration for LLM integration
  api_spec JSONB DEFAULT '{}', -- OpenAPI-like spec for endpoints
  provisioning_steps JSONB DEFAULT '[]', -- Steps the LLM should follow

  -- Status
  is_enabled BOOLEAN DEFAULT true,
  is_coming_soon BOOLEAN DEFAULT false,

  -- Free tier info
  free_tier_limits JSONB DEFAULT '{}',
  pricing_url TEXT,
  docs_url TEXT,
  token_url TEXT, -- Where users get their API token

  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE service_integrations ENABLE ROW LEVEL SECURITY;

-- Everyone can view enabled services
CREATE POLICY "Anyone can view enabled services"
  ON service_integrations FOR SELECT
  USING (is_enabled = true);

-- Only admins can manage services
CREATE POLICY "Admins can manage services"
  ON service_integrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all automations
CREATE POLICY "Admins can view all automations"
  ON automations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin activity logs
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) NOT NULL,
  action TEXT NOT NULL, -- 'create_service', 'update_service', 'promote_user', etc.
  target_type TEXT, -- 'service', 'user', 'automation'
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin logs"
  ON admin_activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create admin logs"
  ON admin_activity_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to make first user admin (run once during setup)
CREATE OR REPLACE FUNCTION make_first_user_admin()
RETURNS void AS $$
DECLARE
  first_user_id UUID;
BEGIN
  SELECT id INTO first_user_id
  FROM profiles
  ORDER BY created_at ASC
  LIMIT 1;

  IF first_user_id IS NOT NULL THEN
    UPDATE profiles SET role = 'admin' WHERE id = first_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default service integrations
INSERT INTO service_integrations (service_key, display_name, description, category, icon_name, color, is_enabled, token_url, docs_url, free_tier_limits, api_spec, provisioning_steps) VALUES
(
  'github',
  'GitHub',
  'Source control and CI/CD with GitHub Actions',
  'source_control',
  'Github',
  'slate',
  true,
  'https://github.com/settings/tokens/new',
  'https://docs.github.com/en/rest',
  '{"repos": "unlimited", "actions_minutes": 2000, "packages_storage": "500MB", "codespaces_hours": 60}',
  '{"create_repo": {"method": "POST", "path": "/user/repos", "params": ["name", "description", "private"]}, "push_files": {"method": "PUT", "path": "/repos/{owner}/{repo}/contents/{path}"}}',
  '[{"step": 1, "action": "create_repository", "description": "Create GitHub repository"}, {"step": 2, "action": "push_files", "description": "Push initial files"}, {"step": 3, "action": "setup_codespaces", "description": "Configure Codespaces"}]'
),
(
  'vercel',
  'Vercel',
  'Frontend deployment with edge functions and analytics',
  'hosting',
  'Globe',
  'white',
  true,
  'https://vercel.com/account/tokens',
  'https://vercel.com/docs/rest-api',
  '{"bandwidth": "100GB", "deployments": "unlimited", "serverless_functions": true, "https": true}',
  '{"create_project": {"method": "POST", "path": "/v9/projects", "params": ["name", "framework", "gitRepository"]}, "set_env": {"method": "POST", "path": "/v10/projects/{projectId}/env"}}',
  '[{"step": 1, "action": "create_project", "description": "Create Vercel project"}, {"step": 2, "action": "link_repo", "description": "Link GitHub repository"}, {"step": 3, "action": "set_env_vars", "description": "Set environment variables"}]'
),
(
  'supabase',
  'Supabase',
  'PostgreSQL database with auth, storage, and realtime',
  'database',
  'Database',
  'emerald',
  true,
  'https://supabase.com/dashboard/account/tokens',
  'https://supabase.com/docs/reference/api',
  '{"database_size": "500MB", "monthly_active_users": 50000, "storage": "1GB", "api_requests": "unlimited"}',
  '{"create_project": {"method": "POST", "path": "/v1/projects", "params": ["name", "organization_id", "region", "db_pass"]}, "run_sql": {"method": "POST", "path": "/v1/projects/{ref}/database/query"}}',
  '[{"step": 1, "action": "create_project", "description": "Create Supabase project"}, {"step": 2, "action": "run_migrations", "description": "Run database migrations"}, {"step": 3, "action": "configure_auth", "description": "Configure authentication"}]'
),
(
  'netlify',
  'Netlify',
  'JAMstack deployment with serverless functions',
  'hosting',
  'Layers',
  'teal',
  false,
  'https://app.netlify.com/user/applications#personal-access-tokens',
  'https://docs.netlify.com/api/get-started/',
  '{"bandwidth": "100GB", "build_minutes": 300, "forms": 100, "functions": "125k requests"}',
  '{"create_site": {"method": "POST", "path": "/api/v1/sites", "params": ["name", "repo"]}}',
  '[{"step": 1, "action": "create_site", "description": "Create Netlify site"}, {"step": 2, "action": "link_repo", "description": "Link GitHub repository"}]'
),
(
  'railway',
  'Railway',
  'Full-stack deployment with databases and services',
  'hosting',
  'Train',
  'purple',
  false,
  'https://railway.app/account/tokens',
  'https://docs.railway.app/reference/public-api',
  '{"credit": "$5/month", "execution_hours": 500, "network_egress": "100GB"}',
  '{}',
  '[]'
),
(
  'stripe',
  'Stripe',
  'Payment processing and subscription management',
  'payments',
  'CreditCard',
  'purple',
  false,
  'https://dashboard.stripe.com/apikeys',
  'https://stripe.com/docs/api',
  '{"monthly_fee": "$0", "transaction_fee": "2.9% + 30¢", "test_mode": "unlimited"}',
  '{"create_product": {"method": "POST", "path": "/v1/products"}, "create_price": {"method": "POST", "path": "/v1/prices"}}',
  '[{"step": 1, "action": "connect_account", "description": "Connect Stripe account"}, {"step": 2, "action": "create_products", "description": "Create products and prices"}]'
)
ON CONFLICT (service_key) DO NOTHING;

-- Update trigger for service_integrations
CREATE TRIGGER update_service_integrations_updated_at
  BEFORE UPDATE ON service_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
