'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight, BookOpen, Users, Upload, ShieldCheck } from 'lucide-react'

const navDeck = [
  {
    title: 'MU Academic Vault',
    desc: 'Syllabus, PYQs, and verified lecture notes',
    href: '/vault',
    icon: BookOpen,
  },
  {
    title: 'Faculty & Centers',
    desc: 'Centres, mentors, placement records & metrics',
    href: '/about',
    icon: Users,
  },
  {
    title: 'Community Upload',
    desc: 'Contribute exam solutions or notes for review',
    href: '/upload',
    icon: Upload,
  },
  {
    title: 'Protected Canvas DRM',
    desc: 'Zero-scraping document virtualizer and session locks',
    href: '/vault',
    icon: ShieldCheck,
  },
]

export default function ScrollStackNav() {
  const [isOpen, setIsOpen] = useState(false)

  // Prevent background scrolling ONLY when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Minimal Icon Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2.5 bg-[#131917] border border-[#1F2925] hover:border-[#00C269] rounded-xl text-[#00C269] transition-all cursor-pointer inline-flex items-center justify-center shadow-[0_0_12px_rgba(0,194,105,0.15)]"
        aria-label="Open Navigation Deck"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Conditional Fullscreen Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="nav-deck-overlay"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-[#0B0F0E]/95 backdrop-blur-2xl flex flex-col p-6 sm:p-12 overflow-y-auto"
          >
            <div className="flex justify-between items-center max-w-4xl w-full mx-auto mb-8 border-b border-[#1F2925] pb-6">
              <span className="font-mono text-xs text-[#00C269] uppercase tracking-widest">
                CODEBITS NAVIGATION DECK
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full border border-[#1F2925] hover:border-[#00C269] text-slate-400 hover:text-white transition-all cursor-pointer"
                aria-label="Close Navigation Deck"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="max-w-4xl w-full mx-auto grid gap-4 flex-1">
              {navDeck.map((item, idx) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.title}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.06 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between p-6 rounded-2xl bg-[#131917] border border-[#1F2925] hover:border-[#00C269]/60 hover:bg-[#18201D] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-[#0B0F0E] border border-[#1F2925] text-[#00C269]">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-[#00C269] transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-[#00C269] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export { ScrollStackNav }
