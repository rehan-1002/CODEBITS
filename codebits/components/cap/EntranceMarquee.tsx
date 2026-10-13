"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MhtCetLogo,
  JeeMainLogo,
  NeetLogo,
  JeeAdvancedLogo,
  BitsatLogo,
  ViteeeLogo,
  UgeeLogo,
  ComedkLogo,
  GateLogo,
  CatLogo,
  GreLogo,
  IesLogo,
  IsroLogo,
} from "./ExamLogos";

export interface ExamPortal {
  id: string;
  name: string;
  authority: string;
  badge: string;
  url: string;
  ctaText: string;
  Logo: React.ComponentType<{ className?: string }>;
}

const ALL_EXAMS: ExamPortal[] = [
  {
    id: "mht-cet",
    name: "MHT-CET 2026",
    authority: "State CET Cell Maharashtra",
    badge: "100% MH Quota",
    url: "https://cetcell.mahacet.org/",
    ctaText: "Official Portal",
    Logo: MhtCetLogo,
  },
  {
    id: "jee-main",
    name: "JEE MAIN 2026",
    authority: "National Testing Agency (NTA)",
    badge: "NIT / IIIT & AI Quota",
    url: "https://jeemain.nta.nic.in/",
    ctaText: "Registration",
    Logo: JeeMainLogo,
  },
  {
    id: "neet-ug",
    name: "NEET UG 2026",
    authority: "National Testing Agency (NTA)",
    badge: "Medical / AIIMS Quota",
    url: "https://exams.nta.ac.in/NEET/",
    ctaText: "NTA Portal",
    Logo: NeetLogo,
  },
  {
    id: "jee-adv",
    name: "JEE ADVANCED",
    authority: "IIT Joint Admission Board",
    badge: "Premier 23 IITs",
    url: "https://jeeadv.ac.in/",
    ctaText: "Official Site",
    Logo: JeeAdvancedLogo,
  },
  {
    id: "bitsat",
    name: "BITSAT 2026",
    authority: "BITS Pilani / Goa / Hyd",
    badge: "Deemed Premier",
    url: "https://www.bitsadmission.com/",
    ctaText: "Apply Online",
    Logo: BitsatLogo,
  },
  {
    id: "viteee",
    name: "VITEEE 2026",
    authority: "Vellore Institute of Technology",
    badge: "Private Tier-1",
    url: "https://vit.ac.in/",
    ctaText: "Admissions",
    Logo: ViteeeLogo,
  },
  {
    id: "ugee",
    name: "UGEE (IIIT-H)",
    authority: "IIIT Hyderabad Dual Degree",
    badge: "Research & CS",
    url: "https://ugadmissions.iiit.ac.in/",
    ctaText: "Portal",
    Logo: UgeeLogo,
  },
  {
    id: "comedk",
    name: "COMEDK UGET",
    authority: "Karnataka Engineering Consortium",
    badge: "RVCE / BMS / MSRIT",
    url: "https://www.comedk.org/",
    ctaText: "Official Site",
    Logo: ComedkLogo,
  },
  {
    id: "gate",
    name: "GATE 2026",
    authority: "IISc & Premier IITs",
    badge: "PSU Jobs & M.Tech",
    url: "https://gate2026.iitr.ac.in/",
    ctaText: "GOAPS Portal",
    Logo: GateLogo,
  },
  {
    id: "cat",
    name: "CAT (IIMs)",
    authority: "Indian Institutes of Management",
    badge: "Premier MBA",
    url: "https://iimcat.ac.in/",
    ctaText: "IIM Portal",
    Logo: CatLogo,
  },
  {
    id: "gre",
    name: "GRE / TOEFL",
    authority: "Educational Testing Service (ETS)",
    badge: "Global MS / PhD",
    url: "https://www.ets.org/gre.html",
    ctaText: "ETS Official",
    Logo: GreLogo,
  },
  {
    id: "ies",
    name: "IES & ESE (UPSC)",
    authority: "Union Public Service Commission",
    badge: "Govt. Engineering Cadre",
    url: "https://upsc.gov.in/",
    ctaText: "UPSC Portal",
    Logo: IesLogo,
  },
  {
    id: "isro",
    name: "ISRO / BARC",
    authority: "Dept of Space & Atomic Energy",
    badge: "Scientist / Engineer",
    url: "https://www.isro.gov.in/Careers.html",
    ctaText: "Careers Hub",
    Logo: IsroLogo,
  },
];

export function EntranceMarquee({ className = "" }: { className?: string }) {
  // Duplicate for seamless 50% shift loop
  const repeated = [...ALL_EXAMS, ...ALL_EXAMS];

  return (
    <div
      className={cn(
        "w-full py-6 sm:py-8 overflow-hidden border-y border-[var(--border-subtle)] bg-[var(--surface-base)]/50 backdrop-blur-md flex flex-col gap-3.5 my-6 sm:my-10",
        className
      )}
    >
      {/* Track Label */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
          <span className="uppercase tracking-widest font-bold text-[11px] sm:text-xs text-[var(--text-primary)]">
            Official Entrance &amp; Examination Portals (2026-27)
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] text-[var(--text-muted)]">
          Live External Application Channels · State &amp; National Authorities
        </span>
      </div>

      {/* GPU Hardware-Accelerated Marquee Container */}
      <div className="relative w-full overflow-hidden select-none py-2">
        <div className="flex w-max gap-5 sm:gap-7 animate-marquee-glide will-change-transform">
          {repeated.map((exam, idx) => {
            const Icon = exam.Logo;

            return (
              <a
                key={`${exam.id}-${idx}`}
                href={exam.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Visit official ${exam.name} portal: ${exam.url}`}
                className="group flex items-center gap-4 sm:gap-5 px-5 sm:px-6 py-4 sm:py-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:border-[var(--brand-primary)] hover:bg-[var(--surface-elevated)] transition-all duration-200 shrink-0 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                {/* Prominent High-Contrast Logo Badge */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-[var(--border-subtle)] flex items-center justify-center p-2.5 shrink-0 group-hover:border-[var(--brand-primary)] group-hover:scale-105 transition-all shadow-md">
                  <Icon className="w-10 h-10 sm:w-12 sm:h-12 max-h-full max-w-full shrink-0 object-contain" />
                </div>

                {/* Exam Name & Authority */}
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-base sm:text-lg font-black tracking-tight text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                      {exam.name}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-semibold">
                      {exam.badge}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] mt-1 max-w-[220px] sm:max-w-[260px] truncate">
                    {exam.authority}
                  </span>
                </div>

                {/* Action Button */}
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 sm:px-3.5 py-2 rounded-xl border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 group-hover:bg-[var(--brand-primary)] group-hover:text-black transition-all ml-2 shrink-0 shadow-sm">
                  <span>{exam.ctaText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EntranceMarquee;
