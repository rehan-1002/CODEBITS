'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ArrowUpRight,
  BookOpen,
  Users,
  Upload,
  ShieldCheck,
  LogIn,
  Compass,
} from 'lucide-react'
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
    number: '01',
    title: 'MU Academic Vault',
    desc: 'Syllabus-validated question papers, official marking schemes, and vetted faculty lecture notes under Rev-2019 "C" Scheme.',
    href: '/vault',
    icon: BookOpen,
    tag: 'CORE REPOSITORY',
    badges: ['Rev-2019 C Scheme', 'Sem 1–8 Catalog', 'Verified Solutions'],
    isPrimary: true,
  },
  {
    number: '02',
    title: 'Faculty & Centers',
    desc: 'Pedagogical team led by Prof. Rohit Falake (M.R.F), verified placement records, and classroom centers in Kalyan & Ulhasnagar.',
    href: '/about',
    icon: Users,
    tag: 'INSTITUTIONAL DIRECTORY',
    badges: ['8 Faculty Mentors', 'Kalyan & Ulhasnagar', '250+ Placed'],
    isPrimary: false,
  },
  {
    number: '03',
    title: 'Community Upload',
    desc: 'Contribute exam solutions, university question papers, or verified module notes for review and institutional publishing.',
    href: '/upload',
    icon: Upload,
    tag: 'STUDENT PIPELINE',
    badges: ['PDF Dropzone', 'Attribution Badges', 'Peer Moderated'],
    isPrimary: true,
  },
  {
    number: '04',
    title: 'Student Portal Login',
    desc: 'Dual email/phone access, credential authentication, active session guard, and student submission tracking.',
    href: '/login',
    icon: LogIn,
    tag: 'IDENTITY GATEWAY',
    badges: ['Email / Phone Access', 'Zero OTP Latency', 'Active Session Guard'],
    isPrimary: false,
  },
  {
    number: '05',
    title: 'Protected Canvas DRM',
    desc: 'Zero-scraping document virtualizer with in-memory HTML5 canvas page decomposition and real-time forensic watermarking.',
    href: '/vault',
    icon: ShieldCheck,
    tag: 'SECURITY ENGINE',
    badges: ['Canvas Rasterization', 'Dynamic Watermark', 'Anti-Deterrence'],
    isPrimary: true,
  },
  {
    number: '06',
    title: 'CodeBits Home Gateway',
    desc: 'Main entrance featuring the kinetic SVG progress trace, dynamic hero revelation, and institutional curriculum roadmap.',
    href: '/',
    icon: Compass,
    tag: 'KINETIC ROADMAP',
    badges: ['Skiper19 Kinetic Path', 'ScrollFloat Climax', 'Curriculum Gateway'],
    isPrimary: false,
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

      {/* Fullscreen Drawer with React Bits ScrollStack Stacking System */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            data-lenis-prevent="true"
            className="fixed inset-0 z-[100] bg-white/95 dark:bg-[#0B0F0E]/95 backdrop-blur-2xl flex flex-col text-slate-900 dark:text-[#F8FAFC] transition-colors duration-200"
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-center max-w-4xl w-full mx-auto px-6 py-6 border-b border-slate-200 dark:border-[#1F2925]">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00C269] animate-pulse" />
                <span className="font-mono text-xs text-[#009E52] dark:text-[#34EE99] uppercase tracking-widest font-semibold">
                  CodeBits Stacked Navigation System
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-full border border-slate-200 dark:border-[#1F2925] hover:border-[#00C269] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                aria-label="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ScrollStack Deck */}
            <div
              data-lenis-prevent="true"
              className="flex-1 w-full max-w-4xl mx-auto overflow-hidden min-h-0 h-full relative"
            >
              <ScrollStack
                baseScale={0.86}
                blurAmount={3}
                itemDistance={45}
                itemScale={0.035}
                itemStackDistance={28}
                stackPosition="6%"
                scaleEndPosition="2%"
                useWindowScroll={false}
              >
                {navDeck.map((item) => {
                  const Icon = item.icon
                  const isPrimary = item.isPrimary

                  return (
                    <ScrollStackItem key={item.title}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`group relative flex flex-col justify-between min-h-[270px] sm:min-h-[290px] w-full rounded-3xl p-7 sm:p-9 transition-all cursor-pointer ${
                          isPrimary
                            ? 'bg-emerald-50/95 dark:bg-[#10241B] border-2 border-[#00C269] shadow-[0_10px_35px_rgba(0,194,105,0.18)] hover:border-[#34EE99] hover:shadow-[0_15px_45px_rgba(0,194,105,0.3)]'
                            : 'bg-white dark:bg-[#131917] border border-slate-200 dark:border-[#1F2925] shadow-lg dark:shadow-[0_10px_35px_rgba(0,0,0,0.5)] hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-xl'
                        }`}
                      >
                        {/* Top Meta Bar */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-3 rounded-2xl flex items-center justify-center ${
                                isPrimary
                                  ? 'bg-[#00C269] text-[#0B0F0E]'
                                  : 'bg-slate-100 dark:bg-[#0B0F0E] text-slate-800 dark:text-[#34EE99] border border-slate-200 dark:border-[#1F2925]'
                              }`}
                            >
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <span
                                className={`inline-block font-mono text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full ${
                                  isPrimary
                                    ? 'bg-[#00C269]/15 dark:bg-[#00C269]/20 text-[#009E52] dark:text-[#34EE99] border border-[#00C269]/40'
                                    : 'bg-slate-100 dark:bg-[#19221F] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1F2925]'
                                }`}
                              >
                                {item.tag}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`font-mono text-2xl font-black ${
                                isPrimary
                                  ? 'text-[#00C269]'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {item.number}
                            </span>
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                isPrimary
                                  ? 'bg-[#00C269]/10 text-[#00C269] group-hover:bg-[#00C269] group-hover:text-[#0B0F0E]'
                                  : 'bg-slate-100 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-900 dark:group-hover:text-white'
                              }`}
                            >
                              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                          </div>
                        </div>

                        {/* Middle Content */}
                        <div className="my-2">
                          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug text-slate-900 dark:text-white group-hover:text-[#009E52] dark:group-hover:text-[#34EE99] transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-300">
                            {item.desc}
                          </p>
                        </div>

                        {/* Bottom Feature Badges */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200 dark:border-white/5">
                          {item.badges.map((badge) => (
                            <span
                              key={badge}
                              className={`text-[10px] font-mono px-2.5 py-1 rounded-md ${
                                isPrimary
                                  ? 'bg-emerald-100/80 dark:bg-[#163024] text-emerald-900 dark:text-[#A7F3D0] border border-[#00C269]/30'
                                  : 'bg-slate-100 dark:bg-[#19221F] text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-[#1F2925]'
                              }`}
                            >
                              {badge}
                            </span>
                          ))}
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
