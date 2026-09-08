"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DoubleChevronProps {
  index: number;
  dotColor: string;
}

const DoubleChevron = ({ index, dotColor }: DoubleChevronProps) => {
  const baseDelay = index * 0.12;
  const dots = [
    { cx: 2, cy: 2, d: 0 },
    { cx: 5, cy: 5, d: 0.05 },
    { cx: 8, cy: 8, d: 0.1 },
    { cx: 5, cy: 11, d: 0.15 },
    { cx: 2, cy: 14, d: 0.2 },
    { cx: 6, cy: 2, d: 0.05 },
    { cx: 9, cy: 5, d: 0.1 },
    { cx: 12, cy: 8, d: 0.15 },
    { cx: 9, cy: 11, d: 0.2 },
    { cx: 6, cy: 14, d: 0.25 },
  ];

  return (
    <svg
      width="14"
      height="16"
      viewBox="0 0 14 16"
      aria-hidden="true"
      focusable="false"
      className="shrink-0 overflow-visible"
    >
      <g fill={dotColor}>
        {dots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.cx}
            cy={dot.cy}
            r="1"
            className="bd-dot"
            style={{ animationDelay: `${baseDelay + dot.d}s` }}
          />
        ))}
      </g>
    </svg>
  );
};

export interface AntiMetalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  href?: string;
  accentFrom?: string;
  accentTo?: string;
  dotColor?: string;
}

/**
 * AntiMetalButton
 * Re-implementation of https://21st.dev/@smammar100/components/anti-metal-button
 * Fully adaptive to Light Mode & Dark Mode.
 * Sleek metallic CTA button featuring a cascading dot-wave animation
 * and an accent slab that smoothly expands on hover.
 */
export const AntiMetalButton = React.forwardRef<
  HTMLButtonElement,
  AntiMetalButtonProps
>(
  (
    {
      className,
      children,
      label,
      href,
      accentFrom = "#00e599", // Codebits brand emerald
      accentTo = "#00c580",
      dotColor = "#0a0a0a",
      ...props
    },
    ref
  ) => {
    const text = label ?? children ?? "SUBMIT A PAPER";

    const content = (
      <>
        <style>{`
          @keyframes bd-dot-wave {
            0%, 70%, 100% { opacity: 0.25; transform: scale(0.85); }
            35% { opacity: 1; transform: scale(1); }
          }
          .bd-dot {
            transform-box: fill-box;
            transform-origin: center;
            animation: bd-dot-wave 1.4s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .bd-dot { animation: none; opacity: 1; }
          }
        `}</style>

        {/* Button label text - adaptive to light & dark mode */}
        <span className="absolute inset-y-0 right-4 flex items-center text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)] dark:text-white select-none transition-colors">
          {text}
        </span>

        {/* Expanding accent slab with cascading dot chevrons */}
        <span
          aria-hidden="true"
          className="absolute bottom-1 left-1 top-1 z-10 flex w-9 items-center justify-start gap-2.5 overflow-hidden rounded-lg pl-3 pr-2.5 transition-[width,gap] duration-200 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/btn:w-[calc(100%-0.5rem)]"
          style={{
            background: `linear-gradient(180deg, ${accentFrom} 0%, ${accentTo} 100%)`,
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -2px 4px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)",
          }}
        >
          <DoubleChevron index={0} dotColor={dotColor} />
          <DoubleChevron index={1} dotColor={dotColor} />
          <DoubleChevron index={2} dotColor={dotColor} />
          <DoubleChevron index={3} dotColor={dotColor} />
          <DoubleChevron index={4} dotColor={dotColor} />
          <DoubleChevron index={5} dotColor={dotColor} />
        </span>
      </>
    );

    const baseClasses = cn(
      "group/btn relative inline-flex h-11 min-w-[176px] cursor-pointer overflow-hidden rounded-xl transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      // Light Mode styles: crisp white/silver metallic gradient with subtle border
      "bg-[linear-gradient(180deg,#FFFFFF_0%,#F1F5F9_100%)] border border-[var(--border-subtle)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_8px_rgba(0,0,0,0.06)]",
      // Dark Mode styles: deep obsidian metallic gradient with dark border & sheen
      "dark:bg-[linear-gradient(180deg,#1c1c1e_0%,#0e0e10_100%)] dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.4)]",
      className
    );

    if (href) {
      return (
        <Link href={href} className={baseClasses}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={baseClasses} {...props}>
        {content}
      </button>
    );
  }
);

AntiMetalButton.displayName = "AntiMetalButton";
export default AntiMetalButton;
