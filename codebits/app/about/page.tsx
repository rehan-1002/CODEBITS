'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import NumberFlow from '@number-flow/react'
import { MapPin, MessageSquare } from 'lucide-react'
import Navbar from '@/components/navigation/Navbar'
import Footer from '@/components/ui/footer-section'
import TextBlockAnimation from '@/components/ui/TextBlockAnimation'
import PathDrawingText from '@/components/ui/PathDrawingText'

const facultyList = [
  {
    name: 'Prof. Rohit Falake (M.R.F)',
    role: 'FOUNDER & HEAD OF PEDAGOGY',
    specialty: 'Applied Mathematics, Discrete Mathematics, Computational Logic',
    image: '/faculty/Prof. Rohit Falake (M.R.F).webp',
  },
  {
    name: 'Prof. Bharat Acharya',
    role: 'SENIOR COMPUTING MENTOR',
    specialty: 'Data Structures, Algorithms, System Architecture',
    image: '/faculty/Prof. Bharat Acharya.webp',
  },
  {
    name: 'Prof. Om Baviskar',
    role: 'TECHNICAL LEAD MENTOR',
    specialty: 'Full-Stack Engineering, Cloud Systems, Database Management',
    image: '/faculty/Prof. Om Baviskar.webp',
  },
  {
    name: 'Prof. Prashant Patil',
    role: 'FACULTY MENTOR',
    specialty: 'Operating Systems, Microprocessors, Computer Networks',
    image: '/faculty/Prof. Prashant Patil.webp',
  },
  {
    name: 'Prof. Sunil Jadhav',
    role: 'ACADEMIC MENTOR',
    specialty: 'Object-Oriented Programming, Software Engineering',
    image: '/faculty/Prof. Sunil Jadhav.webp',
  },
]

