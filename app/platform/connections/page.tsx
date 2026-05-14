import { listConnectionHealth } from "@/lib/data/connections";
import { ConnectionsTable } from "@/components/platform/tables/ConnectionsTable";

export default async function PlatformConnectionsPage() {
  const rows = await listConnectionHealth();
  return <ConnectionsTable rows={rows} />;
}
