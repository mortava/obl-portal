"use client";

import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";

interface TocEntry {
  id: string;
  label: string;
}

export function GuideLayout({
  title,
  subtitle,
  readTime,
  toc,
  children,
}: {
  title: string;
  subtitle: string;
  readTime: string;
  toc: TocEntry[];
  children: React.ReactNode;
}) {
  return (
    <AppShell title={title} subtitle={subtitle}>
      <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8">
        <article className="prose-guide">
          <Link
            href="/help"
            className="text-xs text-ink-500 hover:text-ink-900 inline-flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="w-3 h-3" />
            All guides
          </Link>
          <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">{title}</h1>
          <p className="text-sm text-ink-600 mt-1">{subtitle}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-ink-500 mt-2">
            <Clock className="w-3 h-3" />
            {readTime}
          </div>
          <div className="mt-8 space-y-10">{children}</div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-500 mb-2">
              On this page
            </div>
            <ul className="space-y-1.5">
              {toc.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className="text-xs text-ink-600 hover:text-ink-900 block py-1"
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-base font-semibold text-ink-900 border-b border-ink-200 pb-2 mb-4">
        {title}
      </h2>
      <div className="space-y-3 text-sm text-ink-700 leading-relaxed">{children}</div>
    </section>
  );
}

export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="space-y-3 list-decimal list-inside marker:text-ink-400 marker:font-medium">{children}</ol>;
}

export function Step({
  title,
  children,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <li className="text-sm text-ink-800">
      <span className="font-medium text-ink-900">{title}</span>
      {children && <div className="mt-1.5 ml-6 text-sm text-ink-600 space-y-2">{children}</div>}
    </li>
  );
}

export function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: "info" | "warning" | "success";
  title?: string;
  children: React.ReactNode;
}) {
  const VARIANTS: Record<string, string> = {
    info: "border-brand-200 bg-brand-50 text-brand-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  };
  return (
    <div className={`rounded-xl border p-4 text-xs leading-relaxed ${VARIANTS[variant]}`}>
      {title && <div className="font-semibold mb-1">{title}</div>}
      {children}
    </div>
  );
}

export function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-ink-900 text-ink-100 text-xs font-mono rounded-lg p-3 overflow-x-auto leading-relaxed">
      {children}
    </pre>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center px-1.5 py-0.5 rounded border border-ink-300 bg-white text-[11px] font-mono text-ink-700">
      {children}
    </kbd>
  );
}
