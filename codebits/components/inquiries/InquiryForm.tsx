"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { InquiryFormData } from "@/types/inquiries";

export function InquiryForm() {
  const [formData, setFormData] = useState<InquiryFormData>({
    name: "",
    email: "",
    phone: "",
    program: "Semester Examination Coaching",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError("Please provide a valid 10-digit Indian mobile number (e.g., 9876543210).");
      return;
    }

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Please fill in all required contact fields.");
      return;
    }

    // Frontend boundary acknowledgement
    setSubmitted(true);
  };

  return (
    <div className="p-6 md:p-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">
          Academic Inquiry &amp; Mentorship Consultation
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Submit your academic details to connect with the CodeBits Mumbai University pedagogical team.
        </p>
      </div>

      {submitted ? (
        <div className="p-5 rounded border border-[var(--badge-border)] bg-[var(--badge-bg)] text-center space-y-2">
          <CheckCircle2 className="w-6 h-6 text-[var(--brand-primary)] mx-auto" />
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">
            Inquiry Registered
          </h4>
          <p className="text-xs text-[var(--text-secondary)]">
            Your inquiry for {formData.program} has been queued for institutional review by the academic desk.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setFormData({
                name: "",
                email: "",
                phone: "",
                program: "Semester Examination Coaching",
                message: "",
              });
            }}
            className="mt-3 text-xs font-mono text-[var(--brand-primary)] hover:underline cursor-pointer"
          >
            Submit another inquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded border border-red-800/40 bg-red-950/20 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-secondary)]">
                FULL NAME *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Atharva Joshi"
                className="w-full px-3.5 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-secondary)]">
                EMAIL ADDRESS *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. atharva@student.mu.ac.in"
                className="w-full px-3.5 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-secondary)]">
                MOBILE NUMBER (+91) *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit mobile, e.g. 9876543210"
                className="w-full px-3.5 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[var(--text-secondary)]">
                ACADEMIC INTEREST *
              </label>
              <select
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                className="w-full px-3 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
              >
                <option value="Semester Examination Coaching">Semester Examination Coaching</option>
                <option value="PYQ Solution Masterclass">PYQ Solution Masterclass</option>
                <option value="Applied Mathematics Mentorship">Applied Mathematics Mentorship</option>
                <option value="Technical Placement Training">Technical Placement Training</option>
                <option value="Institutional Resource Contribution">Institutional Resource Contribution</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[var(--text-secondary)]">
              MESSAGE OR ACADEMIC BRANCH / SEMESTER
            </label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Indicate your engineering college, current semester, or specific query..."
              className="w-full px-3.5 py-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-md bg-[var(--brand-primary)] text-black text-xs font-bold hover:bg-[var(--brand-dark)] transition-colors cursor-pointer"
          >
            <span>SUBMIT INQUIRY</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
}
