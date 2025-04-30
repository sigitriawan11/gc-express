export const roles: { [key: string]: string } = {

} as const;

export type RoleName = keyof typeof roles;
