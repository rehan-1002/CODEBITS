'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ScrollStackNav from '@/components/navigation/ScrollStackNav'
import { AnimatedThemeToggler } from '@/components/theme/AnimatedThemeToggler'
import { getCurrentUser, clearSession, logoutUserApi, fetchCurrentAuthUser } from '@/lib/auth'
import { Profile } from '@/types/auth'

interface NavbarProps {
  onOpenSearch?: () => void
}

export default function Navbar({ onOpenSearch }: NavbarProps = {}) {
  const [user, setUser] = useState<Profile | null>(null)

  useEffect(() => {
    fetchCurrentAuthUser().then((u) => {
      if (u) setUser(u)
    })
    const handleAuth = () => {
      setUser(getCurrentUser())
    }
    window.addEventListener('codebits-auth-change', handleAuth)
    return () => window.removeEventListener('codebits-auth-change', handleAuth)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Official CodeBits Brand Identity */}
        <Link className="flex items-center group py-1" href="/?home=1">
          <div className="relative h-9 sm:h-10 w-36 sm:w-44 flex items-center">
            {/* Light Mode Logo */}
            <Image
              alt="CodeBits by Prof. MRF"
              className="object-contain object-left block dark:hidden group-hover:scale-105 transition-transform duration-300"
              fill
              sizes="(max-width: 640px) 144px, 176px"
              priority
              src="/codebits-brand-logo.png"
            />
            {/* Dark Mode Logo with glowing emerald emblem & white text */}
            <Image
              alt="CodeBits by Prof. MRF"
              className="object-contain object-left hidden dark:block group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(0,194,105,0.35)]"
              fill
              sizes="(max-width: 640px) 144px, 176px"
              priority
              src="/codebits-brand-logo-dark.png"
            />
          </div>
        </Link>


        {/* Right Actions: Theme Toggler, Admin Badge & Stacked Navigation Trigger */}
        <div className="flex items-center gap-3">
          {user?.role === 'admin' ? (
            <div className="flex items-center space-x-2">
              <Link
                href="/vault?tab=moderation"
                className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-amber-400/40 bg-amber-400/10 text-amber-400 text-xs font-mono font-bold hover:bg-amber-400/20 transition-colors"
                title="Review pending student contributions"
              >
                <span>REVIEW QUEUE</span>
              </Link>
              <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg border border-[var(--brand-primary)]/40 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] text-xs font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />
                <span>ADMIN</span>
                <button
                  type="button"
                  onClick={() => logoutUserApi()}
                  title="Sign out from Administrator mode"
                  className="text-[10px] text-[var(--text-muted)] hover:text-red-400 cursor-pointer ml-1 underline decoration-dotted"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : null}

          <AnimatedThemeToggler className="w-10 h-10 rounded-xl" />
          <ScrollStackNav />
        </div>
      </div>
    </header>
  )
}

export { Navbar }
