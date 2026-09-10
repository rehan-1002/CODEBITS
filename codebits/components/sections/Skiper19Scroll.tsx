"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { FileQuestion, FolderGit2, ShieldCheck, Cpu, Database } from "lucide-react";

interface NarrativeStep {
  index: string;
  tag: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: NarrativeStep[] = [
  {
    index: "01",
    tag: "PROBLEM",
    title: "Fragmented Academic Ecosystem",
    description:
      "Engineering study materials circulate across temporary WhatsApp groups, broken Google Drives, and personal chats—obscuring syllabus schemes and creating duplicate, unverified versions.",
    icon: FileQuestion,
  },
  {
    index: "02",
    tag: "DISCOVERY",
    title: "Taxonomy by Branch & Semester",
    description:
      "Structured catalog categorization curated for Mumbai University engineering across all 8 semesters for Computer, IT, AI-DS, EXTC, Mechanical, and Civil branches.",
    icon: FolderGit2,
  },
  {
    index: "03",
    tag: "CONNECTION",
    title: "Faculty Mentorship & Provenance",
    description:
      "Founded and guided by Prof. Rohit Falake (M.R.F) alongside experienced Mumbai University faculty mentors. Every submission is attributed and peer-checked before archiving.",
    icon: ShieldCheck,
  },
  {
    index: "04",
    tag: "CODEBITS",
    title: "Protected Canvas Document Delivery",
    description:
      "No raw public PDF downloads or insecure iframes. Documents render through high-performance HTML5 canvas with forensic student watermarking and single-device session locking.",
    icon: Cpu,
  },
  {
    index: "05",
    tag: "RESOURCES",
    title: "Authoritative University Vault",
    description:
      "Instant access to authentic previous-year question papers (PYQs), faculty lecture notes, official scheme syllabi, and step-by-step verified examination solutions.",
    icon: Database,
  },
];

export function Skiper19Scroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    setIsReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"],
  });

  const pathProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001,
  });

  const lineHeight = useTransform(pathProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={containerRef}
      className="relative py-20 md:py-32 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
      aria-label="CodeBits Narrative"
    >
      {/* Section Header */}
      <div className="mb-16 md:mb-24 space-y-3">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)]" />
          <span className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">
            THE ACADEMIC PIPELINE
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          From Fragmented Folders to an Institutional Vault
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          How CodeBits solves the discoverability crisis in Mumbai University engineering education through structured archiving.
        </p>
      </div>

      {/* The Kinetic Vertical Path */}
      <div className="relative">
        {/* Static Background Guideline */}
        <div
          className="absolute left-6 md:left-8 top-4 bottom-4 w-px bg-[var(--border-subtle)]"
          aria-hidden="true"
        />

        {/* Active Animated Emerald Stroke */}
        {!isReducedMotion && (
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-6 md:left-8 top-4 w-px bg-[var(--brand-primary)] origin-top"
            aria-hidden="true"
          />
        )}

        {/* Narrative Steps */}
        <div className="space-y-12 md:space-y-16">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.index}
                className="relative flex items-start pl-16 md:pl-20 group"
              >
                {/* Milestone Node on Stroke */}
                <div className="absolute left-4 md:left-6 -translate-x-1/2 top-1.5 w-6 h-6 rounded-full border border-[var(--border-strong)] bg-[var(--surface-base)] flex items-center justify-center group-hover:border-[var(--brand-primary)] transition-colors">
                  <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)]" />
                </div>

                {/* Content Block */}
                <div className="flex-1 p-5 md:p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] group-hover:border-[var(--border-strong)] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold text-[var(--brand-primary)]">
                        {step.index}
                      </span>
                      <span className="text-[var(--border-strong)]">/</span>
                      <span className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                        {step.tag}
                      </span>
                    </div>
                    <div className="p-1.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--brand-primary)]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-[var(--text-primary)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
