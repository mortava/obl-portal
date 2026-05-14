-- obl-portal seed data. Idempotent: re-running upserts existing rows.
-- Run via Supabase MCP execute_sql (service role bypasses RLS) or via
-- `supabase db reset` locally.

-- Stable tenant UUIDs so the data layer can reference them.
-- Format: '...-a01' through '...-a05' for the five seed tenants.

insert into public.obl_tenants (id, name, slug, plan, status, env, primary_contact, monthly_run_budget, monthly_runs_used, created_at)
values
  ('00000000-0000-0000-0000-000000000a01', 'Acme Lending',         'acme-lending',  'enterprise', 'active',    'production', 'ops@acmelending.com',         100000, 64320, '2026-01-15T09:00:00Z'),
  ('00000000-0000-0000-0000-000000000a02', 'Summit Mortgage',      'summit-mortgage','growth',    'active',    'production', 'tech@summitmortgage.com',       25000, 18402, '2026-02-04T14:00:00Z'),
  ('00000000-0000-0000-0000-000000000a03', 'Northstar Home Loans', 'northstar',     'growth',    'active',    'production', 'noc@northstar.com',             25000,  6210, '2026-02-20T11:00:00Z'),
  ('00000000-0000-0000-0000-000000000a04', 'Bridgeway Capital',    'bridgeway',     'starter',   'trial',     'sandbox',    'engineering@bridgeway.com',      1000,   312, '2026-04-28T16:00:00Z'),
  ('00000000-0000-0000-0000-000000000a05', 'Meridian Funding',     'meridian',      'growth',    'suspended', 'production', 'finance@meridianfunding.com',   25000,     0, '2025-11-08T09:00:00Z')
on conflict (id) do update set
  name = excluded.name,
  plan = excluded.plan,
  status = excluded.status,
  env = excluded.env,
  primary_contact = excluded.primary_contact,
  monthly_run_budget = excluded.monthly_run_budget,
  monthly_runs_used = excluded.monthly_runs_used;

-- Workflows (one per row from SAMPLE_PLATFORM_WORKFLOWS).

insert into public.obl_workflows (id, tenant_id, slug, name, status, env, runs_total, success_rate, last_run_at, created_at, updated_at)
values
  ('00000000-0000-0000-0000-00000000b101', '00000000-0000-0000-0000-000000000a01', 'tpo-submission-triage',     'TPO submission triage',                       'live',   'production', 412,  0.9700, '2026-05-13T07:42:00Z', '2026-04-12T10:00:00Z', '2026-05-01T12:00:00Z'),
  ('00000000-0000-0000-0000-00000000b102', '00000000-0000-0000-0000-000000000a01', 'condition-extraction',      'Condition extraction from disclosed docs',    'live',   'production', 1284, 0.9200, '2026-05-13T08:11:00Z', '2026-03-22T09:00:00Z', '2026-04-28T15:30:00Z'),
  ('00000000-0000-0000-0000-00000000b103', '00000000-0000-0000-0000-000000000a01', 'trailing-docs',             'Post-close trailing doc pursuit',             'live',   'production', 612,  0.9900, '2026-05-13T11:00:00Z', '2026-05-08T16:00:00Z', '2026-05-08T16:00:00Z'),
  ('00000000-0000-0000-0000-00000000b201', '00000000-0000-0000-0000-000000000a02', 'summit-triage',             'Wholesale submission triage',                 'live',   'production', 380,  0.9400, '2026-05-13T11:20:00Z', '2026-02-15T11:00:00Z', '2026-04-10T14:00:00Z'),
  ('00000000-0000-0000-0000-00000000b202', '00000000-0000-0000-0000-000000000a02', 'summit-conditions',         'Condition reconciliation',                    'live',   'production', 232,  0.9100, '2026-05-13T11:18:00Z', '2026-03-22T09:00:00Z', '2026-04-28T15:30:00Z'),
  ('00000000-0000-0000-0000-00000000b301', '00000000-0000-0000-0000-000000000a03', 'northstar-svc',             'Service SLA babysitter',                      'paused', 'production', 0,    0.8600, '2026-05-12T20:00:00Z', '2026-02-15T11:00:00Z', '2026-04-10T14:00:00Z'),
  ('00000000-0000-0000-0000-00000000b401', '00000000-0000-0000-0000-000000000a04', 'bridgeway-pilot',           'Doc OCR pilot',                               'draft',  'sandbox',    14,   0.7800, '2026-05-13T10:14:00Z', '2026-04-28T16:00:00Z', '2026-05-08T16:00:00Z')
