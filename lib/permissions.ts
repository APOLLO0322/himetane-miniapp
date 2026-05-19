import type { Role } from "./types";

export function isAdmin(role: Role | string): boolean {
  return role === "admin_all" || role === "admin_creator";
}

export function isAdminAll(role: Role | string): boolean {
  return role === "admin_all";
}

export function isClientRole(role: Role | string): boolean {
  return role === "client_owner" || role === "client_manager";
}

// admin_creator がアクセスできるパス
export const CREATOR_ALLOWED_PREFIXES = [
  "/admin/shoots",
  "/admin/assets",
  "/admin/requests",
  "/admin/deliveries",
];
