'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ArrowUpRight,
  BookOpen,
  Upload,
  LogIn,
  Compass,
} from 'lucide-react'
import ScrollStack, { ScrollStackItem, ScrollStackHandle } from '@/components/ui/ScrollStack'
import { useTheme } from '@/components/theme/ThemeProvider'

export const TripleDashedIcon = ({
  className = 'w-5 h-5',
  isHovered = false,
}: {
  className?: string
  isHovered?: boolean
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    className={className}
  >
    <motion.line
      x1="4"
      y1="6"
      x2="20"
      y2="6"
      strokeDasharray="3.5 2.5"
      animate={isHovered ? { x: [0, 2, -1, 0] } : { x: 0 }}
      transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
    />
    <motion.line
      x1="4"
      y1="12"
      x2="20"
      y2="12"
      strokeDasharray="3.5 2.5"
      animate={isHovered ? { x: [0, -2, 1, 0] } : { x: 0 }}
      transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
    />
    <motion.line
      x1="4"
      y1="18"
      x2="20"
      y2="18"
      strokeDasharray="3.5 2.5"
      animate={isHovered ? { x: [0, 2, -1, 0] } : { x: 0 }}
      transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
    />
  </svg>
)

const navDeck = [
  {
    number: '01',
    title: 'Home Page',
    desc: 'Curriculum roadmap, faculty milestones, and Mumbai University portal gateway.',
    href: '/',
    icon: Compass,
    isPrimary: false,
  },
  {
    number: '02',
    title: 'Academic Vault',
    desc: 'Official question papers, marking schemes, and vetted faculty solutions.',
    href: '/vault',
    icon: BookOpen,
    isPrimary: true,
  },
  {
    number: '03',
    title: 'Community Upload',
    desc: 'Contribute exam papers, solutions, and module notes for peer moderation.',
    href: '/upload',
    icon: Upload,
    isPrimary: true,
  },
  {
    number: '04',
    title: 'Login',
    desc: 'Secure student portal with active session protection and submission tracking.',
    href: '/login',
    icon: LogIn,
    isPrimary: false,
  },
]

export default function ScrollStackNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [isBtnHovered, setIsBtnHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const scrollStackRef = useRef<ScrollStackHandle>(null)

  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  return (
    <>
      {/* Minimal Triple Dashed Icon Trigger with Kinetic Micro-Interactions */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsBtnHovered(true)}
        onMouseLeave={() => setIsBtnHovered(false)}
        className="relative w-10 h-10 bg-[var(--surface-base)] border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] rounded-xl text-[var(--brand-primary)] transition-all duration-200 cursor-pointer inline-flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 group"
        aria-label="Open Stacked Navigation Deck"
      >
        <span className="absolute inset-0 rounded-xl bg-[var(--brand-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <TripleDashedIcon className="w-5 h-5 relative z-10" isHovered={isBtnHovered} />
      </button>

      {/* Fullscreen Blurred Backdrop Overlay mounted via createPortal */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                data-lenis-prevent="true"
                className={`fixed inset-0 w-screen h-screen z-[9999] flex flex-col overflow-hidden transition-colors duration-200 ${
                  isDark
                    ? 'bg-black/75 text-[#F8FAFC]'
                    : 'bg-slate-950/40 text-slate-900'
                } backdrop-blur-2xl`}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100vw',
                  height: '100vh',
                  zIndex: 9999,
                }}
              >
                {/* Clickable Backdrop Area to Dismiss Deck */}
                <div
                  className="absolute inset-0 z-0 cursor-pointer"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Navigation Deck"
                />

                {/* Ambient Radial Vignette & Emerald Glow */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                  <div
                    className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] ${
                      isDark ? 'bg-[#00C269]/15' : 'bg-[#00C269]/12'
                    }`}
                  />
                  <div
                    className={`absolute -bottom-32 right-1/4 w-[500px] h-[400px] rounded-full blur-[130px] ${
                      isDark ? 'bg-[#00C269]/10' : 'bg-[#00C269]/8'
                    }`}
                  />
                </div>

                {/* Top Bar: Cross button aligned identically with Navbar trigger position */}
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-end relative z-20 pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--brand-primary)] bg-[var(--surface-base)] text-[var(--text-primary)] hover:text-[var(--brand-primary)] transition-all duration-200 cursor-pointer inline-flex items-center justify-center shadow-md hover:scale-105 active:scale-95 group"
                    aria-label="Close Navigation Deck"
                  >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>

                {/* Main Stage: Deck Slides Up From Bottom Over Blurred Background */}
                <motion.div
                  initial={{ opacity: 0, y: 70 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10 flex-1 w-full max-w-5xl mx-auto overflow-hidden min-h-0 h-full flex pt-1 pb-6 px-4 sm:px-6"
                >
                  {/* ScrollStack Deck */}
                  <div
                    data-lenis-prevent="true"
                    className="flex-1 w-full h-full relative overflow-hidden"
                  >
                    <ScrollStack
                      ref={scrollStackRef}
                      baseScale={0.88}
                      blurAmount={2.2}
                      itemDistance={120}
                      itemScale={0.035}
                      itemStackDistance={20}
                      stackPosition="2%"
                      scaleEndPosition="2%"
                      useWindowScroll={false}
                    >
                      {navDeck.map((item, idx) => {
                        const Icon = item.icon
                        const isPrimary = item.isPrimary

                        return (
                          <ScrollStackItem key={item.title}>
                            <motion.div
                              initial={{ opacity: 0, y: 50, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{
                                delay: 0.08 + idx * 0.05,
                                duration: 0.45,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                            >
                              <Link
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`group relative flex flex-col justify-between h-[72vh] min-h-[520px] max-h-[720px] w-full rounded-3xl p-8 sm:p-14 md:p-16 transition-all duration-300 cursor-pointer ${
                                  isDark
                                    ? isPrimary
                                      ? 'bg-gradient-to-br from-[#10241B] via-[#0D1E16] to-[#0A1611] border-2 border-[#00C269] shadow-[0_30px_80px_rgba(0,194,105,0.28)] hover:border-[#34EE99] hover:shadow-[0_35px_90px_rgba(0,194,105,0.38)] text-white'
                                      : 'bg-gradient-to-br from-[#131917] via-[#111715] to-[#0E1311] border-2 border-[#1F2925] shadow-[0_30px_80px_rgba(0,0,0,0.75)] hover:border-slate-600 hover:shadow-2xl text-white'
                                    : isPrimary
                                    ? 'bg-white border-2 border-[#009E52] shadow-[0_30px_80px_rgba(0,158,82,0.2)] hover:border-[#00C269] hover:shadow-[0_35px_90px_rgba(0,158,82,0.28)] text-slate-900'
                                    : 'bg-white border-2 border-slate-200 shadow-[0_25px_70px_rgba(0,0,0,0.14)] hover:border-slate-400 hover:shadow-2xl text-slate-900'
                                }`}
                              >
                                {/* Radial Hover Glow */}
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-[#00C269]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                {/* Top Header Bar */}
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                  <div
                                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${
                                      isDark
                                        ? isPrimary
                                          ? 'bg-[#00C269] text-[#0B0F0E] shadow-[0_8px_25px_rgba(0,194,105,0.45)]'
                                          : 'bg-[#0B0F0E] text-[#34EE99] border border-[#1F2925]'
                                        : isPrimary
                                        ? 'bg-[#009E52] text-white shadow-[0_8px_25px_rgba(0,158,82,0.35)]'
                                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                                    }`}
                                  >
                                    <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                                  </div>

                                  <div className="flex items-center gap-4 sm:gap-6">
                                    <span
                                      className={`font-mono text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter select-none ${
                                        isDark
                                          ? isPrimary
                                            ? 'text-[#00C269]'
                                            : 'text-slate-600'
                                          : isPrimary
                                          ? 'text-[#009E52]'
                                          : 'text-slate-300'
                                      }`}
                                    >
                                      {item.number}
                                    </span>
                                    <div
                                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                                        isDark
                                          ? isPrimary
                                            ? 'bg-[#00C269]/10 text-[#00C269] group-hover:bg-[#00C269] group-hover:text-[#0B0F0E]'
                                            : 'bg-slate-800/60 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                                          : isPrimary
                                          ? 'bg-emerald-50 text-[#009E52] group-hover:bg-[#009E52] group-hover:text-white'
                                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-900 group-hover:text-white'
                                      }`}
                                    >
                                      <ArrowUpRight className="w-7 h-7 sm:w-8 sm:h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                                    </div>
                                  </div>
                                </div>

                                {/* Clean Main Heading & 1-Lined Info */}
                                <div className="my-auto py-6 relative z-10">
                                  <h3
                                    className={`text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight transition-colors duration-200 ${
                                      isDark
                                        ? 'text-white group-hover:text-[#34EE99]'
                                        : 'text-slate-900 group-hover:text-[#009E52]'
                                    }`}
                                  >
                                    {item.title}
                                  </h3>
                                  <p
                                    className={`text-lg sm:text-2xl md:text-3xl mt-4 sm:mt-6 max-w-3xl leading-relaxed font-medium ${
                                      isDark ? 'text-slate-300' : 'text-slate-600'
                                    }`}
                                  >
                                    {item.desc}
                                  </p>
                                </div>

                                {/* Bottom Minimalist Cue */}
                                <div
                                  className={`pt-6 border-t flex items-center justify-between font-mono text-xs sm:text-sm tracking-widest uppercase relative z-10 ${
                                    isDark
                                      ? 'border-white/10 text-slate-500'
                                      : 'border-slate-200/90 text-slate-400'
                                  }`}
                                >
                                  <span>CodeBits Academic Gateway</span>
                                  <span className="flex items-center gap-1.5 group-hover:text-[var(--brand-primary)] transition-colors font-bold">
                                    Navigate Now <ArrowUpRight className="w-4 h-4" />
                                  </span>
                                </div>
                              </Link>
                            </motion.div>
                          </ScrollStackItem>
                        )
                      })}
                    </ScrollStack>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}

export { ScrollStackNav }
