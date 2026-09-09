'use client'

import React, { useState, useEffect, useRef } from 'react'
import NumberFlow, { NumberFlowGroup } from '@number-flow/react'
import { useInView } from 'framer-motion'
import { MapPin, MessageSquare } from 'lucide-react'
import Navbar from '@/components/navigation/Navbar'
import Footer from '@/components/ui/footer-section'
import TextBlockAnimation from '@/components/ui/TextBlockAnimation'
import PathDrawingText from '@/components/ui/PathDrawingText'
import FacultyAccordion from '@/components/sections/FacultyAccordion'
import TextMarquee from '@/components/ui/text-marquee'
import ShineBorder from '@/components/ui/shine-border'

export default function AboutPage() {
  const statsRef = useRef<HTMLDivElement>(null)
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.25 })
  const [stats, setStats] = useState({ placed: 0, partners: 0, lpa: 0 })

  useEffect(() => {
    if (isStatsInView) {
      const timer = setTimeout(() => {
        setStats({ placed: 250, partners: 15, lpa: 8 })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isStatsInView])

  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-primary)] min-h-screen pb-24 transition-colors duration-200">
      <Navbar />

      {/* HERO */}
      <section className="pt-24 sm:pt-28 pb-12 px-4 sm:px-8 md:px-12 lg:px-16 w-full text-left">
        <div className="flex flex-col items-start justify-start text-left w-full">
          <TextBlockAnimation blockColor="#00C269" duration={0.6} stagger={0.1} className="w-full">
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[var(--text-secondary)] text-left leading-[1.05]">
              Institutional Mentorship Built for
            </h2>
          </TextBlockAnimation>

          {/* MUMBAI UNIVERSITY Path Drawing Hero */}
          <PathDrawingText text="MUMBAI UNIVERSITY" align="left" className="w-full" />

          <TextBlockAnimation blockColor="#00C269" duration={0.6} delay={0.15} className="w-full">
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-[var(--text-primary)] text-left leading-[1.05]">
              Engineering.
            </h2>
          </TextBlockAnimation>
        </div>
      </section>

      {/* STATS SECTION - Clean Borderless NumberFlow */}
      <section
        ref={statsRef}
        className="px-4 sm:px-8 md:px-12 lg:px-16 w-full mb-24"
      >
        <NumberFlowGroup>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 pt-8 border-t border-[var(--border-subtle)]">
            {/* Stat 1: Candidates Placed */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-5xl sm:text-6xl md:text-7xl font-black text-[var(--brand-primary)] font-mono tracking-tight flex items-center justify-center text-center">
                <NumberFlow
                  value={stats.placed}
                  suffix="+"
                  trend={1}
                  spinTiming={{ duration: 1300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  opacityTiming={{ duration: 400, easing: 'ease-out' }}
                />
              </div>
              <p className="text-[var(--text-secondary)] text-xs sm:text-sm uppercase tracking-widest font-mono font-medium mt-3 text-center">
                Candidates Placed
              </p>
            </div>

            {/* Stat 2: Hiring Partners */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-5xl sm:text-6xl md:text-7xl font-black text-[var(--brand-primary)] font-mono tracking-tight flex items-center justify-center text-center">
                <NumberFlow
                  value={stats.partners}
                  suffix="+"
                  trend={1}
                  spinTiming={{ duration: 1100, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  opacityTiming={{ duration: 400, easing: 'ease-out' }}
                />
              </div>
              <p className="text-[var(--text-secondary)] text-xs sm:text-sm uppercase tracking-widest font-mono font-medium mt-3 text-center">
                Hiring Partners
              </p>
            </div>

            {/* Stat 3: Average Package */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-5xl sm:text-6xl md:text-7xl font-black text-[var(--brand-primary)] font-mono tracking-tight flex items-center justify-center text-center">
                <NumberFlow
                  value={stats.lpa}
                  suffix=" LPA"
                  trend={1}
                  spinTiming={{ duration: 1000, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  opacityTiming={{ duration: 400, easing: 'ease-out' }}
                />
              </div>
              <p className="text-[var(--text-secondary)] text-xs sm:text-sm uppercase tracking-widest font-mono font-medium mt-3 text-center">
                Average Package
              </p>
            </div>
          </div>
        </NumberFlowGroup>
      </section>

      {/* 21ST.DEV / UI-LAYOUTS TEXT MARQUEE */}
      <TextMarquee text1="MEET THE TEAM" text2="PILLARS OF CODEBITS" />

      {/* FACULTY ACCORDION */}
      <section className="px-4 max-w-7xl mx-auto mb-28">
        <FacultyAccordion />
      </section>

      {/* TRAINING CENTERS - Liquid Glass Offline Hubs */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-16 max-w-7xl mx-auto border-t border-[var(--border-subtle)] pt-20 pb-16">
        <div className="text-center mb-14">
          <span className="font-mono text-xs text-[var(--brand-primary)] uppercase tracking-widest block mb-2 font-semibold">
            OFFLINE HUBS
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Learn In Person
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-3 max-w-xl mx-auto font-normal">
            Real classrooms. Live mentors. Right by the station.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* KALYAN WEST - Liquid Glass Card with Magic UI Shine Border */}
          <div className="relative group rounded-3xl overflow-hidden p-7 sm:p-9 flex flex-col justify-between backdrop-blur-2xl bg-white/75 dark:bg-[#0E1512]/80 border border-black/5 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,194,105,0.14)] hover:shadow-[0_12px_45px_0_rgba(0,194,105,0.3)] transition-all duration-500 hover:scale-[1.015]">
            <ShineBorder
              borderWidth={2}
              duration={10}
              shineColor={["#00C269", "#34EE99", "#A6FFD2"]}
            />

            {/* Top Liquid Specular Glare */}
            <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-3xl bg-gradient-to-b from-white/35 dark:from-white/10 via-white/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] font-mono text-xs tracking-wider uppercase font-semibold mb-4 backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                KALYAN WEST CENTER
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-3 tracking-tight">
                Chandulal Joshi Complex
              </h3>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed font-normal">
                Opposite Kalyan Railway Station, Above Hotel Ramdev, Kalyan West, Maharashtra 421301.
              </p>
            </div>

            <a
              href="https://wa.me/919372768854?text=Hi%20CodeBits%2C%20I%20want%20to%20inquire%20about%20Kalyan%20batches"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 relative z-10 inline-flex items-center justify-center gap-2.5 bg-[var(--brand-primary,#00C269)] hover:bg-[var(--brand-ambient,#34EE99)] text-[#0B0F0E] font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider font-mono transition-all duration-300 shadow-[0_0_22px_rgba(0,194,105,0.35)] hover:shadow-[0_0_32px_rgba(0,194,105,0.65)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp Kalyan Desk
            </a>
          </div>

          {/* ULHASNAGAR - Liquid Glass Card with Magic UI Shine Border */}
          <div className="relative group rounded-3xl overflow-hidden p-7 sm:p-9 flex flex-col justify-between backdrop-blur-2xl bg-white/75 dark:bg-[#0E1512]/80 border border-black/5 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,194,105,0.14)] hover:shadow-[0_12px_45px_0_rgba(0,194,105,0.3)] transition-all duration-500 hover:scale-[1.015]">
            <ShineBorder
              borderWidth={2}
              duration={10}
              shineColor={["#00C269", "#34EE99", "#A6FFD2"]}
            />

            {/* Top Liquid Specular Glare */}
            <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-3xl bg-gradient-to-b from-white/35 dark:from-white/10 via-white/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 text-[var(--brand-primary)] font-mono text-xs tracking-wider uppercase font-semibold mb-4 backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                ULHASNAGAR CENTER
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-3 tracking-tight">
                Hari Narayan Complex
              </h3>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed font-normal">
                Shivaji Chowk, Near Central Hospital Road, Ulhasnagar, Maharashtra 421003.
              </p>
            </div>

            <a
              href="https://wa.me/919372768854?text=Hi%20CodeBits%2C%20I%20want%20to%20inquire%20about%20Ulhasnagar%20batches"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 relative z-10 inline-flex items-center justify-center gap-2.5 bg-[var(--brand-primary,#00C269)] hover:bg-[var(--brand-ambient,#34EE99)] text-[#0B0F0E] font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider font-mono transition-all duration-300 shadow-[0_0_22px_rgba(0,194,105,0.35)] hover:shadow-[0_0_32px_rgba(0,194,105,0.65)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp Ulhasnagar Desk
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
