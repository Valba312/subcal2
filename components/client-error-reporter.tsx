"use client";

import { useEffect } from "react";

import { useAuth } from "./auth-provider";

export function ClientErrorReporter() {
  const { user } = useAuth();

  useEffect(() => {
    const report = (error: unknown, source = "client") => {
      const normalized = normalizeError(error);

      void fetch("/api/errors", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: normalized.message,
          stack: normalized.stack,
          path: window.location.pathname,
          userAgent: navigator.userAgent,
          severity: "critical",
          source,
          userId: user?.id,
        }),
      }).catch(() => undefined);
    };

    const handleError = (event: ErrorEvent) => {
      report(event.error ?? event.message, "window.error");
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      report(event.reason, "unhandledrejection");
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [user?.id]);

  return null;
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack ?? null,
    };
  }

  if (typeof error === "string") {
    return {
      message: error,
      stack: null,
    };
  }

  return {
    message: "Unknown client error",
    stack: JSON.stringify(error),
  };
}
