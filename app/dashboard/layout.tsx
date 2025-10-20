// app/dashboard/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — калькулятор подписок" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="container mx-auto px-4 py-8">{children}</div>;
}