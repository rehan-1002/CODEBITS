'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, User as UserIcon } from 'lucide-react'
import ScrollStackNav from '@/components/navigation/ScrollStackNav'
import RandomLetterSwapNav from '@/components/ui/m-random-letter-swap-1'
import { AnimatedThemeToggler } from '@/components/theme/AnimatedThemeToggler'
import { getCurrentUser, clearSession, logoutUserApi, fetchCurrentAuthUser } from '@/lib/auth'
import { Profile } from '@/types/auth'

interface NavbarProps {
  onOpenSearch?: () => void
}

const NAV_LINKS = [
  { label: "Home", href: "/?home=1" },
  { label: "11th & 12th", href: "/11th-12th" },
  { label: "Vault", href: "/vault" },
  { label: "AI Solver", href: "/solver" },
  { label: "Converter", href: "/converter" },
  { label: "Lectures", href: "/lectures" },
  { label: "About", href: "/about" },
];

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
        <Link className="flex items-center group py-1 shrink-0" href="/?home=1">
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

        {/* Center: Quick Nav with Random Letter Swap Interaction */}
        <div className="hidden md:flex items-center justify-center flex-1 mx-4 lg:mx-6">
          <RandomLetterSwapNav links={NAV_LINKS} />
        </div>

        {/* Right Actions: Theme Toggler, Admin Badge & Stacked Navigation Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center space-x-2">
              {user.role === 'admin' ? (
                <Link
                  href="/vault?tab=moderation"
                  className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-amber-400/40 bg-amber-400/10 text-amber-400 text-xs font-mono font-bold hover:bg-amber-400/20 transition-colors"
                  title="Review pending student contributions"
                >
                  <span>REVIEW QUEUE</span>
                </Link>
              ) : null}

              <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] text-xs font-mono shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />
                <span className="font-semibold max-w-[90px] sm:max-w-[120px] truncate">
                  {user.role === 'admin' ? 'ADMIN' : user.full_name?.split(' ')[0] || 'STUDENT'}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await logoutUserApi()
                    window.location.replace('/login')
                  }}
                  title="Sign out of CodeBits"
                  className="text-[11px] text-[var(--text-muted)] hover:text-red-400 cursor-pointer ml-1 underline decoration-dotted flex items-center space-x-0.5 transition-colors"
                >
                  <LogOut className="w-3 h-3 inline mr-0.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]/40 text-xs font-mono font-medium transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>LOGIN</span>
            </Link>
          )}

          <AnimatedThemeToggler className="w-10 h-10 rounded-xl" />
          <ScrollStackNav />
        </div>
      </div>
    </header>
  )
}

export { Navbar }
