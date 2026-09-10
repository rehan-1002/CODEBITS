"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { LoginFormData } from "@/types/auth";
import { authenticateUser } from "@/lib/auth";

interface LoginFormProps {
  onSuccess?: () => void;
  concurrentReason?: boolean;
}

export function LoginForm({ onSuccess, concurrentReason }: LoginFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
    rememberSession: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const res = authenticateUser(formData.identifier, formData.password, formData.rememberSession);
    if (!res.success) {
      setLoading(false);
      setError(res.error || "Authentication failed.");
      return;
    }

    const isAdmin = res.user?.role === "admin";
    setSuccessMessage(
      isAdmin
        ? "Administrator session authorized. Redirecting to Vault..."
        : "Student session verified. Redirecting..."
    );

    setTimeout(() => {
      setLoading(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/vault");
      }
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {concurrentReason && (
        <div className="p-3.5 rounded-lg border border-amber-800/40 bg-amber-950/20 text-amber-300 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block font-mono">CONCURRENT SESSION TERMINATED</span>
            <span className="text-[11px]">You were logged out because this account was authenticated from another device. Single active session is strictly enforced.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg border border-red-800/40 bg-red-950/20 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="leading-tight">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-lg border border-emerald-800/40 bg-emerald-950/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="leading-tight">{successMessage}</span>
        </div>
      )}

      {/* Identifier: Email OR Phone OR Admin Username */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
          Username, Mobile, or Email
        </label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            placeholder="CODEBITS, 9920336099, or email"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/80 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/50 transition-all font-sans"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
            Password
          </label>
          <span className="text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--brand-primary)] cursor-pointer transition-colors">
            Reset Password?
          </span>
        </div>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter your security password"
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/80 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/50 transition-all font-sans"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none cursor-pointer p-1 transition-colors"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Remember Session & Biometric Check */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center space-x-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formData.rememberSession}
            onChange={(e) => setFormData({ ...formData, rememberSession: e.target.checked })}
            className="w-3.5 h-3.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--brand-primary)] accent-[var(--brand-primary)] cursor-pointer"
          />
          <span className="text-xs text-[var(--text-secondary)]">
            Remember me
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full relative overflow-hidden group inline-flex items-center justify-center space-x-2 py-3 rounded-lg bg-[var(--brand-primary)] text-black text-xs font-bold font-mono uppercase tracking-wider hover:bg-[var(--brand-ambient)] transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-lg shadow-[var(--brand-primary)]/10 hover:shadow-[var(--brand-primary)]/20"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-black" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}

