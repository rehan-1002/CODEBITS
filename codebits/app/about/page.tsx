'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import NumberFlow from '@number-flow/react'
import { MapPin, MessageSquare, Sparkles } from 'lucide-react'
import Navbar from '@/components/navigation/Navbar'
import Footer from '@/components/ui/footer-section'

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
        <span className="inline-flex items-center gap-2 border border-[var(--border-subtle)] bg-[var(--surface-base)] px-3.5 py-1.5 rounded-full text-xs font-mono text-[var(--brand-primary)] mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          ABOUT CODEBITS / FOUNDATIONAL PEDAGOGY
        </span>

        <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
          Institutional Mentorship Built for{' '}
          <span className="bg-gradient-to-r from-white via-slate-200 to-[#00C269] bg-clip-text text-transparent">
            Mumbai University Engineering.
          </span>
        </h1>

        <p className="mt-6 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          CodeBits bridges the gap between raw university syllabus requirements and real engineering mastery. Curated under the pedagogical guidance of Prof. Rohit Falake (M.R.F).
        </p>
      </section>

      {/* STATS SECTION */}
      <section className="px-4 max-w-5xl mx-auto mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-[var(--surface-base)] border border-[var(--border-subtle)] text-center shadow-lg">
            <div className="text-5xl font-black text-[#00C269] font-mono mb-2 flex justify-center items-center">
              <NumberFlow value={250} />
              <span>+</span>
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-mono">
              Candidates Placed
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[var(--surface-base)] border border-[var(--border-subtle)] text-center shadow-lg">
            <div className="text-5xl font-black text-[#00C269] font-mono mb-2 flex justify-center items-center">
              <NumberFlow value={15} />
              <span>+</span>
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-mono">
              Hiring Partners
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[var(--surface-base)] border border-[var(--border-subtle)] text-center shadow-lg">
            <div className="text-5xl font-black text-[#00C269] font-mono mb-2 flex justify-center items-center">
              <NumberFlow value={8} />
              <span className="text-3xl ml-1 text-[#34EE99]">LPA</span>
            </div>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-mono">
              Average Package
            </p>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="py-4 border-y border-[#1F2925] bg-[#131917]/50 overflow-hidden whitespace-nowrap mb-20">
        <div className="flex items-center gap-10 text-xs sm:text-sm font-mono text-[#00C269] tracking-widest uppercase animate-pulse">
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
          <span className="font-mono text-xs text-[#00C269] uppercase tracking-widest block mb-2">
            Pillars of CodeBits
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
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
                    ? 'md:flex-[3] border-[#00C269] shadow-[0_0_30px_rgba(0,194,105,0.2)] bg-[#18201D]'
                    : 'md:flex-1 border-[#1F2925] bg-[#131917] opacity-75 hover:opacity-100'
                }`}
              >
                {/* Fallback pattern */}
                <div className="absolute inset-0 bg-[#131917]">
                  <Image
                    src={fac.image}
                    alt={fac.name}
                    fill
                    sizes="(max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-top"
                  />
                  <div className="w-full h-full opacity-40 bg-[radial-gradient(#1F2925_1px,transparent_1px)] [background-size:16px_16px]" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F0E] via-[#0B0F0E]/60 to-transparent flex flex-col justify-end p-6 z-10">
                  <span className="font-mono text-[10px] sm:text-xs text-[#34EE99] tracking-wider mb-1">
                    {fac.role}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                    {fac.name}
                  </h3>
                  {isActive && (
                    <p className="text-xs sm:text-sm text-slate-300 mt-2 font-normal line-clamp-2">
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
      <section className="px-4 max-w-5xl mx-auto border-t border-[#1F2925] pt-20">
        <div className="text-center mb-12">
          <span className="font-mono text-xs text-[#00C269] uppercase tracking-widest block mb-2">
            OFFLINE FOOTPRINT
          </span>
          <h2 className="text-3xl font-extrabold text-white">Academic Training Centers</h2>
          <p className="text-sm text-slate-400 mt-2">
            Classroom coaching and examination prep centers in the Central Suburbs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* KALYAN WEST */}
          <div className="p-8 rounded-2xl bg-[#131917] border border-[#1F2925] flex flex-col justify-between hover:border-[#00C269]/40 transition-all">
            <div>
              <div className="flex items-center gap-2 text-[#00C269] font-mono text-xs mb-3">
                <MapPin className="w-4 h-4" />
                KALYAN WEST CENTER
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Chandulal Joshi Complex</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Opposite Kalyan Railway Station, Above Hotel Ramdev, Kalyan West, Maharashtra 421301.
              </p>
            </div>

            <a
              href="https://wa.me/919372768854?text=Hi%20CodeBits%2C%20I%20want%20to%20inquire%20about%20Kalyan%20batches"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 bg-[#00C269] hover:bg-[#009E52] text-[#0B0F0E] font-bold py-3 px-6 rounded-xl text-xs transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp Kalyan Desk
            </a>
          </div>

          {/* ULHASNAGAR */}
          <div className="p-8 rounded-2xl bg-[#131917] border border-[#1F2925] flex flex-col justify-between hover:border-[#00C269]/40 transition-all">
            <div>
              <div className="flex items-center gap-2 text-[#00C269] font-mono text-xs mb-3">
                <MapPin className="w-4 h-4" />
                ULHASNAGAR CENTER
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Hari Narayan Complex</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Shivaji Chowk, Near Central Hospital Road, Ulhasnagar, Maharashtra 421003.
              </p>
            </div>

            <a
              href="https://wa.me/919372768854?text=Hi%20CodeBits%2C%20I%20want%20to%20inquire%20about%20Ulhasnagar%20batches"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 bg-[#00C269] hover:bg-[#009E52] text-[#0B0F0E] font-bold py-3 px-6 rounded-xl text-xs transition-all"
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
