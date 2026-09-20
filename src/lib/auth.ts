import { useState, useEffect } from "react";

export type UserRole = "admin" | "business" | "staff";
export type StaffRoleType = "provider" | "receptionist";

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
  staffRole?: StaffRoleType;
  title?: string;
}

const AUTH_KEY = "brg_auth";

export function getStoredAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setStoredAuth(user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("brg_auth_change"));
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event("brg_auth_change"));
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuth());

  useEffect(() => {
    const handler = () => {
      setUser(getStoredAuth());
    };
    window.addEventListener("brg_auth_change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("brg_auth_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return {
    user,
    isStaff: user?.role === "staff",
    isReceptionist: user?.role === "staff" && user?.staffRole === "receptionist",
    isProvider: user?.role === "staff" && user?.staffRole !== "receptionist",
    isAdmin: user?.role === "admin",
    isBusiness: user?.role === "business",
    logout: () => {
      clearStoredAuth();
      window.location.href = "/";
    }
  };
}
