/**
 * CodeBits Portal - Authentication & Identity Domain Types
 */

export type UserRole = "student" | "admin";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string; // Indian 10-digit mobile, e.g. "9876543210"
  role: UserRole;
  current_session_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthSession {
  user: Profile;
  sessionId: string;
  expiresAt: number;
}

export interface LoginFormData {
  identifier: string; // Email or 10-digit phone
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}
