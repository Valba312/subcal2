"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SUBSCRIPTIONS, Subscription } from "../lib/subscriptions";

const STORAGE_KEY = "subkeeper.subscriptions";

const parseSubscriptions = (value: unknown): Subscription[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  const valid = value.filter((item): item is Subscription => {
    return (
      typeof item === "object" &&
      item !== null &&
      typeof item.id === "number" &&
      typeof item.name === "string" &&
      typeof item.cost === "number" &&
      typeof item.currency === "string" &&
      typeof item.months === "number" &&
      typeof item.frequencyLabel === "string" &&
      typeof item.nextPaymentDate === "string"
    );
  });

  return valid.length === value.length ? valid : null;
};

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(DEFAULT_SUBSCRIPTIONS);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setInitialized(true);
        return;
      }

      const parsed = JSON.parse(raw);
      const valid = parseSubscriptions(parsed);
      if (valid) {
        setSubscriptions(valid);
      }
    } catch (error) {
      console.warn("Не удалось загрузить сохранённые подписки", error);
    } finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!initialized || typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    } catch (error) {
      console.warn("Не удалось сохранить подписки", error);
    }
  }, [initialized, subscriptions]);

  const addSubscription = useCallback((subscription: Subscription) => {
    setSubscriptions((prev) => [...prev, subscription]);
  }, []);

  const removeSubscription = useCallback((id: number) => {
    setSubscriptions((prev) => prev.filter((subscription) => subscription.id !== id));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSubscriptions(DEFAULT_SUBSCRIPTIONS);
  }, []);

  return {
    subscriptions,
    addSubscription,
    removeSubscription,
    resetToDefaults,
  };
};
