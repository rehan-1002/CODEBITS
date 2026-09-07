"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { CbAiDrawer } from "@/components/ai/CbAiDrawer";

export function GlobalShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Ctrl + K / Cmd + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors">
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <CbAiDrawer isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
