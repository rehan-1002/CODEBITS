import React from "react";
import { Metadata } from "next";
import { BookOpen, MapPin, CheckCircle, Shield } from "lucide-react";
import { Skiper37Stats } from "@/components/sections/Skiper37Stats";
import { FacultyAccordion } from "@/components/sections/FacultyAccordion";
import { InquiryForm } from "@/components/inquiries/InquiryForm";

export const metadata: Metadata = {
  title: "About CodeBits | Institutional Pedagogy & Faculty Mentorship",
  description:
    "Learn about CodeBits, an institutional academic repository and mentorship platform founded by Prof. Rohit Falake (M.R.F) for Mumbai University engineering scholars.",
};

export default function AboutPage() {
  const centers = [
    {
      name: "Dadar Academic & Research Center",
      location: "Central Mumbai Hub",
      focus: "Applied Mathematics, Computational Logic & Examination Strategy",
    },
    {
      name: "Thane Engineering Training Center",
      location: "Thane West",
      focus: "Computer & IT Systems, Network Engineering & Algorithms",
    },
    {
      name: "Navi Mumbai Tech Laboratory",
      location: "Vashi Hub",
      focus: "Digital Electronics, VLSI Architectures & Embedded Computing",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* 1. Page Header */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-[var(--surface-base)] border border-[var(--border-subtle)] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)]" />
            <span className="text-[var(--brand-primary)] font-semibold">ABOUT CODEBITS</span>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text-secondary)]">FOUNDATIONAL PEDAGOGY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            Institutional Mentorship Built for Mumbai University Engineering.
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-sans">
            CodeBits bridges the gap between raw university syllabus requirements and real engineering mastery. Curated under the pedagogical guidance of Prof. Rohit Falake (M.R.F), the platform unifies academic resource preservation with expert classroom instruction.
          </p>
        </div>
      </section>

      {/* 2. Institutional Metrics */}
      <Skiper37Stats />

      {/* 3. The Faculty Accordion */}
      <FacultyAccordion />

      {/* 4. Pedagogical Principles */}
      <section className="py-16 md:py-24 border-t border-[var(--border-subtle)] bg-[var(--surface-base)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-2">
            <span className="font-mono text-xs text-[var(--brand-primary)] uppercase tracking-wider font-semibold">
              CORE PHILOSOPHY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              The CodeBits Academic Standard
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] space-y-3">
              <div className="w-8 h-8 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--brand-primary)]">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Rev-2019 'C' Scheme Precision
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                All curriculum materials, paper analyses, and solutions are tailored strictly to the prevailing credit grading scheme mandated by Mumbai University.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] space-y-3">
              <div className="w-8 h-8 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--brand-primary)]">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Verified Provenance
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Every academic resource undergoes rigorous faculty verification before publishing, ensuring step-by-step mathematical proofs and valid answer keys.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] space-y-3">
              <div className="w-8 h-8 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--brand-primary)]">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Classroom-to-Vault Continuity
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Students attending classroom coaching under Prof. MRF receive digital access to high-resolution notes stamped with personal dynamic watermarks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Physical Training Centers */}
      <section className="py-16 md:py-24 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-2">
            <span className="font-mono text-xs text-[var(--brand-primary)] uppercase tracking-wider font-semibold">
              OFFLINE FOOTPRINT
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Academic Training Centers
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Physical instructional classrooms and examination prep centers across the Mumbai Metropolitan Region.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {centers.map((center) => (
              <div
                key={center.name}
                className="p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] space-y-3"
              >
                <div className="flex items-center space-x-2 text-[var(--brand-primary)]">
                  <MapPin className="w-4 h-4" />
                  <span className="font-mono text-xs uppercase">{center.location}</span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {center.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-2 border-t border-[var(--border-subtle)]">
                  {center.focus}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Institutional Inquiry Capture */}
      <section className="py-16 md:py-24 border-t border-[var(--border-subtle)] bg-[var(--surface-base)] transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <InquiryForm />
        </div>
      </section>
    </div>
  );
}
