export const roleCombinations = [
  "roles:guest",
  "roles:guest|member",
  "roles:guest|member|super_admin",
  "roles:guest|super_admin",
  "roles:guest|super_admin|member",
  "roles:member",
  "roles:member|guest",
  "roles:member|guest|super_admin",
  "roles:member|super_admin",
  "roles:member|super_admin|guest",
  "roles:super_admin",
  "roles:super_admin|guest",
  "roles:super_admin|guest|member",
  "roles:super_admin|member",
  "roles:super_admin|member|guest"
] as const;

export type RoleMiddleware = typeof roleCombinations[number];
