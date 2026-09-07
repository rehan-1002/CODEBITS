'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export function Skiper19() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const pathLength = useTransform(scrollYProgress, [0, 0.85], [0.05, 1])

  const opacity1 = useTransform(scrollYProgress, [0.12, 0.28, 0.42], [0, 1, 0])
  const y1 = useTransform(scrollYProgress, [0.12, 0.28], [24, 0])

  const opacity2 = useTransform(scrollYProgress, [0.45, 0.62, 0.82], [0, 1, 0])
  const y2 = useTransform(scrollYProgress, [0.45, 0.62], [24, 0])

  return (
    <section ref={containerRef} className="relative h-[280vh] w-full bg-[#0B0F0E]">
      <div className="sticky top-20 h-[calc(100vh-5rem)] w-full max-w-7xl mx-auto flex items-center justify-center overflow-hidden px-6">
        {/* Ambient Radial Center Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,194,105,0.1)_0%,transparent_70%)] pointer-events-none" />

        {/* Pocket 1: The Friction */}
        <motion.div
          style={{ opacity: opacity1, y: y1 }}
          className="absolute left-6 md:left-20 top-1/4 z-10 max-w-sm pointer-events-none"
        >
          <span className="font-mono text-xs text-[#00C269] uppercase tracking-widest block mb-2">
            The Friction
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            scattered resources?
          </h2>
          <p className="mt-3 text-xs md:text-sm text-slate-400 leading-relaxed">
            Dead Google Drives, missing KT papers, and corrupted syllabus files.
          </p>
        </motion.div>

        {/* Pocket 2: The Resolution */}
        <motion.div
          style={{ opacity: opacity2, y: y2 }}
          className="absolute right-6 md:right-20 top-1/2 z-10 max-w-sm text-right pointer-events-none"
        >
          <span className="font-mono text-xs text-[#34EE99] uppercase tracking-widest block mb-2">
            The Resolution
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-[#00C269] tracking-tight leading-tight">
            we got you.
          </h2>
          <p className="mt-3 text-xs md:text-sm text-slate-400 leading-relaxed">
            A single authenticated vault indexed strictly to Mumbai University Rev-2019 'C' Scheme.
          </p>
        </motion.div>

        {/* Normalized Emerald Vector Trace */}
        <div className="relative w-full h-full max-w-3xl max-h-[650px] flex items-center justify-center pointer-events-none">
          <svg
            viewBox="0 0 1000 1200"
            fill="none"
            className="w-full h-full object-contain"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 200 100 C 600 100, 800 300, 500 450 C 200 600, 150 750, 500 850 C 850 950, 800 1100, 450 1150"
              stroke="#1F2925"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <motion.path
              d="M 200 100 C 600 100, 800 300, 500 450 C 200 600, 150 750, 500 850 C 850 950, 800 1100, 450 1150"
              stroke="#00C269"
              strokeWidth="12"
              strokeLinecap="round"
              style={{ pathLength }}
            />
          </svg>
        </div>
      </div>
    </section>
  )
}

export default Skiper19
