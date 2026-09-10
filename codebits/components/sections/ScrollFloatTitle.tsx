"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollFloatTitle() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  const titleText = "CODEBITS";

  useEffect(() => {
    // Check reduced motion preference
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !containerRef.current || lettersRef.current.length === 0) {
      return;
    }

    const ctx = gsap.context(() => {
      // Scrub animation: yPercent: 120 -> 0, scaleY: 2.3 -> 1, stagger: 0.03
      gsap.fromTo(
        lettersRef.current,
        {
          yPercent: 120,
          scaleY: 2.3,
          opacity: 0.2,
        },
        {
          yPercent: 0,
          scaleY: 1,
          opacity: 1,
          stagger: 0.03,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "center center",
            scrub: 0.8,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative py-24 md:py-36 border-t border-[var(--border-subtle)] bg-[var(--surface-base)] overflow-hidden transition-colors"
      aria-label="CodeBits Title Climax"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
          <BookOpen className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
          <span className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-wider">
            AUTHORITATIVE INSTITUTIONAL ARCHIVE
          </span>
        </div>

        {/* The Giant Scrubbed Typographic Climax */}
        <div className="overflow-hidden py-4">
          <h2
            ref={titleRef}
            className="text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black tracking-tighter text-[var(--text-primary)] select-none leading-none flex justify-center items-center"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {titleText.split("").map((char, i) => (
              <span
                key={i}
                ref={(el) => {
                  lettersRef.current[i] = el;
                }}
                className="inline-block will-change-transform"
              >
                {char}
              </span>
            ))}
          </h2>
        </div>

        {/* Structural Subtitle & Call to Action */}
        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-sans">
            Curated specifically for Mumbai University engineering branches. Previous years&apos; questions, vetted lecture notes, and detailed solutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/vault"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-md bg-[var(--brand-primary)] text-black text-sm font-bold hover:bg-[var(--brand-dark)] transition-colors shadow-none cursor-pointer"
            >
              <span>CONTINUE TO RESOURCES</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-sm font-mono text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-colors cursor-pointer"
            >
              <span>INSTITUTIONAL PEDAGOGY</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
