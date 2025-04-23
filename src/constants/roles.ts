export const roles: { [key: string]: string } = {
  super_admin: "123e4567-e89b-12d3-a456-426614174000",
  member: "123e4567-e89b-12d3-a456-426614174001",
  guest: "123e4567-e89b-12d3-a456-426614174002",
} as const;

export type RoleName = keyof typeof roles;
