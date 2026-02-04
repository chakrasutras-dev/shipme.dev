-- ShipMe Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE automation_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE stack_type AS ENUM ('nextjs_fullstack', 'mobile_app', 'python_api', 'custom');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Automation plans table
CREATE TABLE automation_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  stack_type stack_type NOT NULL,

  -- Configuration
  config JSONB NOT NULL DEFAULT '{}',

  -- AI-generated plan
  ai_plan TEXT,
  estimated_time_minutes INTEGER,
  estimated_cost_usd DECIMAL(10, 2),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE automation_plans ENABLE ROW LEVEL SECURITY;

-- Automation plans policies
CREATE POLICY "Users can view own plans"
  ON automation_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans"
  ON automation_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON automation_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON automation_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Automations table (execution records)
CREATE TABLE automations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES automation_plans(id) ON DELETE CASCADE,

  -- Status
  status automation_status DEFAULT 'pending' NOT NULL,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  current_step TEXT,

  -- Results
  resources JSONB DEFAULT '{}',
  logs TEXT[],
  error_message TEXT,

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

-- Automations policies
CREATE POLICY "Users can view own automations"
  ON automations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own automations"
  ON automations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL,
  tool_name TEXT,
  tool_input JSONB,
  tool_output JSONB,
  status TEXT NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs policies
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- User credentials table (encrypted storage for API keys)
CREATE TABLE user_credentials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Service
  service TEXT NOT NULL, -- 'github', 'vercel', 'supabase', 'stripe'

  -- Encrypted credentials (use Supabase Vault in production)
  encrypted_token TEXT NOT NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  UNIQUE(user_id, service)
);

-- Enable RLS
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- User credentials policies
CREATE POLICY "Users can view own credentials"
  ON user_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credentials"
  ON user_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials"
  ON user_credentials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credentials"
  ON user_credentials FOR DELETE
  USING (auth.uid() = user_id);

-- Functions
-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_plans_updated_at BEFORE UPDATE ON automation_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credentials_updated_at BEFORE UPDATE ON user_credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ShipMe v2.0 Tables (Codespaces + MCP Integration)
-- ============================================================================

-- Track Codespace launches
CREATE TABLE IF NOT EXISTS codespace_launches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_name TEXT NOT NULL,
  project_description TEXT,
  stack_config JSONB,
  codespace_url TEXT,
  template_repo_url TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'created', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track provisioning steps
CREATE TABLE IF NOT EXISTS provisioning_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codespace_id UUID REFERENCES codespace_launches(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  tool_name TEXT,
  status TEXT NOT NULL, -- 'started', 'completed', 'failed'
  details JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE codespace_launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE provisioning_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own codespace launches"
  ON codespace_launches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own codespace launches"
  ON codespace_launches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own codespace launches"
  ON codespace_launches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own provisioning events"
  ON provisioning_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM codespace_launches
      WHERE id = provisioning_events.codespace_id
      AND user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_codespace_launches_updated_at
  BEFORE UPDATE ON codespace_launches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
