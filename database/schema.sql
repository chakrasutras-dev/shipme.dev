-- DevFlow PostgreSQL Database Schema
-- Simplified schema for local Docker deployment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE automation_status AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'cancelled');
CREATE TYPE stack_type AS ENUM ('nextjs_fullstack', 'mobile_app', 'python_api', 'custom');

-- Users table (simplified - no external auth dependency)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create default admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name)
VALUES ('admin@devflow.local', crypt('admin123', gen_salt('bf')), 'Admin User');

-- Automation configurations
CREATE TABLE automation_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  stack_type stack_type NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Automations (execution records)
CREATE TABLE automations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  config_id UUID REFERENCES automation_configs(id) ON DELETE SET NULL,

  -- Status tracking
  status automation_status DEFAULT 'pending' NOT NULL,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  current_step TEXT,

  -- Results
  resources JSONB DEFAULT '{}',
  error_message TEXT,

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Event details
  tool_name TEXT NOT NULL,
  action TEXT NOT NULL,
  input JSONB,
  output TEXT,
  screenshot_path TEXT,

  -- Metadata
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- API keys (encrypted storage)
CREATE TABLE user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  service TEXT NOT NULL,  -- 'github', 'vercel', 'supabase', 'stripe'
  key_value TEXT NOT NULL,  -- Encrypted in production
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, service)
);

-- Indexes for performance
CREATE INDEX idx_automations_user_id ON automations(user_id);
CREATE INDEX idx_automations_status ON automations(status);
CREATE INDEX idx_automations_created_at ON automations(created_at DESC);
CREATE INDEX idx_audit_logs_automation_id ON audit_logs(automation_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for reporting
CREATE VIEW automation_stats AS
SELECT
    user_id,
    COUNT(*) as total_automations,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/60) FILTER (WHERE status = 'completed') as avg_duration_minutes
FROM automations
GROUP BY user_id;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO devflow;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO devflow;

-- Insert sample data for testing
INSERT INTO automation_configs (user_id, name, stack_type, config)
SELECT
    u.id,
    'Sample Next.js App',
    'nextjs_fullstack',
    '{"projectName":"sample-app","githubRepo":true,"deploymentPlatform":"vercel","database":"supabase","auth":"supabase","payments":true}'::jsonb
FROM users u
LIMIT 1;
