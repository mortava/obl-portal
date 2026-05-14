import { listPlatformWorkflows } from "@/lib/data/workflows";
import { listTenants } from "@/lib/data/tenants";
import { WorkflowsTable } from "@/components/platform/tables/WorkflowsTable";

export default async function PlatformWorkflowsPage() {
  const [workflows, tenants] = await Promise.all([listPlatformWorkflows(), listTenants()]);
  return <WorkflowsTable workflows={workflows} tenants={tenants} />;
}
