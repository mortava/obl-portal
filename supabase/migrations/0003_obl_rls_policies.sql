-- obl-portal: RLS policies. Every table is gated by either:
--   (a) public.obl_is_platform_admin() — true if caller is in obl_profiles with
--       platform_role in ('admin','support'), OR
--   (b) the row's tenant_id matches the caller's profile.tenant_id.
--
-- Service-role bypasses RLS automatically — runtime workflow writes use the
-- service role key. End-user reads/writes go through the anon key + session.

begin;

-- ── Helper: is the current caller a platform admin? ─────────────────────────

create or replace function public.obl_is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.obl_profiles
    where id = auth.uid()
      and platform_role in ('admin', 'support')
  );
$$;

create or replace function public.obl_current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.obl_profiles where id = auth.uid();
$$;

grant execute on function public.obl_is_platform_admin() to authenticated;
grant execute on function public.obl_current_tenant_id() to authenticated;

-- ── obl_tenants ──────────────────────────────────────────────────────────────

drop policy if exists obl_tenants_select on public.obl_tenants;
create policy obl_tenants_select on public.obl_tenants
  for select to authenticated
  using (public.obl_is_platform_admin() or id = public.obl_current_tenant_id());

drop policy if exists obl_tenants_write on public.obl_tenants;
create policy obl_tenants_write on public.obl_tenants
  for all to authenticated
  using (public.obl_is_platform_admin())
  with check (public.obl_is_platform_admin());

-- ── obl_profiles ─────────────────────────────────────────────────────────────

drop policy if exists obl_profiles_select on public.obl_profiles;
create policy obl_profiles_select on public.obl_profiles
  for select to authenticated
  using (
    public.obl_is_platform_admin()
    or id = auth.uid()
    or tenant_id = public.obl_current_tenant_id()
  );

drop policy if exists obl_profiles_update_self on public.obl_profiles;
create policy obl_profiles_update_self on public.obl_profiles
  for update to authenticated
  using (id = auth.uid() or public.obl_is_platform_admin())
  with check (id = auth.uid() or public.obl_is_platform_admin());

drop policy if exists obl_profiles_admin_all on public.obl_profiles;
create policy obl_profiles_admin_all on public.obl_profiles
  for all to authenticated
  using (public.obl_is_platform_admin())
  with check (public.obl_is_platform_admin());

-- ── obl_workflows / obl_runs / obl_run_steps / obl_connections ──────────────
--
-- Same pattern for each: platform admin sees all, tenant members see their own.

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'obl_workflows',
    'obl_runs',
    'obl_connections',
    'obl_audit_entries',
    'obl_alerts'
  ])
  loop
    execute format('drop policy if exists %1$s_select on public.%1$s;', t);
    execute format(
      'create policy %1$s_select on public.%1$s
         for select to authenticated
         using (
           public.obl_is_platform_admin()
           or tenant_id is not distinct from public.obl_current_tenant_id()
         );', t);

    execute format('drop policy if exists %1$s_admin_write on public.%1$s;', t);
    execute format(
      'create policy %1$s_admin_write on public.%1$s
         for all to authenticated
         using (public.obl_is_platform_admin())
         with check (public.obl_is_platform_admin());', t);
  end loop;
end$$;

-- run_steps inherits its tenant gate from the parent run.

drop policy if exists obl_run_steps_select on public.obl_run_steps;
create policy obl_run_steps_select on public.obl_run_steps
  for select to authenticated
  using (
    public.obl_is_platform_admin()
    or exists (
      select 1 from public.obl_runs r
      where r.id = obl_run_steps.run_id
        and r.tenant_id = public.obl_current_tenant_id()
    )
  );

-- connection_health_checks inherits from connections.

drop policy if exists obl_chc_select on public.obl_connection_health_checks;
create policy obl_chc_select on public.obl_connection_health_checks
  for select to authenticated
  using (
    public.obl_is_platform_admin()
    or exists (
      select 1 from public.obl_connections c
      where c.id = obl_connection_health_checks.connection_id
        and c.tenant_id = public.obl_current_tenant_id()
    )
  );

-- ── obl_policies / obl_policy_layers ────────────────────────────────────────
-- Readable by every authenticated user; writes restricted to platform admin.

drop policy if exists obl_policies_select on public.obl_policies;
create policy obl_policies_select on public.obl_policies
  for select to authenticated using (true);

drop policy if exists obl_policies_admin_write on public.obl_policies;
create policy obl_policies_admin_write on public.obl_policies
  for all to authenticated
  using (public.obl_is_platform_admin())
  with check (public.obl_is_platform_admin());

drop policy if exists obl_policy_layers_select on public.obl_policy_layers;
create policy obl_policy_layers_select on public.obl_policy_layers
  for select to authenticated using (true);

drop policy if exists obl_policy_layers_admin_write on public.obl_policy_layers;
create policy obl_policy_layers_admin_write on public.obl_policy_layers
  for all to authenticated
  using (public.obl_is_platform_admin())
  with check (public.obl_is_platform_admin());

-- ── Tenant operators may acknowledge their own tenant's alerts ───────────────
-- (Override the generic admin-only write policy from the loop above for alerts.)

drop policy if exists obl_alerts_tenant_ack on public.obl_alerts;
create policy obl_alerts_tenant_ack on public.obl_alerts
  for update to authenticated
  using (
    public.obl_is_platform_admin()
    or tenant_id is not distinct from public.obl_current_tenant_id()
  )
  with check (
    public.obl_is_platform_admin()
    or tenant_id is not distinct from public.obl_current_tenant_id()
  );

commit;
