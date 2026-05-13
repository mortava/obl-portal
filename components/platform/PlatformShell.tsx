import { PlatformSidebar } from "./PlatformSidebar";
import { PlatformTopbar } from "./PlatformTopbar";

interface PlatformShellProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  alertCount?: number;
  children: React.ReactNode;
}

export function PlatformShell({ title, subtitle, action, alertCount, children }: PlatformShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ink-50">
      <PlatformSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <PlatformTopbar title={title} subtitle={subtitle} action={action} alertCount={alertCount} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
