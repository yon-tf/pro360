"use client";

const PERF_FLAG_KEY = "pro360:perf";

function isPerfEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV === "production") return false;
  try {
    return window.localStorage.getItem(PERF_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export function measureInDev<T>(label: string, fn: () => T): T {
  if (!isPerfEnabled()) return fn();
  const start = typeof performance !== "undefined" ? performance.now() : Date.now();
  try {
    return fn();
  } finally {
    const end = typeof performance !== "undefined" ? performance.now() : Date.now();
    const durationMs = end - start;
    if (durationMs >= 1) {
      console.info(`[pro360 perf] ${label}: ${durationMs.toFixed(2)}ms`);
    }
  }
}

export function setPerfInstrumentation(enabled: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PERF_FLAG_KEY, enabled ? "1" : "0");
  } catch {
    // no-op
  }
}
