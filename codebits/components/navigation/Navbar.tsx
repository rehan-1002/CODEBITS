'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ScrollStackNav from '@/components/navigation/ScrollStackNav'
import { AnimatedThemeToggler } from '@/components/theme/AnimatedThemeToggler'

interface NavbarProps {
  onOpenSearch?: () => void
}

export default function Navbar({ onOpenSearch }: NavbarProps = {}) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Monogram & Identity */}
        <Link className="flex items-center gap-3 group" href="/">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Image
              alt="CodeBits Monogram"
              className="object-contain drop-shadow-[0_0_10px_rgba(0,194,105,0.45)] group-hover:scale-105 transition-transform"
              fill
              src="/LOGO CB.png"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-[var(--text-primary)] leading-none">
              CodeBits
            </span>
            <span className="text-[10px] font-mono text-[var(--brand-primary)] tracking-wider leading-tight font-semibold">
              BY PROF. MRF
            </span>
          </div>
        </Link>

        {/* Right Actions: Theme Toggler & Triple-Dashed Stacked Navigation Trigger */}
        <div className="flex items-center gap-3">
          <AnimatedThemeToggler className="w-10 h-10 rounded-xl" />
          <ScrollStackNav />
        </div>
      </div>
    </header>
  )
}

export { Navbar }
