'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowUpRight, BookOpen, Users, Upload, ShieldCheck } from 'lucide-react'
import ScrollStack, { ScrollStackItem } from '@/components/ui/ScrollStack'

export const TripleDashedIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    className={className}
  >
    <line x1="4" y1="6" x2="20" y2="6" strokeDasharray="3.5 2.5" />
    <line x1="4" y1="12" x2="20" y2="12" strokeDasharray="3.5 2.5" />
    <line x1="4" y1="18" x2="20" y2="18" strokeDasharray="3.5 2.5" />
  </svg>
)

const navDeck = [
  {
    title: 'MU Academic Vault',
    desc: 'Syllabus-validated question papers, official marking schemes, and vetted lecture notes.',
    href: '/vault',
    icon: BookOpen,
    tag: 'CORE REPOSITORY',
  },
  {
    title: 'Faculty & Centers',
    desc: 'Pedagogical team, placement records, and offline classroom centers in Kalyan & Ulhasnagar.',
    href: '/about',
    icon: Users,
    tag: 'INSTITUTIONAL',
  },
  {
    title: 'Community Upload',
    desc: 'Contribute exam solutions, university question papers, or verified module notes.',
    href: '/upload',
    icon: Upload,
    tag: 'STUDENT PIPELINE',
  },
  {
    title: 'Protected Canvas DRM',
    desc: 'Zero-scraping document virtualizer with real-time session eviction and watermarking.',
    href: '/vault',
    icon: ShieldCheck,
    tag: 'SECURITY ENGINE',
  },
]

export default function ScrollStackNav() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Minimal Triple Dashed Icon Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 bg-[var(--surface-base)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] rounded-xl text-[var(--brand-primary)] transition-all cursor-pointer inline-flex items-center justify-center shadow-sm hover:scale-105"
        aria-label="Open Stacked Navigation Deck"
      >
        <TripleDashedIcon className="w-5 h-5" />
      </button>

      {/* Fullscreen Drawer with ScrollStack System */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[var(--bg-base)]/95 backdrop-blur-2xl flex flex-col text-[var(--text-primary)] transition-colors duration-200"
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-center max-w-4xl w-full mx-auto px-6 py-6 border-b border-[var(--border-subtle)]">
              <span className="font-mono text-xs text-[var(--brand-primary)] uppercase tracking-widest font-semibold">
                CodeBits Navigation Deck
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                aria-label="Close Drawer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* ScrollStack Deck */}
            <div className="flex-1 w-full max-w-4xl mx-auto overflow-hidden">
              <ScrollStack
                baseScale={0.88}
                blurAmount={3}
                itemDistance={70}
                itemScale={0.04}
                itemStackDistance={20}
                scaleEndPosition="8%"
                stackPosition="15%"
                useWindowScroll={false}
              >
                {navDeck.map((item) => {
                  const Icon = item.icon
                  return (
                    <ScrollStackItem key={item.title}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="group flex flex-col justify-between h-full w-full bg-[var(--surface-base)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/70 rounded-3xl p-8 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(0,194,105,0.2)]"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--brand-primary)]">
                              <Icon className="w-6 h-6" />
                            </div>
                            <span className="font-mono text-[10px] text-[var(--brand-primary)] tracking-widest uppercase font-semibold">
                              {item.tag}
                            </span>
                          </div>
                          <ArrowUpRight className="w-6 h-6 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </div>

                        <div>
                          <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    </ScrollStackItem>
                  )
                })}
              </ScrollStack>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export { ScrollStackNav }
