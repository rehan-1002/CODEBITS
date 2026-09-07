"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GraduationCap, ExternalLink } from "lucide-react";

interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  domain: string;
  image: string;
  lead?: boolean;
}

const FACULTY_MEMBERS: FacultyMember[] = [
  {
    id: "rohit-falake",
    name: "Prof. Rohit Falake (M.R.F)",
    designation: "Founder & Lead Academic Mentor",
    domain: "Applied Mathematics, Systems Analysis & Pedagogical Architecture",
    image: "/FACULTY/Prof. Rohit Falake (M.R.F).webp",
    lead: true,
  },
  {
    id: "bharat-acharya",
    name: "Prof. Bharat Acharya",
    designation: "Senior Faculty & Computing Mentor",
    domain: "Discrete Structures, Microprocessors & Computational Logic",
    image: "/FACULTY/Prof. Bharat Acharya.webp",
  },
  {
    id: "om-baviskar",
    name: "Prof. Om Baviskar",
    designation: "Technical Lead Mentor",
    domain: "Network Architectures, Communication Systems & Cybersecurity",
    image: "/FACULTY/Prof. Om Baviskar.webp",
  },
  {
    id: "prashant-patil",
    name: "Prof. Prashant Patil",
    designation: "Faculty Mentor",
    domain: "Database Systems, Distributed Architectures & Data Science",
    image: "/FACULTY/Prof. Prashant Patil.webp",
  },
  {
    id: "sameer-velenkar",
    name: "Prof. Sameer Velenkar",
    designation: "Engineering Faculty",
    domain: "Digital Electronics, Circuit Theory & VLSI Architectures",
    image: "/FACULTY/Prof. Sameer Velenkar.webp",
  },
  {
    id: "sunil-jadhav",
    name: "Prof. Sunil Jadhav",
    designation: "Academic Mentor",
    domain: "Data Structures, Algorithms & Object Oriented Programming",
    image: "/FACULTY/Prof. Sunil Jadhav.webp",
  },
  {
    id: "sunil-nagare",
    name: "Prof. Sunil Nagare",
    designation: "Senior Faculty Mentor",
    domain: "Theoretical Computer Science, Automata & Compiler Design",
    image: "/FACULTY/Prof. Sunil Nagare.webp",
  },
  {
    id: "vineet-kutty",
    name: "Prof. Vineet Kutty",
    designation: "Engineering Mentor",
    domain: "Cloud Computing, Operating Systems & Embedded Technologies",
    image: "/FACULTY/Prof. Vineet Kutty.webp",
  },
];

export function FacultyAccordion() {
  const [activeId, setActiveId] = useState<string>("rohit-falake");

  return (
    <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mb-12 md:mb-16 space-y-3">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
          <GraduationCap className="w-4 h-4 text-[var(--brand-primary)]" />
          <span className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">
            ACADEMIC LEADERSHIP
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Faculty Directory &amp; Mentorship
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          The CodeBits curriculum and repository are curated under the pedagogical leadership of senior Mumbai University engineering educators.
        </p>
      </div>

      {/* Desktop / Tablet Horizontal Image Accordion */}
      <div className="hidden md:flex gap-3 h-[480px] w-full">
        {FACULTY_MEMBERS.map((faculty) => {
          const isExpanded = activeId === faculty.id;
          return (
            <div
              key={faculty.id}
              onClick={() => setActiveId(faculty.id)}
              onMouseEnter={() => setActiveId(faculty.id)}
              onFocus={() => setActiveId(faculty.id)}
              tabIndex={0}
              role="button"
              aria-expanded={isExpanded}
              aria-label={`View details for ${faculty.name}`}
              className={`relative h-full rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-base)] cursor-pointer transition-all duration-500 ease-out focus:outline-none focus:border-[var(--brand-primary)] ${
                isExpanded ? "flex-[4] border-[var(--brand-primary)]" : "flex-[1] hover:border-[var(--border-strong)]"
              }`}
            >
              {/* Background Portrait */}
              <div className="absolute inset-0">
                <Image
                  src={faculty.image}
                  alt={faculty.name}
                  fill
                  sizes="(max-width: 1200px) 50vw, 33vw"
                  className={`object-cover object-top transition-transform duration-700 ${
                    isExpanded ? "scale-105" : "grayscale opacity-60 scale-100"
                  }`}
                />
                {/* Dark overlay for contrast */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
              </div>

              {/* Bottom Content Area */}
              <div className="absolute inset-x-0 bottom-0 p-5 bg-[var(--surface-base)]/90 backdrop-blur-md border-t border-[var(--border-subtle)] transition-all">
                {isExpanded ? (
                  <div className="space-y-1.5 animate-fadeIn">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] text-[var(--brand-primary)] uppercase tracking-wider border border-[var(--badge-border)] bg-[var(--badge-bg)] px-2 py-0.5 rounded">
                        {faculty.lead ? "LEAD MENTOR" : "FACULTY"}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      {faculty.name}
                    </h3>
                    <p className="text-xs text-[var(--brand-primary)] font-mono">
                      {faculty.designation}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                      {faculty.domain}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="font-mono text-xs font-bold text-[var(--text-secondary)] whitespace-nowrap -rotate-90 origin-center translate-y-12">
                      {faculty.name.replace("Prof. ", "")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Stacked Grid Fallback */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {FACULTY_MEMBERS.map((faculty) => (
          <div
            key={faculty.id}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] overflow-hidden flex flex-col"
          >
            <div className="relative h-56 w-full bg-black/40">
              <Image
                src={faculty.image}
                alt={faculty.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-black/40" />
              {faculty.lead && (
                <div className="absolute top-3 left-3 font-mono text-[10px] text-[var(--brand-primary)] uppercase bg-[var(--surface-base)] border border-[var(--border-subtle)] px-2 py-0.5 rounded">
                  LEAD MENTOR
                </div>
              )}
            </div>

            <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {faculty.name}
                </h3>
                <p className="text-xs text-[var(--brand-primary)] font-mono">
                  {faculty.designation}
                </p>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1 border-t border-[var(--border-subtle)]">
                {faculty.domain}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
