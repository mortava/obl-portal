// Platform-level (admin/operator) domain types.
// User-panel types live in lib/types.ts; platform aggregates across tenants.

import type { Env, WorkflowStatus } from "./types";

export type TenantPlan = "starter" | "growth" | "enterprise";
export type TenantStatus = "active" | "trial" | "suspended";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  status: TenantStatus;
  env: Env;
  createdAt: string;
  primaryContact: string;
  workflowsLive: number;
  runs24h: number;
  successRate: number;
  monthlyRunBudget: number;
  monthlyRunsUsed: number;
}

export type PlatformUserRole = "owner" | "admin" | "operator" | "viewer";

export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  tenantName: string;
  role: PlatformUserRole;
  lastSeen: string | null;
  invitedAt: string;
}

export type AuditAction =
  | "tenant.created"
  | "tenant.suspended"
  | "tenant.plan_changed"
  | "user.invited"
  | "user.role_changed"
  | "workflow.published"
  | "workflow.paused"
  | "connection.test"
  | "policy.no_deletion.blocked"
  | "platform.settings_changed";

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  tenantId: string | null;
  tenantName: string | null;
  action: AuditAction;
  summary: string;
  severity: "info" | "warning" | "blocked";
}

export interface PlatformAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  tenantId: string | null;
  title: string;
  detail: string;
  at: string;
  acknowledged: boolean;
}

export interface PolicyStatus {
  id: string;
  name: string;
  enforced: boolean;
  layers: { name: string; ok: boolean }[];
  blocked24h: number;
  description: string;
}

export interface ConnectionHealth {
  tenantId: string;
  tenantName: string;
  service: "encompass" | "anthropic" | "slack" | "email";
  env: Env;
  status: "ok" | "degraded" | "down" | "not_connected";
  lastCheckAt: string;
  latencyMs?: number;
}

// Aggregated cross-tenant workflow view for platform operators.
export interface PlatformWorkflow {
  id: string;
  tenantId: string;
  tenantName: string;
  name: string;
  status: WorkflowStatus;
  env: Env;
  runs24h: number;
  successRate: number;
  lastRunAt: string | null;
}
