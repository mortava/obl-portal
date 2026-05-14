import { listAlerts } from "@/lib/data/alerts";
import { AlertsList } from "@/components/platform/AlertsList";

export default async function PlatformAlertsPage() {
  const alerts = await listAlerts();
  return <AlertsList alerts={alerts} />;
}
