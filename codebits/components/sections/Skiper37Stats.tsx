"use client";

import React, { useState } from "react";
import NumberFlow from "@number-flow/react";
import { Award, Building, TrendingUp, Users } from "lucide-react";

interface MetricItem {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  note: string;
  icon: React.ElementType;
}

const VERIFIED_METRICS: MetricItem[] = [
  {
    id: "candidates",
    label: "Candidates Mentored & Placed",
    value: 250,
    suffix: "+",
    note: "Engineering scholars placed across top engineering domains",
    icon: Users,
  },
  {
    id: "partners",
    label: "Corporate & Hiring Partners",
    value: 15,
    suffix: "+",
    note: "Recruiting and internship networks affiliated with CodeBits mentors",
    icon: Building,
  },
  {
    id: "package",
    label: "Average Package (LPA)",
    value: 8,
    suffix: " LPA",
    note: "Consistent track record across core technical placements",
    icon: TrendingUp,
  },
  {
    id: "semesters",
    label: "Academic Coverage",
    value: 8,
    prefix: "Sem 1–",
    suffix: "",
    note: "Full Rev-2019 'C' Scheme engineering curriculum alignment",
    icon: Award,
  },
];

export function Skiper37Stats() {
  return (
    <section className="py-16 md:py-24 border-y border-[var(--border-subtle)] bg-[var(--surface-base)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-2">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)]" />
            <span className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">
              VERIFIED INSTITUTIONAL RECORD
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Measurable Academic Mentorship
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl font-sans">
            Curated guidance by Prof. Rohit Falake (M.R.F) and Mumbai University educators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VERIFIED_METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.id}
                className="p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] space-y-4 hover:border-[var(--brand-primary)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">
                    {metric.label}
                  </span>
                  <div className="p-1.5 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--brand-primary)]">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="font-mono text-3xl sm:text-4xl font-black text-[var(--text-primary)] flex items-baseline">
                  {metric.prefix && <span>{metric.prefix}</span>}
                  <NumberFlow
                    value={metric.value}
                    format={{ notation: "standard" }}
                    className="font-mono"
                  />
                  {metric.suffix && (
                    <span className="text-[var(--brand-primary)] text-2xl ml-0.5">
                      {metric.suffix}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-2 border-t border-[var(--border-subtle)]">
                  {metric.note}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
