import { listAuditEntries } from "@/lib/data/audit";
import { AuditTable } from "@/components/platform/tables/AuditTable";

export default async function PlatformAuditPage() {
  const entries = await listAuditEntries(200);
  return <AuditTable entries={entries} />;
}
