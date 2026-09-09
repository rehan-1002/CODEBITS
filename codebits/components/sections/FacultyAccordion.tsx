'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface FacultyMember {
  name: string
  specialty: string
  image: string
  lead?: boolean
}

const facultyMembers: FacultyMember[] = [
  {
    name: 'Prof. Rohit Falake (M.R.F)',
    specialty: 'Engineering Mathematics',
    image: '/FACULTY/Prof. Rohit Falake (M.R.F).webp',
    lead: true,
  },
  {
    name: 'Prof. Om Baviskar',
    specialty: 'Basic Electrical Engineering',
    image: '/FACULTY/Prof. Om Baviskar.webp',
  },
  {
    name: 'Prof. Bharat Acharya',
    specialty: 'C Programming',
    image: '/FACULTY/Prof. Bharat Acharya.webp',
  },
  {
    name: 'Prof. Sameer Velenkar',
    specialty: 'Python Programming',
    image: '/FACULTY/Prof. Sameer Velenkar.webp',
  },
  {
    name: 'Prof. Prashant Patil',
    specialty: 'Applied Chemistry',
    image: '/FACULTY/Prof. Prashant Patil.webp',
  },
  {
    name: 'Prof. Sunil Nagare',
    specialty: 'Engineering Chemistry',
    image: '/FACULTY/Prof. Sunil Nagare.webp',
  },
  {
    name: 'Prof. Vineet Kutty',
    specialty: 'Engineering Mechanics & Engineering Drawing',
    image: '/FACULTY/Prof. Vineet Kutty.webp',
  },
  {
    name: 'Prof. Rahul Jadhav',
    specialty: 'Applied Physics',
    image: '/FACULTY/Prof. Sunil Jadhav.webp',
  },
]

export default function FacultyAccordion() {
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Desktop Horizontal Expanding Accordion */}
      <div className="hidden md:flex gap-2.5 lg:gap-3 h-[520px] w-full">
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
              className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-500 ease-out select-none focus:outline-none ${
                isActive
                  ? 'md:flex-[4] border-[var(--brand-primary,#00C269)] shadow-[0_0_35px_rgba(0,194,105,0.25)] ring-1 ring-[var(--brand-primary,#00C269)]/50'
                  : 'md:flex-1 border-[var(--border-subtle,#1F2925)] hover:border-[var(--brand-primary,#00C269)]/60'
              }`}
            >
              {/* Studio Backdrop Container */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#192420] via-[#101815] to-[#0A0E0D]">
                {/* Background Grid Pattern - behind the image */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* Faculty Portrait Image */}
                <Image
                  src={fac.image}
                  alt={fac.name}
                  fill
                  sizes="(max-width: 1200px) 45vw, 30vw"
                  className={`object-cover object-top transition-all duration-700 contrast-[1.06] ${
                    isActive
                      ? 'scale-105 brightness-105'
                      : 'scale-100 brightness-95 opacity-90 group-hover:opacity-100 group-hover:scale-[1.02]'
                  }`}
                  priority={idx < 3}
                />
              </div>

              {/* Active Expanded Overlay */}
              {isActive ? (
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 via-35% to-transparent flex flex-col justify-end p-6 z-10 transition-opacity duration-300">
                  <h3 className="text-xl lg:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {fac.name}
                  </h3>
                  <p className="text-xs lg:text-sm text-[var(--brand-primary,#00C269)] mt-1.5 font-medium tracking-wide leading-relaxed line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {fac.specialty}
                  </p>
                </div>
              ) : (
                /* Collapsed Vertical Indicator */
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 via-35% to-transparent flex flex-col justify-end items-center pb-6 z-10 pointer-events-none">
                  <span className="font-mono text-xs font-semibold text-zinc-200 group-hover:text-white whitespace-nowrap [writing-mode:vertical-rl] rotate-180 tracking-widest uppercase transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
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
                  ? 'border-[var(--brand-primary,#00C269)] shadow-[0_0_25px_rgba(0,194,105,0.2)] ring-1 ring-[var(--brand-primary,#00C269)]/40'
                  : 'border-[var(--border-subtle,#1F2925)] bg-[var(--surface-base,#131917)]'
              }`}
            >
              {isActive ? (
                <div>
                  <div className="relative h-72 w-full bg-gradient-to-b from-[#192420] via-[#101815] to-[#0A0E0D]">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                    <Image
                      src={fac.image}
                      alt={fac.name}
                      fill
                      sizes="100vw"
                      className="object-cover object-top contrast-[1.06] brightness-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E0D] via-[#0A0E0D]/70 via-40% to-transparent" />
                  </div>
                  <div className="p-5 relative -mt-12 z-10">
                    <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{fac.name}</h3>
                    <p className="text-xs text-[var(--brand-primary,#00C269)] font-medium mt-1 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{fac.specialty}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3.5 p-3.5 bg-[var(--surface-base,#131917)]">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border-subtle,#1F2925)] bg-[#101815]">
                    <Image
                      src={fac.image}
                      alt={fac.name}
                      fill
                      sizes="48px"
                      className="object-cover object-top contrast-[1.06]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[var(--text-primary,#FFFFFF)] truncate">{fac.name}</h4>
                    <p className="text-[11px] font-medium text-[var(--brand-primary,#00C269)] truncate">{fac.specialty}</p>
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

