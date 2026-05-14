import { listPlatformRuns } from "@/lib/data/runs";
import { RunsTable } from "@/components/platform/tables/RunsTable";

export default async function PlatformRunsPage() {
  const runs = await listPlatformRuns(200);
  return <RunsTable runs={runs} />;
}
