import type { Metadata } from "next";
import { requirePlatformAdmin } from "@/lib/auth/requirePlatformAdmin";

export const metadata: Metadata = {
  title: "OpenBroker Platform Console",
  description: "Operator console for the OpenBroker AI workflow portal",
};

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth: middleware redirects unauthorized users, but if the
  // matcher ever lets a /platform request through, this guard also redirects.
  await requirePlatformAdmin();
  return children;
}
