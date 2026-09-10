import { Profile, AuthSession } from "@/types/auth";

export const DEFAULT_ADMIN_CREDENTIALS = {
  username: "CODEBITS",
  phone: "9920336099",
  password: "codebits@mrf",
};

export const ADMIN_PROFILE: Profile = {
  id: "admin-codebits",
  full_name: "Prof. Rohit Falake (M.R.F)",
  username: "CODEBITS",
  email: "mrf@codebits.ac.in",
  phone: "9920336099",
  role: "admin",
  created_at: new Date().toISOString(),
};

const STORAGE_KEY = "codebits_auth_session";

export function normalizePhone(phoneStr: string): string {
  return phoneStr.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getCurrentUser(): Profile | null {
  const session = getSession();
  return session ? session.user : null;
}

export function setSession(user: Profile, remember = true): AuthSession {
  const duration = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days vs 1 day
  const session: AuthSession = {
    user,
    sessionId: `cb_sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    expiresAt: Date.now() + duration,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent("codebits-auth-change", { detail: session }));
  }

  return session;
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("codebits-auth-change", { detail: null }));
  }
}

export interface AuthResult {
  success: boolean;
  user?: Profile;
  error?: string;
}

export function authenticateUser(identifier: string, password: string, rememberSession = true): AuthResult {
  const cleanId = identifier.trim();
  const cleanPass = password.trim();

  if (!cleanId) {
    return { success: false, error: "Please enter your username, mobile number, or email." };
  }

  if (!cleanPass) {
    return { success: false, error: "Please enter your password." };
  }

  // 1. Check Admin Authentication
  const isAdminUsername = cleanId.toUpperCase() === DEFAULT_ADMIN_CREDENTIALS.username.toUpperCase();
  const isAdminPhone = normalizePhone(cleanId) === DEFAULT_ADMIN_CREDENTIALS.phone;

  if (isAdminUsername || isAdminPhone) {
    if (cleanPass === DEFAULT_ADMIN_CREDENTIALS.password) {
      setSession(ADMIN_PROFILE, rememberSession);
      return { success: true, user: ADMIN_PROFILE };
    } else {
      return { success: false, error: "Incorrect password for administrator (CODEBITS)." };
    }
  }

  // 2. Student Authentication
  const isNumeric = /^\d+$/.test(cleanId);
  if (isNumeric) {
    const phoneClean = normalizePhone(cleanId);
    if (!/^[6-9]\d{9}$/.test(phoneClean)) {
      return { success: false, error: "Please provide a valid 10-digit Indian mobile number." };
    }
  } else if (cleanId.includes("@")) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanId)) {
      return { success: false, error: "Please provide a valid email address format." };
    }
  } else {
    // Neither admin username nor valid format
    return { 
      success: false, 
      error: "User identifier not recognized. Enter 'CODEBITS' for Admin or your student email/mobile." 
    };
  }

  if (cleanPass.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  const studentUser: Profile = {
    id: `student-${Date.now()}`,
    full_name: cleanId.includes("@") ? cleanId.split("@")[0] : `Student (+91 ${cleanId.slice(-4)})`,
    email: cleanId.includes("@") ? cleanId : `student${cleanId.slice(-4)}@mu.ac.in`,
    phone: isNumeric ? cleanId : "9876543210",
    role: "student",
    created_at: new Date().toISOString(),
  };

  setSession(studentUser, rememberSession);
  return { success: true, user: studentUser };
}
