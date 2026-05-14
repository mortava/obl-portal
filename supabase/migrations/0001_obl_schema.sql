-- obl-portal schema (prefixed obl_ to coexist with other apps on the same project).
-- All tables enable RLS; policies are added in 0003.

begin;

-- ── Enums ────────────────────────────────────────────────────────────────────

do $$ begin
  create type obl_tenant_plan as enum ('starter', 'growth', 'enterprise');
exception when duplicate_object then null; end $$;

do $$ begin
  create type obl_tenant_status as enum ('active', 'trial', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type obl_env as enum ('sandbox', 'production');
exception when duplicate_object then null; end $$;

do $$ begin
  create type obl_workflow_status as enum ('draft', 'live', 'paused', 'error');
exception when duplicate_object then null; end $$;

do $$ begin
  create type obl_run_status as enum ('succeeded', 'failed', 'running', 'awaiting_human');
exception when duplicate_object then null; end $$;

do $$ begin
  create type obl_step_status as enum ('ok', 'fail', 'skip');
exception when duplicate_object then null; end $$;

do $$ begin
  create type obl_severity as enum ('info', 'warning', 'critical', 'blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type obl_tenant_role as enum ('owner', 'admin', 'operator', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type obl_platform_role as enum ('admin', 'support');
exception when duplicate_object then null; end $$;

do $$ begin
  create type obl_connection_service as enum ('encompass', 'anthropic', 'slack', 'email');
exception when duplicate_object then null; end $$;

do $$ begin
  create type obl_connection_status as enum ('ok', 'degraded', 'down', 'not_connected');
exception when duplicate_object then null; end $$;

-- ── Tables ───────────────────────────────────────────────────────────────────

create table if not exists public.obl_tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan obl_tenant_plan not null default 'starter',
  status obl_tenant_status not null default 'trial',
  env obl_env not null default 'sandbox',
  primary_contact text,
  monthly_run_budget int not null default 1000,
  monthly_runs_used int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists obl_tenants_slug_idx on public.obl_tenants(slug);
create index if not exists obl_tenants_status_idx on public.obl_tenants(status);

create table if not exists public.obl_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references public.obl_tenants(id) on delete set null,
  tenant_role obl_tenant_role,
  platform_role obl_platform_role,
  email text,
  name text,
  last_seen timestamptz,
  invited_at timestamptz default now()
);
create index if not exists obl_profiles_tenant_idx on public.obl_profiles(tenant_id);
create index if not exists obl_profiles_platform_role_idx on public.obl_profiles(platform_role) where platform_role is not null;

create table if not exists public.obl_workflows (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.obl_tenants(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  status obl_workflow_status not null default 'draft',
  env obl_env not null default 'sandbox',
  definition jsonb not null default '{}'::jsonb,
  runs_total int not null default 0,
  success_rate numeric(5,4) not null default 0,
  last_run_at timestamptz,
  created_by uuid references public.obl_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);
create index if not exists obl_workflows_tenant_idx on public.obl_workflows(tenant_id);
create index if not exists obl_workflows_status_idx on public.obl_workflows(status);

create table if not exists public.obl_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.obl_workflows(id) on delete cascade,
  tenant_id uuid not null references public.obl_tenants(id) on delete cascade,
  status obl_run_status not null,
  started_at timestamptz not null default now(),
  duration_ms int,
  loan_ref text,
  error_msg text
);
create index if not exists obl_runs_tenant_started_idx on public.obl_runs(tenant_id, started_at desc);
create index if not exists obl_runs_workflow_started_idx on public.obl_runs(workflow_id, started_at desc);
create index if not exists obl_runs_status_idx on public.obl_runs(status);

create table if not exists public.obl_run_steps (
  id bigserial primary key,
  run_id uuid not null references public.obl_runs(id) on delete cascade,
  idx int not null,
  step_id text not null,
  status obl_step_status not null,
  duration_ms int not null default 0,
  payload jsonb
);
create index if not exists obl_run_steps_run_idx on public.obl_run_steps(run_id, idx);

create table if not exists public.obl_connections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.obl_tenants(id) on delete cascade,
  service obl_connection_service not null,
  env obl_env not null,
  account text,
  config jsonb,
  connected_at timestamptz default now(),
  unique (tenant_id, service, env)
);
create index if not exists obl_connections_tenant_idx on public.obl_connections(tenant_id);

create table if not exists public.obl_connection_health_checks (
  id bigserial primary key,
  connection_id uuid not null references public.obl_connections(id) on delete cascade,
  status obl_connection_status not null,
  latency_ms int,
  checked_at timestamptz not null default now(),
  detail jsonb
);
create index if not exists obl_chc_conn_checked_idx on public.obl_connection_health_checks(connection_id, checked_at desc);

create table if not exists public.obl_audit_entries (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  actor text not null,
  tenant_id uuid references public.obl_tenants(id) on delete set null,
  action text not null,
  summary text not null,
  severity obl_severity not null default 'info'
);
create index if not exists obl_audit_at_idx on public.obl_audit_entries(at desc);
create index if not exists obl_audit_tenant_at_idx on public.obl_audit_entries(tenant_id, at desc);

create table if not exists public.obl_alerts (
  id uuid primary key default gen_random_uuid(),
  severity obl_severity not null,
  tenant_id uuid references public.obl_tenants(id) on delete set null,
  title text not null,
  detail text,
  at timestamptz not null default now(),
  acknowledged boolean not null default false,
  acknowledged_by uuid references public.obl_profiles(id) on delete set null,
  acknowledged_at timestamptz
);
create index if not exists obl_alerts_open_idx on public.obl_alerts(at desc) where acknowledged = false;

create table if not exists public.obl_policies (
  id text primary key,
  name text not null,
  enforced boolean not null default false,
  description text,
  blocked_24h int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.obl_policy_layers (
  id bigserial primary key,
  policy_id text not null references public.obl_policies(id) on delete cascade,
  idx int not null,
  name text not null,
  ok boolean not null default true,
  unique (policy_id, idx)
);

-- ── RLS enabled (policies in 0003) ───────────────────────────────────────────

alter table public.obl_tenants                 enable row level security;
alter table public.obl_profiles                enable row level security;
alter table public.obl_workflows               enable row level security;
alter table public.obl_runs                    enable row level security;
alter table public.obl_run_steps               enable row level security;
alter table public.obl_connections             enable row level security;
alter table public.obl_connection_health_checks enable row level security;
alter table public.obl_audit_entries           enable row level security;
alter table public.obl_alerts                  enable row level security;
alter table public.obl_policies                enable row level security;
alter table public.obl_policy_layers           enable row level security;

commit;
