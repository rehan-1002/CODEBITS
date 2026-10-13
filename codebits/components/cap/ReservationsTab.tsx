"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Users,
  Award,
  FileText,
  Percent,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

interface ReservationItem {
  id: string;
  name: string;
  code: string;
  percentage: string;
  type: "Vertical" | "Horizontal" | "Supernumerary" | "Institutional";
  description: string;
  requiredDocuments: string[];
  scholarshipNote: string;
}

const RESERVATION_DATA: ReservationItem[] = [
  {
    id: "obc",
    name: "Other Backward Classes",
    code: "OBC / GOBC / LOBC",
    percentage: "19.0%",
    type: "Vertical",
    description: "Statutory reservation for OBC category candidates of Maharashtra state.",
    requiredDocuments: [
      "Caste Certificate",
      "Caste Validity Certificate",
      "Non-Creamy Layer (NCL) Certificate valid up to 31st March 2027",
    ],
    scholarshipNote: "50% Tuition Fee waiver via Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna.",
  },
  {
    id: "sc",
    name: "Scheduled Castes",
    code: "SC / GSC / LSC",
    percentage: "13.0%",
    type: "Vertical",
    description: "Statutory reservation for SC candidates originating from Maharashtra.",
    requiredDocuments: [
      "Caste Certificate issued by Maharashtra competent authority",
      "Caste Validity Certificate issued by Divisional Scrutiny Committee",
    ],
    scholarshipNote: "100% Tuition & Development fee waiver under Government of India Post-Matric Scholarship.",
  },
  {
    id: "st",
    name: "Scheduled Tribes",
    code: "ST / GST / LST",
    percentage: "7.0%",
    type: "Vertical",
    description: "Statutory reservation for ST candidates originating from Maharashtra.",
    requiredDocuments: [
      "Tribe Certificate issued by Competent Authority",
      "Tribe Validity Certificate issued by Scrutiny Committee",
    ],
    scholarshipNote: "100% Tuition & Development fee waiver under Tribal Development Department Scheme.",
  },
  {
    id: "sebc",
    name: "Socially and Educationally Backward Classes",
    code: "SEBC / GSEBC / LSEBC",
    percentage: "10.0%",
    type: "Vertical",
    description: "Statutory reservation under Maharashtra SEBC Act 2024.",
    requiredDocuments: [
      "SEBC Caste Certificate",
      "Caste Validity Certificate",
      "Non-Creamy Layer (NCL) Certificate valid up to 31st March 2027",
    ],
    scholarshipNote: "50% Tuition Fee concession equivalent to EBC / OBC norms.",
  },
  {
    id: "ews",
    name: "Economically Weaker Sections",
    code: "EWS / GEWS",
    percentage: "10.0%",
    type: "Supernumerary",
    description: "10% over-and-above intake for candidates not covered under SC/ST/OBC/VJNT whose family income is below 8 LPA.",
    requiredDocuments: [
      "EWS Eligibility Certificate in prescribed Maharashtra Proforma V",
    ],
    scholarshipNote: "50% Tuition Fee waiver under Dr. Punjabrao Deshmukh Vasatigruh Nirvah Bhatta / EBC Yojna.",
  },
  {
    id: "tfws",
    name: "Tuition Fee Waiver Scheme",
    code: "TFWS",
    percentage: "5.0%",
    type: "Supernumerary",
    description: "AICTE approved 5% supernumerary seats in all colleges. 100% tuition fee is waived for entire 4-year degree.",
    requiredDocuments: [
      "Family Income Certificate issued by Tahsildar / Sub-Divisional Officer (annual income < 8 LPA)",
    ],
    scholarshipNote: "100% Tuition Fee waived automatically at time of admission. Student pays only Development Fee.",
  },
  {
    id: "vjnt",
    name: "Vimukta Jati & Nomadic Tribes (VJ / NT-A, NT-B, NT-C, NT-D)",
    code: "VJ: 3% | NT-B: 2.5% | NT-C: 3.5% | NT-D: 2%",
    percentage: "11.0% Combined",
    type: "Vertical",
    description: "Includes VJ/DT (3%), NT-1/B (2.5%), NT-2/C (3.5%), and NT-3/D (2%).",
    requiredDocuments: [
      "Caste Certificate",
      "Caste Validity Certificate",
      "Non-Creamy Layer (NCL) Certificate valid up to 31st March 2027",
    ],
    scholarshipNote: "100% Tuition Fee reimbursement via VJNT Freeship / Post-Matric Scholarship.",
  },
  {
    id: "def",
    name: "Defence Personnel Wards",
    code: "DEF-1 / DEF-2 / DEF-3",
    percentage: "5.0%",
    type: "Horizontal",
    description: "5% seats reserved within sanctioned intake for children of ex-service personnel, active defence personnel, and officers transferred to Maharashtra.",
    requiredDocuments: [
      "Defence Proforma C / D / E Certificate from Zilla Sainik Welfare Board",
      "Parent's service / discharge book",
    ],
    scholarshipNote: "Standard scholarship based on primary caste category.",
  },
  {
    id: "pwd",
    name: "Persons with Disabilities",
    code: "PWD",
    percentage: "5.0%",
    type: "Horizontal",
    description: "5% horizontal seats reserved for candidates with benchmark disability (minimum 40% disability certified).",
    requiredDocuments: [
      "Disability Certificate issued by Civil Surgeon / District Medical Board / UDID Card",
    ],
    scholarshipNote: "Special state government stipends and concessions apply.",
  },
  {
    id: "orphan",
    name: "Orphan Quota",
    code: "ORPHAN (A / B)",
    percentage: "1.0%",
    type: "Horizontal",
    description: "1% horizontal reservation for orphan candidates of Maharashtra State.",
    requiredDocuments: [
      "Orphan Certificate issued by Women and Child Development Department",
    ],
    scholarshipNote: "100% full fee waiver and educational support.",
  },
  {
    id: "minority",
    name: "Minority Quota",
    code: "MI",
    percentage: "51.0%",
    type: "Institutional",
    description: "51% of seats in Linguistic (Hindi, Sindhi, Gujarati, South Indian) or Religious (Muslim, Christian, Jain) minority institutions are reserved for candidates of that community.",
    requiredDocuments: [
      "School Leaving Certificate indicating mother tongue / religion, or Affidavit",
    ],
    scholarshipNote: "State and Central Government Minority Scholarships (Post-Matric Scholarship Scheme).",
  },
];

