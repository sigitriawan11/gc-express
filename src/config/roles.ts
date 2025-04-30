export const roleCombinations = [

] as const;

export type RoleMiddleware = typeof roleCombinations[number];
