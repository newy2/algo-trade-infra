export const AppEnvs = ["test", "prod"] as const;
export type AppEnv = (typeof AppEnvs)[number];
