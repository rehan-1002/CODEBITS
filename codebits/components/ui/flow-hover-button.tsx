"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FlowHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  variant?: "default" | "brand";
}

/**
 * FlowHoverButton
 * Implementation of https://21st.dev/@vaib215/components/flow-hover-button
 * Features a circular fluid flow wave that sweeps smoothly across the button surface on hover.
 */
export const FlowHoverButton = React.forwardRef<
  HTMLButtonElement,
  FlowHoverButtonProps
>(({ className, icon, children, variant = "brand", disabled, ...props }, ref) => {
  const isBrand = variant === "brand";

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        // Base button structure & fluid flow container
        "group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl border px-7 py-3.5 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-500 active:scale-95 hover:scale-[1.02] cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100",
        // Isolated stacking context for the before element
        "z-10 isolate",
        // Fluid circular flow shape positioned at bottom-right
        "before:absolute before:inset-0 before:-z-10 before:translate-x-[150%] before:translate-y-[150%] before:scale-[2.5] before:rounded-[100%] before:content-[''] before:transition-transform before:duration-1000 ease-out",
        // Hover trigger for the fluid sweep
        "hover:before:translate-x-[0%] hover:before:translate-y-[0%]",
        // Variant styling
        isBrand
          ? [
              // CodeBits Brand Theme
              "border-black/15 dark:border-white/20 bg-white/70 dark:bg-[#0E1612]/90 text-[var(--text-primary)] dark:text-white backdrop-blur-md shadow-md",
              "before:bg-[var(--brand-primary,#00C269)] hover:text-[#06110A] hover:border-[var(--brand-primary)] hover:shadow-[0_0_30px_rgba(0,194,105,0.45)]",
            ]
          : [
              // Default Zinc Theme (from 21st.dev original)
              "border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200",
              "before:bg-zinc-800 dark:before:bg-zinc-200 hover:text-zinc-100 dark:hover:text-zinc-900",
            ],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">{icon}</span>}
      <span className="relative z-10 transition-colors duration-300">{children}</span>
    </button>
  );
});

FlowHoverButton.displayName = "FlowHoverButton";
export const Button = FlowHoverButton;
export default FlowHoverButton;
