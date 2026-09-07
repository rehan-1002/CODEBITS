import React from "react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-secondary)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Purpose Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded border border-[var(--border-subtle)] bg-[var(--surface-base)] flex items-center justify-center overflow-hidden">
                <Image
                  src="/LOGO CB.png"
                  alt="CodeBits"
                  width={32}
                  height={32}
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-[var(--text-primary)]">
                  CodeBits
                </span>
                <span className="font-mono text-[10px] text-[var(--brand-primary)] uppercase tracking-wider">
                  MUMBAI UNIVERSITY ACADEMIC VAULT
                </span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
              A centralized, controlled academic repository delivering syllabus-validated question papers, faculty notes, and solutions for engineering students under Mumbai University Rev-2019 'C' Scheme.
            </p>

            <div className="pt-2 text-[11px] font-mono text-[var(--text-muted)] space-y-1">
              <div>SCHEME: MUMBAI UNIVERSITY REV-2019 'C'</div>
              <div>SUPERVISED BY: PROF. ROHIT FALAKE (M.R.F)</div>
            </div>
          </div>

          {/* Academic Vault Navigation */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs text-[var(--text-primary)] font-semibold uppercase tracking-wider">
              ACADEMIC REPOSITORY
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/vault"
                  className="hover:text-[var(--brand-primary)] transition-colors"
                >
                  Question Papers (PYQ)
                </Link>
              </li>
              <li>
                <Link
                  href="/vault"
                  className="hover:text-[var(--brand-primary)] transition-colors"
                >
                  Faculty Course Notes
                </Link>
              </li>
              <li>
                <Link
                  href="/vault"
                  className="hover:text-[var(--brand-primary)] transition-colors"
                >
                  Semester Syllabi
                </Link>
              </li>
              <li>
                <Link
                  href="/vault"
                  className="hover:text-[var(--brand-primary)] transition-colors"
                >
                  Verified Solutions
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className="hover:text-[var(--brand-primary)] transition-colors"
                >
                  Submit Academic Paper
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional & Access Navigation */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs text-[var(--text-primary)] font-semibold uppercase tracking-wider">
              INSTITUTIONAL
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/about"
                  className="hover:text-[var(--brand-primary)] transition-colors"
                >
                  Faculty Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-[var(--brand-primary)] transition-colors"
                >
                  Training Centers
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-[var(--brand-primary)] transition-colors"
                >
                  Student Portal Login
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-[var(--brand-primary)] transition-colors"
                >
                  Program Inquiries
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal / Disclaimer Bar */}
        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
          <div>
            &copy; {new Date().getFullYear()} CODEBITS. ALL RIGHTS RESERVED.
          </div>
          <div className="mt-2 sm:mt-0 flex items-center space-x-4">
            <span>OBSIDIAN-EMERALD ARCHITECTURE</span>
            <span>PROTECTED CANVAS DELIVERY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
