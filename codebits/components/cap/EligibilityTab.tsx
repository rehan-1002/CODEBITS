"use client";

import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calculator,
  FileCheck,
  ShieldAlert,
} from "lucide-react";

const ALTERNATIVE_SUBJECTS = [
  "Chemistry",
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Biology",
  "Biotechnology",
  "Electrical Maintenance",
  "Mechanical Maintenance",
  "Technical Vocational",
];

export function EligibilityTab() {
  const [category, setCategory] = useState<"OPEN" | "RESERVED">("OPEN");
  const [physics, setPhysics] = useState<string>("65");
  const [maths, setMaths] = useState<string>("70");
  const [altSubject, setAltSubject] = useState<string>("Chemistry");
  const [altMarks, setAltMarks] = useState<string>("60");

  const p = parseFloat(physics) || 0;
  const m = parseFloat(maths) || 0;
  const c = parseFloat(altMarks) || 0;

  const total = p + m + c;
  const percentage = Number(((total / 300) * 100).toFixed(2));

  const hasIndividualFail = p < 35 || m < 35 || c < 35;
  const requiredPercentage = category === "OPEN" ? 45.0 : 40.0;
  const requiredMarks = category === "OPEN" ? 135 : 120;
  const isEligible = !hasIndividualFail && total >= requiredMarks;

  return (
    <div className="w-full flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5 sm:p-7 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          PCM Eligibility Calculator
        </h2>

        {/* Category Threshold Switcher */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => setCategory("OPEN")}
            className={`flex-1 p-4 rounded-xl border text-left transition-all cursor-pointer ${
              category === "OPEN"
                ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold shadow-sm ring-1 ring-[var(--brand-primary)]/30"
                : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold">Open / General</span>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] border ${
                category === "OPEN"
                  ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-black font-black"
                  : "border-[var(--border-strong)]"
              }`}>
                {category === "OPEN" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)] mt-1 block">
              Min 45% (135 / 300 aggregate)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCategory("RESERVED")}
            className={`flex-1 p-4 rounded-xl border text-left transition-all cursor-pointer ${
              category === "RESERVED"
                ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] font-bold shadow-sm ring-1 ring-[var(--brand-primary)]/30"
                : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold">Reserved / Backward</span>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] border ${
                category === "RESERVED"
                  ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-black font-black"
                  : "border-[var(--border-strong)]"
              }`}>
                {category === "RESERVED" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </span>
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)] mt-1 block">
              Min 40% (120 / 300 aggregate)
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">OBC, SC, ST, EWS, SEBC, VJ/NT</span>
          </button>
        </div>

        {/* Subject Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Physics */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase">
              Physics (Compulsory)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={physics}
                onChange={(e) => setPhysics(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] font-mono text-base font-bold focus:outline-none focus:border-[var(--brand-primary)]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-muted)]">
                / 100
              </span>
            </div>
            {p < 35 && (
              <span className="text-[11px] font-mono text-rose-400">Below board pass mark (35)</span>
            )}
          </div>

          {/* Mathematics */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-medium text-[var(--text-secondary)] uppercase">
              Mathematics (Compulsory)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={maths}
                onChange={(e) => setMaths(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] font-mono text-base font-bold focus:outline-none focus:border-[var(--brand-primary)]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-muted)]">
                / 100
              </span>
            </div>
            {m < 35 && (
              <span className="text-[11px] font-mono text-rose-400">Below board pass mark (35)</span>
            )}
          </div>

          {/* Third Subject (Chemistry or Alternative) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
              <span className="uppercase">Third Subject</span>
            </div>
            <select
              value={altSubject}
              onChange={(e) => setAltSubject(e.target.value)}
              className="w-full px-2.5 py-1 text-xs rounded border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] mb-1"
            >
              {ALTERNATIVE_SUBJECTS.map((sub) => (
                <option key={sub} value={sub} className="bg-[var(--surface-base)]">
                  {sub}
                </option>
              ))}
            </select>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={altMarks}
                onChange={(e) => setAltMarks(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] font-mono text-base font-bold focus:outline-none focus:border-[var(--brand-primary)]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-muted)]">
                / 100
              </span>
            </div>
            {c < 35 && (
              <span className="text-[11px] font-mono text-rose-400">Below board pass mark (35)</span>
            )}
          </div>
        </div>

        {/* Calculated Verdict Banner */}
        <div
          className={`mt-6 p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isEligible
              ? "border-[var(--brand-primary)]/40 bg-[var(--brand-primary)]/10"
              : "border-rose-500/40 bg-rose-500/10"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              {isEligible ? (
                <CheckCircle2 className="w-5 h-5 text-[var(--brand-primary)]" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              )}
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] font-mono">
                {isEligible
                  ? "ELIGIBLE FOR MAHARASHTRA CAP 2026-27"
                  : "CURRENTLY BELOW STATUTORY ELIGIBILITY"}
              </h3>
            </div>
            <p className="text-xs font-mono text-[var(--text-secondary)] mt-1">
              {isEligible
                ? `Total: ${total} / 300 (${percentage}%) exceeds required ${requiredPercentage}% threshold for ${category}.`
                : hasIndividualFail
                ? "Candidate scored below passing standard (35 marks) in one of the core subjects."
                : `Total: ${total} / 300 (${percentage}%) is short of the required ${requiredMarks} marks (${requiredPercentage}%).`}
            </p>
          </div>

          <div className="text-right self-end sm:self-auto">
            <span className="text-xs font-mono text-[var(--text-muted)] block uppercase">Calculated Group</span>
            <span
              className={`text-2xl font-black font-mono ${
                isEligible ? "text-[var(--brand-primary)]" : "text-rose-400"
              }`}
            >
              {percentage}%
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)] block">
              {total} / 300 marks
            </span>
          </div>
        </div>
      </div>

      {/* Official Guidelines & Clarifications */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5 sm:p-6 text-xs font-mono text-[var(--text-secondary)] flex flex-col gap-3">
        <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[var(--brand-primary)]" />
          State CET Cell Information Brochure Norms
        </h4>
        <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-[var(--text-muted)]">
          <li>
            <strong className="text-[var(--text-primary)]">Compulsory Subjects:</strong> Candidate must have passed 10+2 / HSC with Physics and Mathematics as compulsory subjects.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Chemistry Replacement Rule:</strong> If a student has lower marks in Chemistry, marks of any one vocational / technical subject (Computer Science, Information Technology, Electronics, Biology, Biotechnology, etc.) can be substituted to calculate the aggregate.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Maharashtra Domicile Mandate:</strong> The relaxed 40% criteria for reserved categories is strictly applicable only to candidates belonging to Maharashtra State and possessing verified Caste / Tribe / EWS certificates.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Non-Zero Score in CET:</strong> Candidates must obtain a non-zero positive score in MHT-CET 2026 or JEE Main Paper-I.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default EligibilityTab;
