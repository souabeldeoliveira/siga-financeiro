"use client";

import { useEffect } from "react";

const stalePageError = /chunkloaderror|loading chunk|dynamically imported module|rsc payload|failed to fetch/i;
const recoveryKey = "siga-route-load-recovered";

export function RouteLoadRecovery() {
  useEffect(() => {
    const recover = (reason: unknown) => {
      const message = reason instanceof Error ? reason.message : String(reason ?? "");
      if (!stalePageError.test(message) || sessionStorage.getItem(recoveryKey)) return;
      sessionStorage.setItem(recoveryKey, "true");
      window.location.reload();
    };

    const onError = (event: ErrorEvent) => recover(event.error ?? event.message);
    const onRejection = (event: PromiseRejectionEvent) => recover(event.reason);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
