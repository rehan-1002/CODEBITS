"use client"

import React from "react"
import Link from "next/link"
import { RandomLetterSwap } from "@/components/ui/random-letter-swap"

interface NavLinkItem {
  label: string
  href: string
}

const defaultLinks: NavLinkItem[] = [
  { label: "Home", href: "/?home=1" },
  { label: "11th & 12th", href: "/11th-12th" },
  { label: "Vault", href: "/vault" },
  { label: "AI Solver", href: "/solver" },
  { label: "Converter", href: "/converter" },
  { label: "Lectures", href: "/lectures" },
  { label: "About", href: "/about" },
]

export interface RandomLetterSwapNavProps {
  className?: string
  links?: NavLinkItem[]
}

export default function RandomLetterSwapNav({
  className = "",
  links = defaultLinks,
}: RandomLetterSwapNavProps) {
  return (
    <nav className={`flex items-center gap-5 lg:gap-7 ${className}`}>
      {links.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="group inline-flex items-center py-1 transition-colors duration-200"
        >
          <RandomLetterSwap
            className="cursor-pointer font-medium text-[var(--text-secondary)] text-sm group-hover:text-[var(--brand-primary)] dark:group-hover:text-emerald-400 transition-colors"
            label={item.label}
            staggerDuration={0.025}
            transition={{ duration: 0.6, type: "spring" }}
          />
        </Link>
      ))}
    </nav>
  )
}

export { RandomLetterSwapNav }
