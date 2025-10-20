// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
// Если есть шапка:
// import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Калькулятор подписок",
  description: "Управление подписками и расчет ежемесячных/годовых затрат",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-dvh bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-white">
        {/* <Header /> */}
        {children}
      </body>
    </html>
  );
}
