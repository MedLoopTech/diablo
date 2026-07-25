export type Role = "patient" | "doctor" | "nutritionist" | "coach" | "admin";

export const STAFF_ROLES: Role[] = ["doctor", "nutritionist", "coach", "admin"];

export function isStaffRole(role: string | null | undefined): boolean {
  return STAFF_ROLES.includes(role as Role);
}

export function homePathForRole(role: string | null | undefined): string {
  return isStaffRole(role) ? "/staff" : "/today";
}
