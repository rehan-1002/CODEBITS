"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckSquare,
  Square,
  AlertTriangle,
  Printer,
  ShieldCheck,
  FolderCheck,
} from "lucide-react";

interface DocItem {
  id: string;
  title: string;
  desc: string;
  authority: string;
  tag: "Mandatory (All)" | "Reserved" | "Income/Special";
}

const COMMON_DOCS: DocItem[] = [
  {
    id: "ssc",
    title: "SSC (10th) Marksheet & Passing Certificate",
    desc: "Proof of date of birth and secondary school graduation.",
    authority: "Maharashtra State Board / CBSE / ICSE",
    tag: "Mandatory (All)",
  },
  {
    id: "hsc",
    title: "HSC (12th) Marksheet & Passing Certificate",
    desc: "Proof of qualifying examination and PCM group criteria.",
    authority: "HSC State Board / Respective Board",
    tag: "Mandatory (All)",
  },
  {
    id: "cet",
    title: "MHT-CET 2026 Scorecard / JEE Main Scorecard",
    desc: "Official printed percentile scorecard with candidate barcode.",
    authority: "State CET Cell Maharashtra / NTA",
    tag: "Mandatory (All)",
  },
  {
    id: "domicile",
    title: "Maharashtra Domicile Certificate / Birth Certificate",
    desc: "Proof of Maharashtra State Candidature (Type A). Mentioning birthplace in Maharashtra.",
    authority: "Executive Magistrate / Tahsildar",
    tag: "Mandatory (All)",
  },
  {
    id: "lc",
    title: "School Leaving / College Transfer Certificate (LC / TC)",
    desc: "Mandatory for proving Indian nationality and mother tongue / religion.",
    authority: "Junior College Principal / Headmaster",
    tag: "Mandatory (All)",
  },
  {
    id: "aadhaar",
    title: "Aadhaar Card (UIDAI)",
    desc: "Identity proof and verification of bank seeding for DBT scholarships.",
    authority: "Government of India (UIDAI)",
    tag: "Mandatory (All)",
  },
];

const CATEGORY_DOCS: DocItem[] = [
  {
    id: "caste_cert",
    title: "Caste Certificate",
    desc: "Certifying caste recognition under Maharashtra state list (SC / ST / OBC / VJNT / SEBC).",
    authority: "Sub-Divisional Officer (SDO) / Deputy Collector",
    tag: "Reserved",
  },
  {
    id: "validity_cert",
    title: "Caste / Tribe Validity Certificate",
    desc: "Mandatory statutory verification document. Admission is cancelled without validity.",
    authority: "Divisional Caste Scrutiny Committee",
    tag: "Reserved",
  },
  {
    id: "ncl_cert",
    title: "Non-Creamy Layer (NCL) Certificate",
    desc: "Must be valid up to 31st March 2027. Mandatory for OBC, SEBC, VJ, NT-1, NT-2, NT-3.",
    authority: "Sub-Divisional Officer / Tahsildar",
    tag: "Reserved",
  },
  {
    id: "ews_proforma",
    title: "EWS Eligibility Certificate (Proforma V)",
    desc: "Mandatory format for Maharashtra Economically Weaker Section admissions.",
    authority: "Competent Revenue Authority (SDO / Tahsildar)",
    tag: "Reserved",
  },
  {
    id: "income_cert",
    title: "Family Income Certificate (For TFWS / EBC / Scholarships)",
    desc: "Certifying family income below 8.00 Lakhs per annum for academic year 2025-26.",
    authority: "Tahsildar / Competent Revenue Officer",
    tag: "Income/Special",
  },
];

export function DocumentsTab() {
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalDocs = COMMON_DOCS.length + CATEGORY_DOCS.length;
  const checkedCount = Object.values(checkedDocs).filter(Boolean).length;

  return (
    <div className="w-full flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Advisory Header */}
      <div className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)]" />
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                Scrutiny Center Verification Protocol
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
              Documents Checklist for CAP 2026-27
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono text-[var(--brand-primary)] px-3 py-1.5 rounded-lg bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 font-bold">
              {checkedCount} of {totalDocs} Prepared
            </span>
          </div>
        </div>

        {/* Warning Box */}
        <div className="mt-5 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">Statutory Notice: </strong>
            Original copies of all verified documents must be physically produced at the time of e-Scrutiny or Physical Scrutiny Center verification. Always carry 1 set of originals and at least 4 sets of attested photocopies.
          </div>
        </div>
      </div>

      {/* Part 1: Mandatory for ALL Candidates */}
      <div className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FolderCheck className="w-4 h-4 text-[var(--brand-primary)]" />
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
            Part A — Mandatory for All Engineering Aspirants
          </h3>
        </div>

        <div className="space-y-3">
          {COMMON_DOCS.map((doc) => {
            const isChecked = checkedDocs[doc.id] || false;
            return (
              <div
                key={doc.id}
                onClick={() => toggleCheck(doc.id)}
                className={`p-4 rounded-lg border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                  isChecked
                    ? "border-[var(--brand-primary)]/50 bg-[var(--brand-primary)]/5"
                    : "border-[var(--border-subtle)] bg-[var(--bg-base)] hover:border-[var(--border-strong)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className="mt-0.5 text-[var(--brand-primary)]"
                    aria-label="Toggle document prepared status"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                  </button>
                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        isChecked ? "text-[var(--brand-primary)] line-through" : "text-[var(--text-primary)]"
                      }`}
                    >
                      {doc.title}
                    </h4>
                    <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                      {doc.desc}
                    </p>
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] mt-1.5 block">
                      Issuing Authority: {doc.authority}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-secondary)] shrink-0">
                  {doc.tag}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Part 2: Category & Quota Specific Requirements */}
      <div className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)]" />
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
            Part B — Category &amp; Scholarship Specific Documentation
          </h3>
        </div>

        <div className="space-y-3">
          {CATEGORY_DOCS.map((doc) => {
            const isChecked = checkedDocs[doc.id] || false;
            return (
              <div
                key={doc.id}
                onClick={() => toggleCheck(doc.id)}
                className={`p-4 rounded-lg border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                  isChecked
                    ? "border-[var(--brand-primary)]/50 bg-[var(--brand-primary)]/5"
                    : "border-[var(--border-subtle)] bg-[var(--bg-base)] hover:border-[var(--border-strong)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className="mt-0.5 text-[var(--brand-primary)]"
                    aria-label="Toggle document prepared status"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4 text-[var(--text-muted)]" />
                    )}
                  </button>
                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        isChecked ? "text-[var(--brand-primary)] line-through" : "text-[var(--text-primary)]"
                      }`}
                    >
                      {doc.title}
                    </h4>
                    <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                      {doc.desc}
                    </p>
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] mt-1.5 block">
                      Issuing Authority: {doc.authority}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--brand-primary)] shrink-0">
                  {doc.tag}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DocumentsTab;
