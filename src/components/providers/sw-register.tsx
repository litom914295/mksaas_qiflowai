"use client";

import { useEffect } from "react";

export function SWRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("[PWA] Service Worker registered"))
      .catch((err) => console.error("[PWA] Service Worker registration failed", err));
  }, []);

  return null;
}
