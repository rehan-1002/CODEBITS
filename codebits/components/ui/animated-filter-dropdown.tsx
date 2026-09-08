"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, Check, Search, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterDropdownOption {
  id: string | number;
  label: string;
  sublabel?: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
}

export interface AnimatedFilterDropdownProps {
  label: string;
  selectedId: string | number;
  options: FilterDropdownOption[];
  onSelect: (id: string | number) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  align?: "left" | "right" | "center";
  className?: string;
}

const SPRING = { type: "spring", bounce: 0.1, duration: 0.38 } as const;

const panelVariants = {
  enter: {
    opacity: 0,
    y: -6,
    scale: 0.97,
    filter: "blur(20px)",
  },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.97,
    filter: "blur(20px)",
  },
};

export function AnimatedFilterDropdown({
  label,
  selectedId,
  options,
  onSelect,
  searchable = true,
  searchPlaceholder = "Search...",
  align = "right",
  className,
}: AnimatedFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => String(opt.id) === String(selectedId));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setSearch(""), 200);
      return () => clearTimeout(t);
    } else if (searchable) {
      const t = setTimeout(() => searchRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [open, searchable]);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(search.toLowerCase()))
  );

  const alignClass =
    align === "right"
      ? "right-0"
      : align === "left"
      ? "left-0"
      : "left-1/2 -translate-x-1/2";

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "h-9 px-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-base)] text-xs font-mono text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:bg-[var(--surface-elevated)] transition-all flex items-center gap-2 cursor-pointer",
          open && "border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/30"
        )}
      >
        <span className="text-[var(--text-muted)] uppercase text-[11px] font-semibold tracking-wider">
          {label}:
        </span>
        <span className="font-bold text-[var(--brand-primary)]">
          {selectedOption ? selectedOption.label : "Select"}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ml-1",
            open && "rotate-180 text-[var(--brand-primary)]"
          )}
        />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={panelVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={SPRING}
            className={cn(
              "absolute top-full mt-2 z-50 w-72 max-w-[calc(100vw-32px)] bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden backdrop-blur-xl",
              alignClass
            )}
          >
            {/* Optional search header */}
            {searchable && (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-elevated)]/50">
                  <Search className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                  <Input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="h-7 border-0 shadow-none bg-transparent dark:bg-transparent focus-visible:ring-0 px-1 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <Separator className="bg-[var(--border-subtle)]" />
              </>
            )}

            {/* Items list with scroll and spring layout */}
            <div className="max-h-64 overflow-y-auto py-1.5">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => {
                  const isSelected = String(opt.id) === String(selectedId);
                  const Icon = opt.icon;

                  return (
                    <React.Fragment key={opt.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(opt.id);
                          setOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3.5 py-2.5 text-xs text-left transition-colors cursor-pointer",
                          isSelected
                            ? "bg-[var(--badge-bg)] text-[var(--brand-primary)] font-bold"
                            : "text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--brand-primary)]"
                        )}
                      >
                        {Icon && (
                          <Icon
                            className={cn(
                              "w-4 h-4 shrink-0",
                              isSelected ? "text-[var(--brand-primary)]" : "text-[var(--text-muted)]"
                            )}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-mono">{opt.label}</div>
                          {opt.sublabel && (
                            <div className="text-[10px] text-[var(--text-muted)] truncate font-sans">
                              {opt.sublabel}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0 ml-1" />
                        )}
                      </button>
                      {idx < filteredOptions.length - 1 && (
                        <Separator className="bg-[var(--border-subtle)]/40 my-0.5" />
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <div className="text-xs text-[var(--text-muted)] text-center py-6 px-4 font-mono">
                  No matching options
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AnimatedFilterDropdown;
