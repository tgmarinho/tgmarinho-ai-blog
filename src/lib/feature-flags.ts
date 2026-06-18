export const featureFlags = {
  ask: process.env.NEXT_PUBLIC_FF_ASK_ENABLED === "true",
} as const;

export type FeatureFlag = keyof typeof featureFlags;
