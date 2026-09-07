"use client";

import React, { useState } from "react";
import { Lock, User, AlertCircle, ArrowRight } from "lucide-react";
import { LoginFormData } from "@/types/auth";

interface LoginFormProps {
  onSuccess?: () => void;
  concurrentReason?: boolean;
}

export function LoginForm({ onSuccess, concurrentReason }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const ident = formData.identifier.trim();
    if (!ident) {
      setError("Please enter your registered email address or 10-digit Indian phone number.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your account password.");
      return;
    }

    // Determine if input is phone or email
    const isNumeric = /^\d+$/.test(ident);
    if (isNumeric) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(ident)) {
        setError("Invalid mobile format. Please provide a valid 10-digit Indian number starting with 6-9.");
        return;
      }
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(ident)) {
        setError("Please provide a valid email address format.");
        return;
      }
    }

    setLoading(true);

    // Backend-ready boundary:
    // In this frontend phase, real Supabase auth call is prepared
    setTimeout(() => {
      setLoading(false);
      setError("Backend connection required: Supabase authentication service integration is scheduled for backend phase.");
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {concurrentReason && (
        <div className="p-3.5 rounded border border-amber-800/40 bg-amber-950/20 text-amber-300 text-xs flex items-start space-x-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block font-mono">CONCURRENT SESSION TERMINATED</span>
            <span>You were logged out because this account was authenticated from another device.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded border border-red-800/40 bg-red-950/20 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Identifier: Email OR Phone */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-[var(--text-secondary)]">
          EMAIL ADDRESS OR 10-DIGIT MOBILE NUMBER
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            placeholder="e.g. 9876543210 or student@mu.ac.in"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
          />
        </div>
        <p className="text-[10px] font-mono text-[var(--text-muted)]">
          DUAL-IDENTIFIER: ENTER REGISTERED EMAIL OR INDIAN MOBILE NUMBER
        </p>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-[var(--text-secondary)]">
          PASSWORD
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter your account password"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-md bg-[var(--brand-primary)] text-black text-xs font-bold hover:bg-[var(--brand-dark)] transition-colors disabled:opacity-50 cursor-pointer"
      >
        <span>{loading ? "VERIFYING CREDENTIALS..." : "ENTER PORTAL"}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="pt-2 text-center">
        <span className="text-[11px] font-mono text-[var(--text-muted)]">
          SINGLE ACTIVE DEVICE ENFORCEMENT ENABLED
        </span>
      </div>
    </form>
  );
}
