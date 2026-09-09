'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface FacultyMember {
  name: string
  role: string
  specialty: string
  image: string
  lead?: boolean
}

const facultyMembers: FacultyMember[] = [
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

export default function FacultyAccordion() {
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Desktop Horizontal Expanding Accordion */}
      <div className="hidden md:flex gap-2.5 lg:gap-3 h-[500px] w-full">
        {facultyMembers.map((fac, idx) => {
          const isActive = activeIdx === idx
          return (
            <div
              key={fac.name}
              onClick={() => setActiveIdx(idx)}
              onMouseEnter={() => setActiveIdx(idx)}
              tabIndex={0}
              role="button"
              aria-expanded={isActive}
              aria-label={`View profile of ${fac.name}`}
              className={`relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-500 ease-out select-none focus:outline-none ${
                isActive
                  ? 'md:flex-[4] border-[var(--brand-primary,#00C269)] shadow-[0_0_35px_rgba(0,194,105,0.22)] bg-[var(--surface-elevated,#18201D)] ring-1 ring-[var(--brand-primary,#00C269)]/40'
                  : 'md:flex-1 border-[var(--border-subtle,#1F2925)] bg-[var(--surface-base,#131917)] opacity-70 hover:opacity-95 hover:border-[var(--brand-primary,#00C269)]/40'
              }`}
            >
              <div className="absolute inset-0 bg-[var(--surface-base,#131917)]">
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
                <div className="w-full h-full opacity-25 bg-[radial-gradient(var(--border-subtle,#1F2925)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              </div>

              {isActive ? (
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base,#0B0F0E)] via-[var(--bg-base,#0B0F0E)]/80 to-transparent flex flex-col justify-end p-6 z-10 transition-opacity duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[var(--brand-primary,#00C269)] uppercase tracking-wider border border-[var(--brand-primary,#00C269)]/30 bg-[var(--brand-primary,#00C269)]/10 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary,#00C269)] animate-pulse" />
                      {fac.role}
                    </span>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-black text-[var(--text-primary,#FFFFFF)] leading-tight tracking-tight">
                    {fac.name}
                  </h3>
                  <p className="text-xs lg:text-sm text-[var(--text-secondary,#94A3B8)] mt-2 font-normal leading-relaxed line-clamp-2">
                    {fac.specialty}
                  </p>
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base,#0B0F0E)]/90 via-[var(--bg-base,#0B0F0E)]/30 to-black/20 flex flex-col justify-end items-center pb-6 z-10 pointer-events-none">
                  <span className="font-mono text-xs font-semibold text-[var(--text-secondary,#94A3B8)] whitespace-nowrap [writing-mode:vertical-rl] rotate-180 tracking-widest uppercase opacity-85">
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
        {facultyMembers.map((fac, idx) => {
          const isActive = activeIdx === idx
          return (
            <div
              key={fac.name}
              onClick={() => setActiveIdx(idx)}
              className={`rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'border-[var(--brand-primary,#00C269)] shadow-[0_0_25px_rgba(0,194,105,0.2)] bg-[var(--surface-elevated,#18201D)]'
                  : 'border-[var(--border-subtle,#1F2925)] bg-[var(--surface-base,#131917)] opacity-85'
              }`}
            >
              {isActive ? (
                <div>
                  <div className="relative h-64 w-full bg-[var(--surface-base,#131917)]">
                    <Image
                      src={fac.image}
                      alt={fac.name}
                      fill
                      sizes="100vw"
                      className="object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base,#0B0F0E)] via-[var(--bg-base,#0B0F0E)]/60 to-transparent" />
                  </div>
                  <div className="p-5 relative -mt-10 z-10">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[var(--brand-primary,#00C269)] uppercase tracking-wider border border-[var(--brand-primary,#00C269)]/30 bg-[var(--brand-primary,#00C269)]/10 px-2.5 py-0.5 rounded-full mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary,#00C269)] animate-pulse" />
                      {fac.role}
                    </span>
                    <h3 className="text-xl font-bold text-[var(--text-primary,#FFFFFF)]">{fac.name}</h3>
                    <p className="text-xs text-[var(--text-secondary,#94A3B8)] mt-1.5 leading-relaxed">{fac.specialty}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3.5 p-3.5">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border-subtle,#1F2925)] bg-[var(--surface-elevated,#18201D)]">
                    <Image
                      src={fac.image}
                      alt={fac.name}
                      fill
                      sizes="48px"
                      className="object-cover object-top grayscale-[30%]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[var(--text-primary,#FFFFFF)] truncate">{fac.name}</h4>
                    <p className="text-[10px] font-mono text-[var(--brand-primary,#00C269)] truncate uppercase">{fac.role}</p>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text-secondary,#94A3B8)] px-2 py-1 rounded bg-[var(--surface-elevated,#18201D)] border border-[var(--border-subtle,#1F2925)]">
                    View
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { FacultyAccordion }
