type IdentityRevealPayload = {
  conversationId: string;
  reason: string;
  revealedByUserId: string;
  revealedAt: string;
};

type PIIOverridePayload = {
  conversationId: string;
  detectedTypes: string[];
  overriddenByUserId: string;
  overriddenAt: string;
};

export function logIdentityReveal(payload: IdentityRevealPayload): void {
  // Placeholder API stub for backend audit integration.
  console.info("logIdentityReveal", payload);
}

export function logPIIOverride(payload: PIIOverridePayload): void {
  // Placeholder API stub for backend audit integration.
  console.info("logPIIOverride", payload);
}
