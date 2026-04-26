// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import Header from "./components/Header";
import { AuthProvider } from "../components/auth-provider";
import { ClientErrorReporter } from "../components/client-error-reporter";
import { PublicConfigProvider } from "../components/public-config-provider";
import { ThemeProvider } from "../components/ui/theme-provider";
import { Toaster } from "../components/ui/toaster";

const fontSans = Inter({ subsets: ["cyrillic", "latin", "latin-ext"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "SubKeeper — калькулятор подписок",
  description:
    "SubKeeper помогает управлять подписками, считать ежемесячные и годовые расходы и находить точки экономии.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${fontSans.variable} bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <PublicConfigProvider>
              <ClientErrorReporter />
              <div className="flex min-h-dvh flex-col">
                <Header />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </PublicConfigProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
