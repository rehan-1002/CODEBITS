import React from "react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative z-20 bg-[var(--brand-primary)] text-black selection:bg-black selection:text-[var(--brand-primary)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Purpose Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded border border-black/15 bg-black/10 flex items-center justify-center overflow-hidden">
                <Image
                  src="/LOGO CB.png"
                  alt="CodeBits"
                  width={32}
                  height={32}
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-black tracking-tight">
                  CodeBits
                </span>
                <span className="font-mono text-[10px] text-black/80 font-semibold uppercase tracking-wider">
                  MUMBAI UNIVERSITY ACADEMIC VAULT
                </span>
              </div>
            </div>

            <p className="text-xs text-black/80 leading-relaxed max-w-md font-medium">
              A centralized, controlled academic repository delivering syllabus-validated question papers, faculty notes, and solutions for engineering students under Mumbai University Rev-2019 &apos;C&apos; Scheme.
            </p>

            <div className="pt-2 text-[11px] font-mono text-black/75 space-y-1 font-semibold">
              <div>SCHEME: MUMBAI UNIVERSITY REV-2019 &apos;C&apos;</div>
              <div>SUPERVISED BY: PROF. ROHIT FALAKE (M.R.F)</div>
            </div>
          </div>

          {/* Academic Vault Navigation */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs text-black font-bold uppercase tracking-wider">
              ACADEMIC REPOSITORY
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link
                  href="/vault"
                  className="text-black/80 hover:text-black transition-colors hover:underline"
                >
                  Question Papers (PYQ)
                </Link>
              </li>
              <li>
                <Link
                  href="/vault"
                  className="text-black/80 hover:text-black transition-colors hover:underline"
                >
                  Faculty Course Notes
                </Link>
              </li>
              <li>
                <Link
                  href="/vault"
                  className="text-black/80 hover:text-black transition-colors hover:underline"
                >
                  Semester Syllabi
                </Link>
              </li>
              <li>
                <Link
                  href="/vault"
                  className="text-black/80 hover:text-black transition-colors hover:underline"
                >
                  Verified Solutions
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className="text-black/80 hover:text-black transition-colors hover:underline"
                >
                  Submit Academic Paper
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional & Access Navigation */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs text-black font-bold uppercase tracking-wider">
              INSTITUTIONAL
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link
                  href="/about"
                  className="text-black/80 hover:text-black transition-colors hover:underline"
                >
                  Faculty Directory
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-black/80 hover:text-black transition-colors hover:underline"
                >
                  Training Centers
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-black/80 hover:text-black transition-colors hover:underline"
                >
                  Student Portal Login
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-black/80 hover:text-black transition-colors hover:underline"
                >
                  Program Inquiries
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal / Disclaimer Bar */}
        <div className="mt-12 pt-6 border-t border-black/15 flex flex-col sm:flex-row items-center justify-between text-[11px] text-black/75 font-mono font-medium">
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