on conflict (id) do update set
  name = excluded.name,
  status = excluded.status,
  env = excluded.env,
  runs_total = excluded.runs_total,
  success_rate = excluded.success_rate,
  last_run_at = excluded.last_run_at,
  updated_at = excluded.updated_at;

-- Runs: a few historical runs for each Acme workflow.

insert into public.obl_runs (id, workflow_id, tenant_id, status, started_at, duration_ms, loan_ref)
values
  ('00000000-0000-0000-0000-00000000c101', '00000000-0000-0000-0000-00000000b101', '00000000-0000-0000-0000-000000000a01', 'succeeded',      '2026-05-13T07:42:00Z', 4820, 'L-2026-04822'),
  ('00000000-0000-0000-0000-00000000c102', '00000000-0000-0000-0000-00000000b102', '00000000-0000-0000-0000-000000000a01', 'awaiting_human', '2026-05-13T08:11:00Z', 0,    'L-2026-04801'),
  ('00000000-0000-0000-0000-00000000c103', '00000000-0000-0000-0000-00000000b101', '00000000-0000-0000-0000-000000000a01', 'failed',         '2026-05-13T06:01:00Z', 1820, 'L-2026-04790'),
  ('00000000-0000-0000-0000-00000000c104', '00000000-0000-0000-0000-00000000b101', '00000000-0000-0000-0000-000000000a01', 'succeeded',      '2026-05-13T05:14:00Z', 4220, 'L-2026-04785'),
  ('00000000-0000-0000-0000-00000000c201', '00000000-0000-0000-0000-00000000b201', '00000000-0000-0000-0000-000000000a02', 'succeeded',      '2026-05-13T11:20:00Z', 3940, 'L-2026-S-1102'),
  ('00000000-0000-0000-0000-00000000c202', '00000000-0000-0000-0000-00000000b202', '00000000-0000-0000-0000-000000000a02', 'succeeded',      '2026-05-13T11:18:00Z', 2710, 'L-2026-S-1099'),
  ('00000000-0000-0000-0000-00000000c401', '00000000-0000-0000-0000-00000000b401', '00000000-0000-0000-0000-000000000a04', 'failed',         '2026-05-13T10:14:00Z',  610, 'L-DEMO-001')
on conflict (id) do nothing;

-- Connections (per tenant, per service).

insert into public.obl_connections (id, tenant_id, service, env, account, connected_at)
values
  ('00000000-0000-0000-0000-00000000d101', '00000000-0000-0000-0000-000000000a01', 'encompass', 'production', 'Acme prod tenant',  '2026-04-01T10:00:00Z'),
  ('00000000-0000-0000-0000-00000000d102', '00000000-0000-0000-0000-000000000a01', 'anthropic', 'production', 'acme-prod-key',     '2026-04-01T10:00:00Z'),
  ('00000000-0000-0000-0000-00000000d201', '00000000-0000-0000-0000-000000000a02', 'encompass', 'production', 'Summit prod tenant','2026-04-01T10:00:00Z'),
  ('00000000-0000-0000-0000-00000000d202', '00000000-0000-0000-0000-000000000a02', 'slack',     'production', 'Summit workspace',  '2026-04-02T09:00:00Z'),
  ('00000000-0000-0000-0000-00000000d301', '00000000-0000-0000-0000-000000000a03', 'encompass', 'production', 'Northstar tenant',  '2026-04-01T10:00:00Z'),
  ('00000000-0000-0000-0000-00000000d401', '00000000-0000-0000-0000-000000000a04', 'encompass', 'sandbox',    'Bridgeway sandbox', '2026-04-28T16:00:00Z'),
  ('00000000-0000-0000-0000-00000000d501', '00000000-0000-0000-0000-000000000a05', 'encompass', 'production', 'Meridian tenant',   '2025-11-08T09:00:00Z')
on conflict (id) do nothing;

insert into public.obl_connection_health_checks (connection_id, status, latency_ms, checked_at)
values
  ('00000000-0000-0000-0000-00000000d101', 'degraded',      2140, '2026-05-13T11:35:00Z'),
  ('00000000-0000-0000-0000-00000000d102', 'ok',             388, '2026-05-13T11:36:00Z'),
  ('00000000-0000-0000-0000-00000000d201', 'ok',             612, '2026-05-13T11:32:00Z'),
  ('00000000-0000-0000-0000-00000000d202', 'ok',             132, '2026-05-13T11:36:00Z'),
  ('00000000-0000-0000-0000-00000000d301', 'ok',             720, '2026-05-13T11:30:00Z'),
  ('00000000-0000-0000-0000-00000000d401', 'ok',             480, '2026-05-13T11:28:00Z'),
  ('00000000-0000-0000-0000-00000000d501', 'down',          null, '2026-05-13T11:00:00Z');

