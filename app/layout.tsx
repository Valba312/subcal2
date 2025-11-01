// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "SubKeeper — калькулятор подписок",
  description:
    "SubKeeper помогает управлять подписками, считать ежемесячные и годовые расходы и находить точки экономии.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="flex min-h-dvh flex-col bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-white">
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
