import Link from "next/link";
import { Workflow, Plug, ArrowRight, BookOpen } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const GUIDES = [
  {
    href: "/help/manage-workflows",
    icon: Workflow,
    title: "How to manage workflows",
    summary:
      "Create, edit, publish, pause, and monitor AI workflows. Walks through the 6-step builder, the Runs tab, and the YAML view.",
    readTime: "6 min read",
  },
  {
    href: "/help/connectors",
    icon: Plug,
    title: "How to add connectors",
    summary:
      "Set up Encompass / TPO Connect, Anthropic, Slack, and Email. Includes env-var checklist, OAuth flow, and the live connection test.",
    readTime: "5 min read",
  },
];

export default function HelpIndexPage() {
  return (
    <AppShell title="Guides" subtitle="How-to articles for getting the most out of the portal">
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <div className="card p-5 flex items-start gap-3">
          <span className="w-10 h-10 rounded-lg bg-ink-100 text-ink-700 grid place-items-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink-900">Where to start</h2>
            <p className="text-xs text-ink-600 mt-1">
              These guides cover the day-to-day tasks that user-panel operators need: building and
              maintaining workflows, and wiring the systems those workflows act in. Platform-level
              docs (multi-tenant operations) live in the{" "}
              <Link href="/platform" className="text-brand-700 hover:underline">
                Platform console
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {GUIDES.map((g) => {
            const Icon = g.icon;
            return (
              <Link
                key={g.href}
                href={g.href}
                className="card p-5 hover:shadow-soft transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="w-10 h-10 rounded-lg bg-ink-100 text-ink-700 grid place-items-center group-hover:bg-ink-900 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] text-ink-500">{g.readTime}</span>
                </div>
                <div className="text-sm font-semibold text-ink-900">{g.title}</div>
                <p className="text-xs text-ink-500 mt-1.5">{g.summary}</p>
                <div className="mt-4 text-xs text-brand-700 inline-flex items-center gap-1 group-hover:underline">
                  Read the guide <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