export default function AboutPage() {
  const [activeAccordion, setActiveAccordion] = useState(0)

  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-primary)] min-h-screen pb-24 transition-colors duration-200">
      <Navbar />

      {/* HERO */}
      <section className="pt-28 pb-16 px-4 max-w-5xl mx-auto text-center">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          <TextBlockAnimation blockColor="#00C269" duration={0.6} stagger={0.1}>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-secondary)]">
              Institutional Mentorship Built for
            </h2>
          </TextBlockAnimation>

          {/* MUMBAI UNIVERSITY Path Drawing Hero */}
          <PathDrawingText text="MUMBAI UNIVERSITY" />

          <TextBlockAnimation blockColor="#00C269" duration={0.6} delay={0.15}>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Engineering.
            </h2>
          </TextBlockAnimation>
        </div>

        <TextBlockAnimation blockColor="#00C269" delay={0.25} duration={0.55} stagger={0.08}>
          <p className="mt-8 text-[var(--text-secondary)] max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            CodeBits bridges the gap between raw university syllabus requirements and real engineering mastery. Curated under the pedagogical guidance of Prof. Rohit Falake (M.R.F).
          </p>
        </TextBlockAnimation>
      </section>

      {/* STATS SECTION */}
      <section className="px-4 max-w-5xl mx-auto mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-[var(--surface-base)] border border-[var(--border-subtle)] text-center shadow-lg">
            <div className="text-5xl font-black text-[var(--brand-primary)] font-mono mb-2 flex justify-center items-center">
              <NumberFlow value={250} />
              <span>+</span>
            </div>
            <p className="text-[var(--text-secondary)] text-xs uppercase tracking-widest font-mono">
              Candidates Placed
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[var(--surface-base)] border border-[var(--border-subtle)] text-center shadow-lg">
            <div className="text-5xl font-black text-[var(--brand-primary)] font-mono mb-2 flex justify-center items-center">
              <NumberFlow value={15} />
              <span>+</span>
            </div>
            <p className="text-[var(--text-secondary)] text-xs uppercase tracking-widest font-mono">
              Hiring Partners
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[var(--surface-base)] border border-[var(--border-subtle)] text-center shadow-lg">
            <div className="text-5xl font-black text-[var(--brand-primary)] font-mono mb-2 flex justify-center items-center">
              <NumberFlow value={8} />
              <span className="text-3xl ml-1 text-[var(--brand-ambient)]">LPA</span>
            </div>
            <p className="text-[var(--text-secondary)] text-xs uppercase tracking-widest font-mono">
              Average Package
            </p>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="py-4 border-y border-[var(--border-subtle)] bg-[var(--surface-base)]/50 overflow-hidden whitespace-nowrap mb-20">
        <div className="flex items-center gap-10 text-xs sm:text-sm font-mono text-[var(--brand-primary)] tracking-widest uppercase animate-pulse">
          <span>MEET THE TEAM</span>
          <span>•</span>
          <span>PILLARS OF CODEBITS</span>
          <span>•</span>
          <span>MUMBAI UNIVERSITY FACULTY</span>
          <span>•</span>
          <span>APPLIED MATHEMATICS &amp; COMPUTING</span>
          <span>•</span>
          <span>MEET THE TEAM</span>
          <span>•</span>
          <span>PILLARS OF CODEBITS</span>
        </div>
      </div>

      {/* FACULTY ACCORDION */}
      <section className="px-4 max-w-6xl mx-auto mb-28">
        <div className="text-center mb-12">
          <span className="font-mono text-xs text-[var(--brand-primary)] uppercase tracking-widest block mb-2">
            Pillars of CodeBits
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
            Faculty &amp; Mentorship Directory
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[460px]">
          {facultyList.map((fac, idx) => {
            const isActive = activeAccordion === idx
            return (
              <div
                key={fac.name}
                onClick={() => setActiveAccordion(idx)}
                onMouseEnter={() => setActiveAccordion(idx)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-500 min-h-[320px] md:min-h-0 ${
                  isActive
                    ? 'md:flex-[3] border-[var(--brand-primary)] shadow-[0_0_30px_rgba(0,194,105,0.2)] bg-[var(--surface-elevated)]'
                    : 'md:flex-1 border-[var(--border-subtle)] bg-[var(--surface-base)] opacity-75 hover:opacity-100'
                }`}
              >
                {/* Fallback pattern */}
                <div className="absolute inset-0 bg-[var(--surface-base)]">
                  <Image
                    src={fac.image}
                    alt={fac.name}
                    fill
                    sizes="(max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-top"
                  />
                  <div className="w-full h-full opacity-30 bg-[radial-gradient(var(--border-subtle)_1px,transparent_1px)] [background-size:16px_16px]" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/70 to-transparent flex flex-col justify-end p-6 z-10">
                  <span className="font-mono text-[10px] sm:text-xs text-[var(--brand-ambient)] tracking-wider mb-1">
                    {fac.role}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-tight">
                    {fac.name}
                  </h3>
                  {isActive && (
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 font-normal line-clamp-2">
                      {fac.specialty}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* TRAINING CENTERS */}
      <section className="px-4 max-w-5xl mx-auto border-t border-[var(--border-subtle)] pt-20">
        <div className="text-center mb-12">
          <span className="font-mono text-xs text-[var(--brand-primary)] uppercase tracking-widest block mb-2">
            OFFLINE FOOTPRINT
          </span>
          <h2 className="text-3xl font-extrabold text-[var(--text-primary)]">Academic Training Centers</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Classroom coaching and examination prep centers in the Central Suburbs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* KALYAN WEST */}
          <div className="p-8 rounded-2xl bg-[var(--surface-base)] border border-[var(--border-subtle)] flex flex-col justify-between hover:border-[var(--brand-primary)]/40 transition-all shadow-md">
            <div>
              <div className="flex items-center gap-2 text-[var(--brand-primary)] font-mono text-xs mb-3">
                <MapPin className="w-4 h-4" />
                KALYAN WEST CENTER
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Chandulal Joshi Complex</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Opposite Kalyan Railway Station, Above Hotel Ramdev, Kalyan West, Maharashtra 421301.
              </p>
            </div>

            <a
              href="https://wa.me/919372768854?text=Hi%20CodeBits%2C%20I%20want%20to%20inquire%20about%20Kalyan%20batches"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 bg-[#00C269] hover:bg-[#009E52] text-[#0B0F0E] font-bold py-3 px-6 rounded-xl text-xs transition-all shadow-md hover:scale-[1.02]"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp Kalyan Desk
            </a>
          </div>

          {/* ULHASNAGAR */}
          <div className="p-8 rounded-2xl bg-[var(--surface-base)] border border-[var(--border-subtle)] flex flex-col justify-between hover:border-[var(--brand-primary)]/40 transition-all shadow-md">
            <div>
              <div className="flex items-center gap-2 text-[var(--brand-primary)] font-mono text-xs mb-3">
                <MapPin className="w-4 h-4" />
                ULHASNAGAR CENTER
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Hari Narayan Complex</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                Shivaji Chowk, Near Central Hospital Road, Ulhasnagar, Maharashtra 421003.
              </p>
            </div>

            <a
              href="https://wa.me/919372768854?text=Hi%20CodeBits%2C%20I%20want%20to%20inquire%20about%20Ulhasnagar%20batches"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 bg-[#00C269] hover:bg-[#009E52] text-[#0B0F0E] font-bold py-3 px-6 rounded-xl text-xs transition-all shadow-md hover:scale-[1.02]"
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
