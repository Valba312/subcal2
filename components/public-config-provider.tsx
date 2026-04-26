"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type PublicFeature = {
  key: "calculator" | "analytics" | "agent";
  label: string;
  description: string;
  enabled: boolean;
  updatedAt: string;
};

export type PublicContact = {
  id: number;
  title: string;
  value: string;
  href: string | null;
  isActive: boolean;
  createdAt: string;
};

type PublicConfig = {
  isReady: boolean;
  features: PublicFeature[];
  contacts: PublicContact[];
  refreshConfig: () => Promise<void>;
  isFeatureEnabled: (key: PublicFeature["key"]) => boolean;
};

const PublicConfigContext = createContext<PublicConfig | null>(null);

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function PublicConfigProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [features, setFeatures] = useState<PublicFeature[]>([]);
  const [contacts, setContacts] = useState<PublicContact[]>([]);

  const refreshConfig = useCallback(async () => {
    try {
      const response = await fetch("/api/public/config", {
        cache: "no-store",
      });
      const payload = await readJson<{ features: PublicFeature[]; contacts: PublicContact[] }>(response);
      setFeatures(payload?.features ?? []);
      setContacts(payload?.contacts ?? []);
    } catch (error) {
      console.warn("Не удалось загрузить публичные настройки", error);
      setFeatures([]);
      setContacts([]);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    void refreshConfig();
  }, [refreshConfig]);

  const value = useMemo<PublicConfig>(
    () => ({
      isReady,
      features,
      contacts,
      refreshConfig,
      isFeatureEnabled: (key) => features.find((feature) => feature.key === key)?.enabled ?? true,
    }),
    [contacts, features, isReady, refreshConfig]
  );

  return <PublicConfigContext.Provider value={value}>{children}</PublicConfigContext.Provider>;
}

export function usePublicConfig() {
  const context = useContext(PublicConfigContext);

  if (!context) {
    throw new Error("usePublicConfig must be used within PublicConfigProvider");
  }

  return context;
}
