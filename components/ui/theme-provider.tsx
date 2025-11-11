"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps as NextThemesProviderProps } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
} & Pick<NextThemesProviderProps, "attribute" | "defaultTheme" | "enableSystem">;

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute={attribute} defaultTheme={defaultTheme} enableSystem={enableSystem}>
      {children}
    </NextThemesProvider>
  );
}
