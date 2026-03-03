"use client";

import { Toaster } from "sonner";

export function SystemToaster() {
  return <Toaster position="top-right" closeButton richColors duration={4000} />;
}
