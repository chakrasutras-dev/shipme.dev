const SUPABASE_API_URL = 'https://api.supabase.com/v1'

export interface SupabaseProvisionInput {
  accessToken: string
  projectName: string
  organizationId: string
  region?: string // default: us-east-1
  dbPassword: string
  plan?: 'free' | 'pro'
}

export interface SupabaseProvisionResult {
  success: boolean
  projectId?: string
  projectUrl?: string
  apiUrl?: string
  anonKey?: string
  serviceRoleKey?: string
  dbConnectionString?: string
  error?: string
}

/**
 * Create a new Supabase project
 */
export async function createSupabaseProject(
  input: SupabaseProvisionInput
): Promise<SupabaseProvisionResult> {
  try {
    const response = await fetch(`${SUPABASE_API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${input.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: input.projectName,
        organization_id: input.organizationId,
        region: input.region || 'us-east-1',
        db_pass: input.dbPassword,
        plan: input.plan || 'free'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create Supabase project')
    }

    const project = await response.json()

    // Wait for project to be ready (it takes a moment)
    // In production, you'd poll for status
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Get project API keys
    const keysResponse = await fetch(
      `${SUPABASE_API_URL}/projects/${project.id}/api-keys`,
      {
        headers: {
          'Authorization': `Bearer ${input.accessToken}`
        }
      }
    )

    let anonKey = ''
    let serviceRoleKey = ''

    if (keysResponse.ok) {
      const keys = await keysResponse.json()
      anonKey = keys.find((k: any) => k.name === 'anon')?.api_key || ''
      serviceRoleKey = keys.find((k: any) => k.name === 'service_role')?.api_key || ''
    }

    return {
      success: true,
      projectId: project.id,
      projectUrl: `https://supabase.com/dashboard/project/${project.id}`,
      apiUrl: `https://${project.id}.supabase.co`,
      anonKey,
      serviceRoleKey,
      dbConnectionString: `postgresql://postgres:${input.dbPassword}@db.${project.id}.supabase.co:5432/postgres`
    }
  } catch (error: any) {
    console.error('Supabase provisioning error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create Supabase project'
    }
  }
}

/**
 * Run SQL migrations on a Supabase project
 */
export async function runMigrations(
  accessToken: string,
  projectId: string,
  sql: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_API_URL}/projects/${projectId}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to run migrations')
    }

    return { success: true }
  } catch (error: any) {
    console.error('Migration error:', error)
    return {
      success: false,
      error: error.message || 'Failed to run migrations'
    }
  }
}

/**
 * Get list of organizations for the user
 */
export async function getOrganizations(
  accessToken: string
): Promise<{ organizations: Array<{ id: string; name: string }>; error?: string }> {
  try {
    const response = await fetch(`${SUPABASE_API_URL}/organizations`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get organizations')
    }

    const organizations = await response.json()

    return {
      organizations: organizations.map((org: any) => ({
        id: org.id,
        name: org.name
      }))
    }
  } catch (error: any) {
    return {
      organizations: [],
      error: error.message
    }
  }
}

/**
 * Generate starter schema for common app types
 */
export function generateStarterSchema(appType: string): string {
  const schemas: Record<string, string> = {
    saas: `
-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  subscription_tier text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
`,
    blog: `
-- Posts table
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users on delete cascade not null,
  title text not null,
  slug text unique not null,
  content text,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.posts enable row level security;

-- Policies
create policy "Anyone can view published posts"
  on public.posts for select
  using (published = true);

create policy "Authors can manage own posts"
  on public.posts for all
  using (auth.uid() = author_id);
`,
    ecommerce: `
-- Products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null, -- in cents
  image_url text,
  inventory integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- Orders table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  status text default 'pending',
  total integer not null,
  stripe_payment_intent_id text,
  created_at timestamptz default now()
);

-- Order items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders on delete cascade,
  product_id uuid references public.products on delete set null,
  quantity integer not null,
  price integer not null
);

-- Enable RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Policies
create policy "Anyone can view active products"
  on public.products for select
  using (active = true);

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);
`
  }

  return schemas[appType] || schemas.saas
}