export function ReservationsTab() {
  const [selectedCategory, setSelectedCategory] = useState<string>("obc");

  const activeItem = RESERVATION_DATA.find((r) => r.id === selectedCategory) || RESERVATION_DATA[0];

  return (
    <div className="w-full flex flex-col gap-8">
      {/* 30% Ladies Reservation Spotlight Card */}
      <div className="w-full rounded-xl border border-[var(--brand-primary)]/40 bg-[var(--surface-base)] p-5 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)]" />
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--brand-primary)] font-bold">
            Statutory Horizontal Quota
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
          30% Female Horizontal Reservation (Ladies Quota)
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed font-mono">
          Governed by Government Resolution No. GEC-1000/(123/2000)/Tech.Edu.-1 dated 17th April 2000. In all engineering colleges across Maharashtra, 30% of seats in each category (Open, OBC, SC, ST, etc.) are horizontally earmarked for female candidates.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5 p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs font-mono">
          <div>
            <span className="text-[var(--text-muted)] block uppercase text-[10px]">Dual Evaluation Rule</span>
            <span className="text-[var(--brand-primary)] font-semibold mt-0.5 block">
              Checked for both LOPEN &amp; GOPEN
            </span>
            <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
              Female students are never restricted to ladies quota alone.
            </span>
          </div>

          <div>
            <span className="text-[var(--text-muted)] block uppercase text-[10px]">Cutoff Delta</span>
            <span className="text-[var(--text-primary)] font-semibold mt-0.5 block">
              0.50% to 2.50% Advantage
            </span>
            <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
              Ladies cutoffs are almost universally lower than gents.
            </span>
          </div>

          <div>
            <span className="text-[var(--text-muted)] block uppercase text-[10px]">Document Mandate</span>
            <span className="text-[var(--text-primary)] font-semibold mt-0.5 block">
              Maharashtra Domicile Required
            </span>
            <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
              Non-Creamy Layer needed for reserved ladies categories.
            </span>
          </div>
        </div>
      </div>

      {/* Categories Interactive Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Selector Column */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            Reservation Categories ({RESERVATION_DATA.length})
          </span>
          {RESERVATION_DATA.map((item) => {
            const isSel = selectedCategory === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedCategory(item.id)}
                className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                  isSel
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--text-primary)]"
                    : "border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                }`}
              >
                <div>
                  <span className="text-sm font-bold block">{item.name}</span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    {item.code}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[var(--brand-primary)] block">
                    {item.percentage}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                    {item.type}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Detail Card */}
        <div className="lg:col-span-7 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <span className="font-mono text-xs text-[var(--brand-primary)] uppercase tracking-wider font-bold">
                  {activeItem.type} Reservation
                </span>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mt-1">
                  {activeItem.name}
                </h3>
              </div>
              <span className="text-2xl font-black font-mono text-[var(--brand-primary)]">
                {activeItem.percentage}
              </span>
            </div>

            <p className="text-xs font-mono text-[var(--text-secondary)] mt-4 leading-relaxed">
              {activeItem.description}
            </p>

            {/* Document Prerequisites */}
            <div className="mt-6">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-primary)] font-bold block mb-2">
                Mandatory Documentation Checklist
              </span>
              <div className="space-y-2">
                {activeItem.requiredDocuments.map((doc, dIdx) => (
                  <div
                    key={dIdx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-xs font-mono"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)]">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Concession / Financial Benefits */}
            <div className="mt-6 p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--brand-primary)] font-bold block mb-1">
                Fee Concession &amp; Scholarship Policy
              </span>
              <p className="text-xs font-mono text-[var(--text-secondary)] leading-relaxed">
                {activeItem.scholarshipNote}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]">
            Verified under State Common Entrance Test Cell Maharashtra Engineering CAP Rules 2026-27.
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReservationsTab;
