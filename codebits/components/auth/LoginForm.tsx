"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff, Loader2, BookOpen, UploadCloud } from "lucide-react";
import { LoginFormData } from "@/types/auth";
import { loginWithApi } from "@/lib/auth";

interface LoginFormProps {
  onSuccess?: () => void;
  concurrentReason?: boolean;
}

export function LoginForm({ onSuccess, concurrentReason }: LoginFormProps) {
  const searchParams = useSearchParams();

  // Multi-source destination resolver (searchParams -> window.location.search -> cookie)
  const resolveTargetUrl = (): string => {
    let raw = searchParams?.get("redirect");

    if (!raw && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      raw = urlParams.get("redirect");
    }

    if (!raw && typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)cb_intended_url=([^;]*)/);
      if (match && match[1]) {
        raw = match[1];
      }
    }

    if (!raw) return "/vault";

    try {
      let decoded = decodeURIComponent(raw);
      if (decoded.startsWith("%2F") || decoded.startsWith("%2f")) {
        decoded = decodeURIComponent(decoded);
      }
      if (decoded.startsWith("/") && !decoded.startsWith("//") && !decoded.startsWith("/login")) {
        return decoded;
      }
    } catch {
      return "/vault";
    }
    return "/vault";
  };

  const redirectTarget = resolveTargetUrl();
  const isFromViewer = redirectTarget.startsWith("/viewer");
  const isFromUpload = redirectTarget.startsWith("/upload");

  const [formData, setFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
    rememberSession: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const res = await loginWithApi(formData.identifier, formData.password, formData.rememberSession);
    if (!res.success) {
      setLoading(false);
      setError(res.error || "Authentication failed.");
      return;
    }

    const finalTarget = resolveTargetUrl();
    if (typeof document !== "undefined") {
      document.cookie = "cb_intended_url=; path=/; max-age=0;";
    }

    const isAdmin = res.user?.role === "admin";
    setSuccessMessage(
      isAdmin
        ? "Administrator session authorized. Redirecting..."
        : isFromViewer
        ? "Access verified! Loading your study document..."
        : "Student session verified. Redirecting..."
    );

    // Keep loading true and trigger a full browser navigation
    // This purges the Next.js client-side route cache, ensures HttpOnly cookie is attached,
    // and eliminates loops where cached 307 redirects bounce back to /login.
    setTimeout(() => {
      if (onSuccess) {
        setLoading(false);
        onSuccess();
      } else {
        window.location.replace(finalTarget);
      }
    }, 450);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isFromViewer && (
        <div className="p-3 rounded-xl border border-[var(--brand-primary)]/40 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs flex items-center space-x-2 font-mono">
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>Student login required to view and study vault documents.</span>
        </div>
      )}
      {isFromUpload && (
        <div className="p-3 rounded-xl border border-[var(--brand-primary)]/40 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs flex items-center space-x-2 font-mono">
          <UploadCloud className="w-4 h-4 shrink-0" />
          <span>Student sign-in required to contribute study materials to the vault.</span>
        </div>
      )}
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
            disabled={loading}
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            placeholder="CODEBITS, 9920336099, or email"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/80 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/50 transition-all font-sans disabled:opacity-50"
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
            disabled={loading}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter your security password"
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/80 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/50 transition-all font-sans disabled:opacity-50"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none cursor-pointer p-1 transition-colors disabled:opacity-50"
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
            disabled={loading}
            checked={formData.rememberSession}
            onChange={(e) => setFormData({ ...formData, rememberSession: e.target.checked })}
            className="w-3.5 h-3.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--brand-primary)] accent-[var(--brand-primary)] cursor-pointer disabled:opacity-50"
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

