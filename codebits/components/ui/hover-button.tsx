"use client";

import React from "react";
import { ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  label?: string;
  active?: boolean;
  icon?: LucideIcon;
  variant?: "default" | "brand" | "subtle";
  size?: "sm" | "default" | "lg";
}

/**
 * HoverButton / HoverActionButton
 * Re-implementation of https://21st.dev/@erikvalencia1/components/hover-button-1
 * tailored for CodeBits Mumbai University Academic Vault design system.
 */
export function HoverButton({
  children,
  label,
  active = false,
  icon: Icon = ArrowRight,
  variant = "brand",
  size = "default",
  className,
  ...props
}: HoverButtonProps) {
  const content = children ?? label;

  const sizeClasses = {
    sm: "px-2.5 py-1 text-[11px]",
    default: "px-3.5 py-1.5 text-xs",
    lg: "px-5 py-2.5 text-sm",
  }[size];

  return (
    <button
      type={props.type || "button"}
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-md border text-center font-medium whitespace-nowrap cursor-pointer transition-all duration-300 select-none",
        sizeClasses,
        active
          ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-black font-bold shadow-sm shadow-[var(--brand-primary)]/20"
          : "border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-black",
        className
      )}
      {...props}
    >
      {/* Default label - slides right and dissolves on hover */}
      <span
        className={cn(
          "relative z-10 inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0",
          active ? "font-bold text-black" : "text-[var(--text-secondary)]"
        )}
      >
        {content}
      </span>

      {/* Hover action overlay with ArrowRight - slides in from right */}
      <div
        className={cn(
          "absolute inset-0 z-20 flex h-full w-full translate-x-12 items-center justify-center gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100",
          active ? "text-black font-bold" : "text-black font-semibold"
        )}
      >
        <span className="truncate">{content}</span>
        <Icon className="h-3.5 w-3.5 shrink-0" />
      </div>

      {/* Expanding kinetic ripple fill - hidden at rest, blooms outward on hover */}
      {!active && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[20%] top-[40%] h-2 w-2 scale-0 opacity-0 rounded-full bg-[var(--brand-primary)] transition-all duration-300 ease-out group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:scale-[2] group-hover:opacity-100 group-hover:rounded-none"
        />
      )}
    </button>
  );
}

// Alias for compatibility
export const HoverActionButton = HoverButton;
export default HoverButton;
