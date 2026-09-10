"use client";

import React, { useState } from "react";
import { Lock, User, Mail, Phone, AlertCircle, ArrowRight, Eye, EyeOff, GraduationCap, CheckCircle2, Loader2 } from "lucide-react";
import { RegisterFormData } from "@/types/auth";

interface RegisterFormProps {
  onSuccess?: () => void;
}

const DEPARTMENTS = [
  { id: "COMPS", label: "COMPS", full: "Computer Engineering" },
  { id: "IT", label: "IT", full: "Information Technology" },
  { id: "AI-DS", label: "AI-DS", full: "Artificial Intelligence & Data Science" },
  { id: "EXTC", label: "EXTC", full: "Electronics & Telecommunication" },
  { id: "MECH", label: "MECH", full: "Mechanical Engineering" },
  { id: "CIVIL", label: "CIVIL", full: "Civil Engineering" },
];

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    department: "COMPS",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password) {
      setError("All registration fields marked with an asterisk are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid academic or personal email address.");
      return;
    }

    const cleanPhone = formData.phone.trim().replace(/^(\+91|91|0)/, "").replace(/\s+/g, "");
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please re-check both fields.");
      return;
    }

    setLoading(true);

    // Backend-ready integration boundary:
    setTimeout(() => {
      setLoading(false);
      setSuccess("Account profile validated! Ready for database synchronization. Switching to Sign In...");
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    }, 700);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg border border-red-800/40 bg-red-950/20 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="leading-tight">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg border border-emerald-800/40 bg-emerald-950/20 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="leading-tight">{success}</span>
        </div>
      )}

      {/* Student Full Name */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
          Full Name *
        </label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Enter your full name"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/80 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/50 transition-all font-sans"
          />
        </div>
      </div>

      {/* Department / Branch Selector */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
          Department *
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {DEPARTMENTS.map((dept) => {
            const isSelected = formData.department === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setFormData({ ...formData, department: dept.id })}
                className={`py-1.5 px-2 rounded-md border text-center transition-all cursor-pointer ${
                  isSelected
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-semibold shadow-sm shadow-[var(--brand-primary)]/10"
                    : "border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                }`}
                title={dept.full}
              >
                <div className="text-[11px] font-mono tracking-wider">{dept.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Email Address */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
          Email Address *
        </label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@example.com"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/80 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/50 transition-all font-sans"
          />
        </div>
      </div>

      {/* Mobile Phone */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
          Mobile Number (+91) *
        </label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors">
            <Phone className="w-4 h-4" />
          </div>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="10-digit number (e.g. 9876543210)"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/80 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/50 transition-all font-mono"
          />
        </div>
      </div>

      {/* Passwords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
            Password *
          </label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min 6 chars"
              className="w-full pl-8 pr-8 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/80 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/50 transition-all font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer p-0.5"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
            Confirm *
          </label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              className="w-full pl-8 pr-8 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)]/80 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/50 transition-all font-sans"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer p-0.5"
            >
              {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
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
            <span>Creating Account...</span>
          </>
        ) : (
          <>
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}

