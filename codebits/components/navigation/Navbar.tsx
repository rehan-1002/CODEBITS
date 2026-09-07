"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Search, ArrowRight } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/theme/AnimatedThemeToggler";
import { ScrollStackNav } from "./ScrollStackNav";

interface NavbarProps {
  onOpenSearch?: () => void;
}

export function Navbar({ onOpenSearch }: NavbarProps) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center space-x-3 group focus:outline-none"
            >
              <div className="relative w-8 h-8 rounded border border-[var(--border-subtle)] bg-[var(--surface-base)] flex items-center justify-center overflow-hidden group-hover:border-[var(--brand-primary)] transition-colors">
                <Image
                  src="/LOGO CB.png"
                  alt="CodeBits Monogram"
                  width={32}
                  height={32}
                  className="object-contain p-0.5"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                  CodeBits
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] tracking-wider">
                  BY PROF. MRF
                </span>
              </div>
            </Link>
          </div>

          {/* Center / Search Dock Trigger */}
          <div className="hidden md:flex items-center">
            <button
              onClick={onOpenSearch}
              type="button"
              className="flex items-center space-x-3 px-3.5 py-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-base)] text-xs text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>Search academic vault...</span>
              <kbd className="inline-flex items-center font-mono text-[10px] bg-[var(--surface-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)] rounded px-1.5 py-0.5">
                Ctrl + K
              </kbd>
            </button>
          </div>

          {/* Right Action Utilities */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Search on Mobile */}
            <button
              onClick={onOpenSearch}
              type="button"
              aria-label="Search resources"
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme Toggler */}
            <AnimatedThemeToggler />

            {/* Access Vault CTA */}
            <Link
              href="/vault"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-md bg-[var(--brand-primary)] text-black text-xs font-semibold hover:bg-[var(--brand-dark)] transition-colors shadow-none"
            >
              <span>ACCESS VAULT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Menu Trigger */}
            <button
              onClick={() => setNavOpen(true)}
              type="button"
              aria-label="Open menu"
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-base)] text-xs font-mono font-medium text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">MENU</span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen ScrollStack Navigation Drawer */}
      <ScrollStackNav isOpen={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}
