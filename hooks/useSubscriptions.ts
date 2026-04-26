"use client";

import { useCallback, useEffect, useState } from "react";

import { Subscription } from "../lib/subscriptions";
import { useAuth } from "../components/auth-provider";

type SubscriptionPayload = {
  subscriptions?: Subscription[];
  subscription?: Subscription;
  error?: string;
};

async function readJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export const useSubscriptions = () => {
  const { isReady, user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [initialized, setInitialized] = useState(false);

  const loadSubscriptions = useCallback(async () => {
    if (!user) {
      setSubscriptions([]);
      setInitialized(true);
      return;
    }

    try {
      const response = await fetch("/api/subscriptions", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const payload = await readJson<SubscriptionPayload>(response);
      setSubscriptions(payload?.subscriptions ?? []);
    } catch (error) {
      console.warn("Не удалось загрузить подписки", error);
      setSubscriptions([]);
    } finally {
      setInitialized(true);
    }
  }, [user]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void loadSubscriptions();
  }, [isReady, loadSubscriptions]);

  const addSubscription = useCallback(async (subscription: Omit<Subscription, "id">) => {
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      const payload = await readJson<SubscriptionPayload>(response);
      if (!response.ok || !payload?.subscription) {
        return { ok: false, error: payload?.error ?? "Не удалось добавить подписку." };
      }

      setSubscriptions((prev) => [...prev, payload.subscription as Subscription]);
      return { ok: true };
    } catch (error) {
      console.warn("Не удалось добавить подписку", error);
      return { ok: false, error: "Не удалось добавить подписку." };
    }
  }, []);

  const removeSubscription = useCallback(async (id: number) => {
    try {
      await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setSubscriptions((prev) => prev.filter((subscription) => subscription.id !== id));
    } catch (error) {
      console.warn("Не удалось удалить подписку", error);
    }
  }, []);

  const resetToDefaults = useCallback(async () => {
    try {
      const response = await fetch("/api/subscriptions/reset", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        return;
      }

      await loadSubscriptions();
    } catch (error) {
      console.warn("Не удалось сбросить подписки на демо-набор", error);
    }
  }, [loadSubscriptions]);

  return {
    subscriptions,
    initialized,
    addSubscription,
    removeSubscription,
    resetToDefaults,
    reloadSubscriptions: loadSubscriptions,
  };
};
