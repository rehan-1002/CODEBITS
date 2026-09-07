import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Database, Layers, Search, Cpu } from "lucide-react";
import { Skiper19Scroll } from "@/components/sections/Skiper19Scroll";
import { TextAnimate } from "@/components/sections/TextAnimate";
import { ScrollFloatTitle } from "@/components/sections/ScrollFloatTitle";

export default function LandingPage() {
  const branches = [
    { code: "COMPS", name: "Computer Engineering" },
    { code: "IT", name: "Information Technology" },
    { code: "AI-DS", name: "Artificial Intelligence & Data Science" },
    { code: "EXTC", name: "Electronics & Telecommunication" },
    { code: "MECH", name: "Mechanical Engineering" },
    { code: "CIVIL", name: "Civil Engineering" },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="space-y-8 max-w-4xl">
          {/* Institutional Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-base)] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
            <span className="text-[var(--brand-primary)] font-semibold">CODEBITS</span>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text-secondary)]">MUMBAI UNIVERSITY REV-2019 'C' SCHEME</span>
          </div>

          {/* Primary Mission Statement */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.08]">
              Let us build the bridge between your career and dream.
            </h1>
            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed font-sans">
              Centralized, controlled academic repository providing authenticated access to Mumbai University question papers, faculty-vetted lecture notes, and verified examination solutions.
            </p>
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Link
              href="/vault"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-md bg-[var(--brand-primary)] text-black text-sm font-semibold hover:bg-[var(--brand-dark)] transition-colors cursor-pointer"
            >
              <span>ACCESS ACADEMIC VAULT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/upload"
              className="inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-base)] text-sm font-mono text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-colors cursor-pointer"
            >
              <span>CONTRIBUTE RESOURCE</span>
            </Link>
          </div>

          {/* Supported Branches Quick Index */}
          <div className="pt-8 border-t border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
              <span>SUPPORTED ACADEMIC DISCIPLINES</span>
              <span>SEMESTERS 1–8</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {branches.map((b) => (
                <Link
                  key={b.code}
                  href={`/vault?branch=${b.code}`}
                  className="px-3 py-1.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:border-[var(--brand-primary)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <span className="text-[var(--brand-primary)] font-bold mr-1.5">
                    {b.code}
                  </span>
                  <span className="hidden sm:inline text-[var(--text-muted)]">
                    {b.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interstitial Statement */}
      <section className="py-16 md:py-24 border-y border-[var(--border-subtle)] bg-[var(--surface-base)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="font-mono text-xs text-[var(--brand-primary)] uppercase tracking-wider font-semibold">
            CENTRALIZED CURATION
          </span>
          <TextAnimate
            text="scattered resources? we got you"
            className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)] justify-center"
            highlightWords={["got", "you"]}
          />
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto font-sans leading-relaxed">
            No more hunting through expired links or conflicting syllabi. CodeBits indexes resources strictly against Mumbai University course curriculum.
          </p>
        </div>
      </section>

      {/* 3. The Kinetic SVG Narrative Path */}
      <Skiper19Scroll />

      {/* 4. Technical Architectural Columns */}
      <section className="py-20 md:py-28 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-2">
            <span className="font-mono text-xs text-[var(--brand-primary)] uppercase tracking-wider font-semibold">
              INSTITUTIONAL INTEGRITY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Engineered for Academic Rigor
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] space-y-3">
              <div className="w-8 h-8 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--brand-primary)]">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Syllabus Verification
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Every question paper and note is indexed strictly under the active Rev-2019 'C' Scheme, eliminating confusion between outdated university curricula.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] space-y-3">
              <div className="w-8 h-8 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--brand-primary)]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Protected Canvas Delivery
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Documents are deconstructed onto HTML5 canvas with forensic user watermarking and single-device session locking to protect academic intellectual property.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] space-y-3">
              <div className="w-8 h-8 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--brand-primary)]">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                cbAI Intelligent Discovery
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Natural-language command palette parses requests into structured academic database queries with zero hallucination fallback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Climax Title Reveal */}
      <ScrollFloatTitle />
    </div>
  );
}
