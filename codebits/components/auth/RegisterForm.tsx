"use client";

import React, { useState } from "react";
import { Lock, User, Mail, Phone, AlertCircle, ArrowRight } from "lucide-react";
import { RegisterFormData } from "@/types/auth";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password) {
      setError("All registration fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid academic or personal email address.");
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError("Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    // Backend-ready integration boundary
    setTimeout(() => {
      setLoading(false);
      setError("Backend connection required: User registration via Supabase Auth is scheduled for the backend integration phase.");
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded border border-red-800/40 bg-red-950/20 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-[var(--text-secondary)]">
          STUDENT FULL NAME *
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. Atharva Joshi"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-[var(--text-secondary)]">
          EMAIL ADDRESS *
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. atharva@student.mu.ac.in"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
          />
        </div>
      </div>

      {/* Mobile Phone */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-[var(--text-secondary)]">
          INDIAN MOBILE NUMBER (+91) *
        </label>
        <div className="relative">
          <Phone className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="10-digit number (e.g. 9876543210)"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
          />
        </div>
      </div>

      {/* Password & Confirm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-mono text-[var(--text-secondary)]">
            PASSWORD *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min 6 chars"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono text-[var(--text-secondary)]">
            CONFIRM PASSWORD *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center space-x-2 py-3 rounded-md bg-[var(--brand-primary)] text-black text-xs font-bold hover:bg-[var(--brand-dark)] transition-colors disabled:opacity-50 cursor-pointer"
      >
        <span>{loading ? "CREATING PROFILE..." : "CREATE STUDENT ACCOUNT"}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="pt-2 text-center text-[10px] font-mono text-[var(--text-muted)]">
        NO OTP REQUIRED • INSTANT PROFILE INITIALIZATION
      </div>
    </form>
  );
}
