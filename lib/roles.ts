export type Role = "patient" | "doctor" | "nutritionist" | "coach" | "admin" | "super_admin";

export const STAFF_ROLES: Role[] = ["doctor", "nutritionist", "coach", "admin", "super_admin"];

export function isStaffRole(role: string | null | undefined): boolean {
  return STAFF_ROLES.includes(role as Role);
}

/** True for both admin and super_admin — super_admin is a strict superset of admin. */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

/** True only for super_admin — gates platform-wide config (Settings, Referrals, Automation, Plans, Templates). */
export function isSuperAdminRole(role: string | null | undefined): boolean {
  return role === "super_admin";
}

export function homePathForRole(role: string | null | undefined): string {
  if (isAdminRole(role)) return "/staff/performance";
  return isStaffRole(role) ? "/staff" : "/today";
}
