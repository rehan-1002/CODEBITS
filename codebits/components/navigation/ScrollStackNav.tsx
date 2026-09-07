"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";

interface ScrollStackNavProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  number: string;
  title: string;
  description: string;
  href: string;
  badge: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    number: "01",
    title: "MU Academic Vault",
    description: "Curated question papers, faculty notes, solutions, and Rev-2019 syllabus repository.",
    href: "/vault",
    badge: "SEM 1–8",
  },
  {
    number: "02",
    title: "About & Centers",
    description: "Institutional mentorship by Prof. Rohit Falake (M.R.F), faculty directory, and training centers.",
    href: "/about",
    badge: "FACULTY",
  },
  {
    number: "03",
    title: "Community Upload",
    description: "Submit university question papers and academic notes for faculty peer moderation.",
    href: "/upload",
    badge: "MODERATED",
  },
  {
    number: "04",
    title: "Access Portal",
    description: "Dual-identifier authentication for protected canvas document study and active sessions.",
    href: "/login",
    badge: "AUTH",
  },
];

export function ScrollStackNav({ isOpen, onClose }: ScrollStackNavProps) {
  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-base)]/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Drawer"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-xs text-[var(--brand-primary)] uppercase tracking-wider font-semibold">
                SYSTEM NAVIGATION
              </span>
              <span className="text-[var(--border-strong)]">/</span>
              <span className="font-mono text-xs text-[var(--text-muted)]">
                SELECT DESTINATION
              </span>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)] cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* Stacked Panels */}
          <div className="flex-1 overflow-y-auto px-6 py-8 md:py-12 max-w-5xl w-full mx-auto flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {NAV_ITEMS.map((item, idx) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx, duration: 0.25 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="group block p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:border-[var(--brand-primary)] transition-all relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-semibold text-[var(--brand-primary)] bg-[var(--surface-elevated)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                          {item.number}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest border border-[var(--border-subtle)] px-2 py-0.5 rounded">
                          {item.badge}
                        </span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>

                    <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                      {item.description}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Bottom Meta Bar */}
            <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] font-mono">
              <div>REV-2019 'C' SCHEME ACADEMIC REPOSITORY</div>
              <div className="mt-2 sm:mt-0">PRESS [ESC] TO DISMISS</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
