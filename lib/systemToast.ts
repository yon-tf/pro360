"use client";

import { toast } from "sonner";

const DEFAULT_DURATION_MS = 4000;

type ToastDescription = string | undefined;

export const systemToast = {
  success(message: string, description?: ToastDescription) {
    toast.success(message, { description, duration: DEFAULT_DURATION_MS });
  },
  pending(message: string, description?: ToastDescription) {
    toast.loading(message, { description, duration: DEFAULT_DURATION_MS });
  },
  error(message: string, description?: ToastDescription) {
    toast.error(message, { description, duration: DEFAULT_DURATION_MS });
  },
  warning(message: string, description?: ToastDescription) {
    toast.warning(message, { description, duration: DEFAULT_DURATION_MS });
  },
  info(message: string, description?: ToastDescription) {
    toast.info(message, { description, duration: DEFAULT_DURATION_MS });
  },
};