-- Audit entries.

insert into public.obl_audit_entries (at, actor, tenant_id, action, summary, severity)
values
  ('2026-05-13T11:30:00Z', 'platform@openbroker.dev',     '00000000-0000-0000-0000-000000000a04', 'user.invited',              'Invited grant.murphy@bridgeway.com as viewer',                                'info'),
  ('2026-05-13T10:18:00Z', 'dan.park@acmelending.com',    '00000000-0000-0000-0000-000000000a01', 'workflow.published',        'Published ''Condition extraction from disclosed docs'' v7',                   'info'),
  ('2026-05-13T09:14:00Z', 'runtime',                      '00000000-0000-0000-0000-000000000a02', 'policy.no_deletion.blocked','Blocked DELETE /encompass/v3/loans/{id} from workflow ''cleanup-pilot''',     'blocked'),
  ('2026-05-13T08:00:00Z', 'platform@openbroker.dev',     '00000000-0000-0000-0000-000000000a05', 'tenant.suspended',          'Suspended for non-payment; workflows paused',                                 'warning'),
  ('2026-05-13T07:42:00Z', 'jane.morris@acmelending.com', '00000000-0000-0000-0000-000000000a01', 'connection.test',           'Re-tested Encompass production connection → OK (latency 412ms)',              'info'),
  ('2026-05-12T22:09:00Z', 'platform@openbroker.dev',     '00000000-0000-0000-0000-000000000a01', 'tenant.plan_changed',       'Plan changed from growth → enterprise',                                       'info'),
  ('2026-05-12T18:30:00Z', 'taylor.kim@summitmortgage.com','00000000-0000-0000-0000-000000000a02', 'workflow.paused',           'Paused ''Service SLA babysitter'' for parameter review',                      'info');

-- Alerts (open + acknowledged).

insert into public.obl_alerts (severity, tenant_id, title, detail, at, acknowledged)
values
  ('critical', '00000000-0000-0000-0000-000000000a01', 'Encompass OAuth latency spike',  'p95 latency exceeded 2.0s in the last 10 minutes on Acme Lending''s production environment.',                '2026-05-13T11:35:00Z', false),
  ('warning',  '00000000-0000-0000-0000-000000000a03', 'Trial usage at 82% of monthly budget', 'Northstar Home Loans burned through 6,210 of 25,000 runs with 18 days left in the cycle.',          '2026-05-13T09:00:00Z', false),
  ('info',     null,                                    'Anthropic API: scheduled maintenance', 'Anthropic is performing maintenance 2026-05-15 02:00–04:00 UTC. No expected impact.',                  '2026-05-12T16:00:00Z', true);

-- Policies + their enforcement layers.

insert into public.obl_policies (id, name, enforced, description, blocked_24h)
values
  ('no-deletion',           'No-deletion guardrail',     true,  'Never delete loans, documents, attachments, conditions, milestones, contacts, or fields in Encompass.', 3),
  ('sandbox-by-default',    'Sandbox-by-default',         true,  'New tenants and new workflows default to the Encompass sandbox until production is explicitly chosen.',  0),
  ('human-approval-on-write','Human approval on writes', false, 'Recommended pattern: every workflow that writes to Encompass should include a human approval step.',     0)
on conflict (id) do update set
  name = excluded.name,
  enforced = excluded.enforced,
  description = excluded.description,
  blocked_24h = excluded.blocked_24h;

insert into public.obl_policy_layers (policy_id, idx, name, ok)
values
  ('no-deletion',           0, 'Catalog filter',                 true),
  ('no-deletion',           1, 'Portal preflight',               true),
  ('no-deletion',           2, 'Runtime HTTP adapter',           true),
  ('no-deletion',           3, 'AI tool whitelist',              true),
  ('sandbox-by-default',    0, 'Trial tenants → sandbox env',    true),
  ('sandbox-by-default',    1, 'First-publish warning',          true),
  ('human-approval-on-write',0,'Catalog hint',                   true),
  ('human-approval-on-write',1,'Required approval step',         false)
on conflict (policy_id, idx) do update set name = excluded.name, ok = excluded.ok;
