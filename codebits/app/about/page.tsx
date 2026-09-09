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
    image: '/FACULTY/Prof. Rohit Falake (M.R.F).webp',
    lead: true,
  },
  {
    name: 'Prof. Bharat Acharya',
    role: 'SENIOR COMPUTING MENTOR',
    specialty: 'Data Structures, Microprocessors, System Architecture',
    image: '/FACULTY/Prof. Bharat Acharya.webp',
  },
  {
    name: 'Prof. Om Baviskar',
    role: 'TECHNICAL LEAD MENTOR',
    specialty: 'Network Architectures, Communication Systems, Cybersecurity',
    image: '/FACULTY/Prof. Om Baviskar.webp',
  },
  {
    name: 'Prof. Prashant Patil',
    role: 'FACULTY MENTOR',
    specialty: 'Database Systems, Distributed Architectures, Operating Systems',
    image: '/FACULTY/Prof. Prashant Patil.webp',
  },
  {
    name: 'Prof. Sameer Velenkar',
    role: 'SENIOR CS/IT MENTOR',
    specialty: 'Digital Electronics, Circuit Theory, Python & Automata Theory',
    image: '/FACULTY/Prof. Sameer Velenkar.webp',
  },
  {
    name: 'Prof. Sunil Jadhav',
    role: 'ACADEMIC MENTOR',
    specialty: 'Data Structures, Algorithms & Object-Oriented Programming',
    image: '/FACULTY/Prof. Sunil Jadhav.webp',
  },
  {
    name: 'Prof. Sunil Nagare',
    role: 'SENIOR FACULTY MENTOR',
    specialty: 'Theoretical Computer Science, Applied Sciences & Compiler Design',
    image: '/FACULTY/Prof. Sunil Nagare.webp',
  },
  {
    name: 'Prof. Vineet Kutty',
    role: 'ENGINEERING MENTOR',
    specialty: 'Engineering Mechanics, CAD Graphics & Embedded Technologies',
    image: '/FACULTY/Prof. Vineet Kutty.webp',
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
      <section className="px-4 max-w-7xl mx-auto mb-28">
        <div className="text-center mb-12">
          <span className="font-mono text-xs text-[var(--brand-primary)] uppercase tracking-widest block mb-2">
            Pillars of CodeBits
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
            Faculty &amp; Mentorship Directory
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-2xl mx-auto">
            Curated under the pedagogical leadership and domain expertise of senior Mumbai University engineering educators.
          </p>
        </div>

        {/* Desktop & Tablet Horizontal Expanding Accordion */}
        <div className="hidden md:flex gap-2.5 lg:gap-3 h-[500px] w-full">
          {facultyList.map((fac, idx) => {
            const isActive = activeAccordion === idx
            return (
              <div
                key={fac.name}
                onClick={() => setActiveAccordion(idx)}
                onMouseEnter={() => setActiveAccordion(idx)}
                tabIndex={0}
                role="button"
                aria-expanded={isActive}
                aria-label={`View profile of ${fac.name}`}
                className={`relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-500 ease-out select-none focus:outline-none ${
                  isActive
                    ? 'md:flex-[4] border-[var(--brand-primary)] shadow-[0_0_35px_rgba(0,194,105,0.22)] bg-[var(--surface-elevated)] ring-1 ring-[var(--brand-primary)]/40'
                    : 'md:flex-1 border-[var(--border-subtle)] bg-[var(--surface-base)] opacity-70 hover:opacity-95 hover:border-[var(--brand-primary)]/40'
                }`}
              >
                {/* Portrait Image Container */}
                <div className="absolute inset-0 bg-[var(--surface-base)]">
                  <Image
                    src={fac.image}
                    alt={fac.name}
                    fill
                    sizes="(max-width: 1200px) 40vw, 25vw"
                    className={`object-cover object-top transition-transform duration-700 ${
                      isActive ? 'scale-105 grayscale-0' : 'scale-100 grayscale-[35%]'
                    }`}
                    priority={idx < 3}
                  />
                  <div className="w-full h-full opacity-25 bg-[radial-gradient(var(--border-subtle)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                </div>

                {/* Active Expanded Overlay */}
                {isActive ? (
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/80 to-transparent flex flex-col justify-end p-6 z-10 transition-opacity duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[var(--brand-primary)] uppercase tracking-wider border border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/10 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />
                        {fac.role}
                      </span>
                    </div>
                    <h3 className="text-xl lg:text-2xl font-black text-[var(--text-primary)] leading-tight tracking-tight">
                      {fac.name}
                    </h3>
                    <p className="text-xs lg:text-sm text-[var(--text-secondary)] mt-2 font-normal leading-relaxed line-clamp-2">
                      {fac.specialty}
                    </p>
                  </div>
                ) : (
                  /* Collapsed Vertical Indicator */
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)]/90 via-[var(--bg-base)]/30 to-black/20 flex flex-col justify-end items-center pb-6 z-10 pointer-events-none">
                    <span className="font-mono text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap [writing-mode:vertical-rl] rotate-180 tracking-widest uppercase opacity-85">
                      {fac.name.replace('Prof. ', '')}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile Stacked Touch Accordion */}
        <div className="flex flex-col gap-3 md:hidden">
          {facultyList.map((fac, idx) => {
            const isActive = activeAccordion === idx
            return (
              <div
                key={fac.name}
                onClick={() => setActiveAccordion(idx)}
                className={`rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'border-[var(--brand-primary)] shadow-[0_0_25px_rgba(0,194,105,0.2)] bg-[var(--surface-elevated)]'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-base)] opacity-85'
                }`}
              >
                {isActive ? (
                  <div>
                    <div className="relative h-64 w-full bg-[var(--surface-base)]">
                      <Image
                        src={fac.image}
                        alt={fac.name}
                        fill
                        sizes="100vw"
                        className="object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/60 to-transparent" />
                    </div>
                    <div className="p-5 relative -mt-10 z-10">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[var(--brand-primary)] uppercase tracking-wider border border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/10 px-2.5 py-0.5 rounded-full mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />
                        {fac.role}
                      </span>
                      <h3 className="text-xl font-bold text-[var(--text-primary)]">{fac.name}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">{fac.specialty}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3.5 p-3.5">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
                      <Image
                        src={fac.image}
                        alt={fac.name}
                        fill
                        sizes="48px"
                        className="object-cover object-top grayscale-[30%]"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">{fac.name}</h4>
                      <p className="text-[10px] font-mono text-[var(--brand-primary)] truncate uppercase">{fac.role}</p>
                    </div>
                    <span className="text-[11px] font-mono text-[var(--text-secondary)] px-2 py-1 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                      View
                    </span>
                  </div>
                )}
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
