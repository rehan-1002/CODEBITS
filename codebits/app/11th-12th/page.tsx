"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  Building2,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Compass,
  GraduationCap,
} from "lucide-react";
import EntranceMarquee from "@/components/cap/EntranceMarquee";
import PredictorTab from "@/components/cap/PredictorTab";
import CollegesTab from "@/components/cap/CollegesTab";
import EligibilityTab from "@/components/cap/EligibilityTab";
import ReservationsTab from "@/components/cap/ReservationsTab";
import DocumentsTab from "@/components/cap/DocumentsTab";

type TabId = "predictor" | "colleges" | "eligibility" | "reservations" | "documents";

interface TabMeta {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const TABS: TabMeta[] = [
  {
    id: "predictor",
    label: "College Predictor",
    icon: SlidersHorizontal,
    tag: "CAP ROUNDS I - IV",
  },
  {
    id: "colleges",
    label: "372 Colleges Directory",
    icon: Building2,
    tag: "FRA FEES & CUTOFFS",
  },
  {
    id: "eligibility",
    label: "PCM Eligibility",
    icon: CheckCircle2,
    tag: "STATUTORY CHECK",
  },
  {
    id: "reservations",
    label: "Reservations Guide",
    icon: ShieldCheck,
    tag: "32 CATEGORIES & 30% LADIES",
  },
  {
    id: "documents",
    label: "Documents Checklist",
    icon: FileText,
    tag: "FC SCRUTINY",
  },
];

function JuniorCollegeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabQuery = (searchParams.get("tab") as TabId) || "predictor";
  const [activeTab, setActiveTab] = useState<TabId>(tabQuery);

  useEffect(() => {
    if (searchParams.get("tab") && searchParams.get("tab") !== activeTab) {
      setActiveTab(searchParams.get("tab") as TabId);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    router.push(`/11th-12th?tab=${tabId}`, { scroll: false });
  };

  return (
    <div className="w-full min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col">
      {/* Top Hero Section */}
      <section className="pt-8 sm:pt-12 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--text-primary)] uppercase">
          11th &amp; 12th
        </h1>
      </section>

      {/* Entrance Exams Parquee Ticker */}
      <EntranceMarquee />

      {/* Core Application Suite */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-20 flex-1">
        {/* Tab Navigation Dock */}
        <div className="w-full overflow-x-auto pb-2 mb-8 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 min-w-max">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-mono font-semibold transition-all border ${
                    isSelected
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold shadow-sm"
                      : "border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab View Panels */}
        <div className="w-full">
          {activeTab === "predictor" && <PredictorTab />}
          {activeTab === "colleges" && <CollegesTab />}
          {activeTab === "eligibility" && <EligibilityTab />}
          {activeTab === "reservations" && <ReservationsTab />}
          {activeTab === "documents" && <DocumentsTab />}
        </div>
      </section>
    </div>
  );
}

export default function JuniorCollegePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center bg-[var(--bg-base)] text-xs font-mono text-[var(--text-muted)]">
          INITIALIZING REPOSITORY...
        </div>
      }
    >
      <JuniorCollegeContent />
    </Suspense>
  );
}
