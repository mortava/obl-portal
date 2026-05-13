import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenBroker Platform Console",
  description: "Operator console for the OpenBroker AI workflow portal",
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return children;
}
