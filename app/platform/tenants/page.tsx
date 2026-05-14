import { listTenants } from "@/lib/data/tenants";
import { TenantsTable } from "@/components/platform/tables/TenantsTable";

export default async function PlatformTenantsPage() {
  const tenants = await listTenants();
  return <TenantsTable tenants={tenants} />;
}
