'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BookOpen, ShieldCheck, Cpu } from 'lucide-react'
import { Skiper19 } from '@/components/sections/Skiper19'
import ScrollFloat from '@/components/sections/ScrollFloat'
import ScrollStackNav from '@/components/navigation/ScrollStackNav'
import Footer from '@/components/ui/footer-section'

export default function HomePage() {
  return (
    <div className="bg-[#0B0F0E] text-[#F8FAFC] min-h-screen">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-[#1F2925] bg-[#0B0F0E]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image src="/LOGO CB.png" alt="CodeBits" fill className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-tight leading-none">CodeBits</span>
              <span className="text-[10px] font-mono text-[#00C269] tracking-wider">BY PROF. MRF</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/vault"
              className="bg-[#00C269] hover:bg-[#009E52] text-[#0B0F0E] font-bold text-xs px-4 py-2 rounded-lg transition-all"
            >
              ACCESS VAULT
            </Link>
            <ScrollStackNav />
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-28 pb-16 px-4 max-w-5xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 border border-[#1F2925] bg-[#131917] px-4 py-1.5 rounded-full text-xs font-mono text-[#00C269] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#00C269] animate-pulse" />
          MUMBAI UNIVERSITY REV-2019 'C' SCHEME
        </div>

        <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-[1.08] max-w-4xl">
          Let us build the bridge between your{' '}
          <span className="bg-gradient-to-r from-white via-slate-200 to-[#00C269] bg-clip-text text-transparent">
            career and dream.
          </span>
        </h1>

        <p className="mt-6 text-slate-400 max-w-2xl text-base sm:text-lg leading-relaxed">
          Centralized, controlled academic repository providing authenticated access to Mumbai University question papers, faculty-vetted lecture notes, and verified examination solutions.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            href="/vault"
            className="flex items-center gap-2 bg-[#00C269] hover:bg-[#009E52] text-[#0B0F0E] font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(0,194,105,0.25)] hover:shadow-[0_0_30px_rgba(0,194,105,0.4)]"
          >
            Access Academic Vault
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/about"
            className="border border-[#1F2925] hover:border-[#00C269]/60 bg-[#131917] text-slate-200 px-8 py-3.5 rounded-xl text-sm transition-all"
          >
            About &amp; Faculty
          </Link>
        </div>
      </section>

      {/* KINETIC SVG SCROLL ENGINE */}
      <Skiper19 />

      {/* PIPELINE GRID */}
      <section className="py-24 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-mono text-xs text-[#00C269] uppercase tracking-widest block mb-2">
            The CodeBits Standard
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Engineered for Academic Rigor
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#131917] border border-[#1F2925] hover:border-[#00C269]/40 p-8 rounded-2xl transition-all">
            <BookOpen className="w-8 h-8 text-[#00C269] mb-6" />
            <span className="font-mono text-xs text-slate-500 block mb-2">01 / VALIDATION</span>
            <h3 className="text-xl font-bold mb-3 text-white">Syllabus Verification</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every paper and note is indexed strictly under the active Rev-2019 'C' Scheme, eliminating curriculum mismatch.
            </p>
          </div>

          <div className="bg-[#131917] border border-[#1F2925] hover:border-[#00C269]/40 p-8 rounded-2xl transition-all">
            <ShieldCheck className="w-8 h-8 text-[#00C269] mb-6" />
            <span className="font-mono text-xs text-slate-500 block mb-2">02 / PROTECTION</span>
            <h3 className="text-xl font-bold mb-3 text-white">Protected Canvas DRM</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Documents are rendered via HTML5 canvas with forensic user watermarking and single-device session locking.
            </p>
          </div>

          <div className="bg-[#131917] border border-[#1F2925] hover:border-[#00C269]/40 p-8 rounded-2xl transition-all">
            <Cpu className="w-8 h-8 text-[#00C269] mb-6" />
            <span className="font-mono text-xs text-slate-500 block mb-2">03 / RETRIEVAL</span>
            <h3 className="text-xl font-bold mb-3 text-white">cbAI Discovery</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Natural language search parsed by Gemini Flash into instant database filters with zero hallucination fallback.
            </p>
          </div>
        </div>
      </section>

      {/* CLIMAX: GSAP SCROLLFLOAT + MONOGRAM */}
      <section className="py-32 px-4 flex flex-col items-center justify-center text-center bg-[#0B0F0E]">
        <div className="relative w-24 h-24 mb-6">
          <Image
            src="/LOGO CB.png"
            alt="CodeBits Monogram"
            fill
            className="object-contain drop-shadow-[0_0_30px_rgba(0,194,105,0.45)]"
          />
        </div>

        <ScrollFloat
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="top bottom-=20%"
          scrollEnd="bottom center"
          containerClassName="my-4"
          textClassName="text-white tracking-[0.25em] font-black uppercase text-[12vw] sm:text-[9vw]"
        >
          CODEBITS
        </ScrollFloat>

        <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-xl mb-8">
          Curated specifically for Mumbai University engineering departments under Rev-2019 'C' Scheme.
        </p>

        <Link
          href="/vault"
          className="bg-[#00C269] hover:bg-[#009E52] text-[#0B0F0E] font-bold px-10 py-4 rounded-xl text-sm transition-all shadow-[0_0_25px_rgba(0,194,105,0.3)] hover:scale-105"
        >
          CONTINUE TO RESOURCES
        </Link>
      </section>

      <Footer />
    </div>
  )
}
