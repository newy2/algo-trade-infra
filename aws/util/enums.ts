export const AppEnvs = ["dev", "prd"] as const;
export type AppEnv = (typeof AppEnvs)[number];
