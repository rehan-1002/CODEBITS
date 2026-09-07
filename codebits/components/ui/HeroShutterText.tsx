'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface HeroShutterTextProps {
  className?: string
}

export function HeroShutterText({ className = '' }: HeroShutterTextProps) {
  // Break down into words to preserve responsive natural line wrapping
  const parts = [
    { text: 'Let', highlight: false },
    { text: 'us', highlight: false },
    { text: 'build', highlight: false },
    { text: 'the', highlight: false },
    { text: 'bridge', highlight: false },
    { text: 'between', highlight: false },
    { text: 'your', highlight: false },
    { text: 'career', highlight: true },
    { text: 'and', highlight: true },
    { text: 'dream.', highlight: true },
  ]

  // Calculate cumulative character index for seamless staggered shutter delay
  let charCounter = 0

  return (
    <h1
      className={`flex flex-wrap justify-center items-center gap-x-[0.28em] gap-y-[0.1em] text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.12] max-w-5xl mx-auto text-center ${className}`}
    >
      {parts.map((part, pIdx) => {
        const chars = part.text.split('')
        return (
          <span key={`${part.text}-${pIdx}`} className="inline-flex whitespace-nowrap">
            {chars.map((char) => {
              const i = charCounter++
              const isHighlight = part.highlight

              return (
                <span
                  key={i}
                  className="relative px-[0.02em] overflow-hidden inline-block select-none"
                >
                  {/* Main Character with blur reveal */}
                  <motion.span
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{
                      delay: i * 0.035 + 0.2,
                      duration: 0.75,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`inline-block ${
                      isHighlight
                        ? 'text-[#00C269] drop-shadow-[0_0_24px_rgba(0,194,105,0.35)]'
                        : 'text-white'
                    }`}
                  >
                    {char}
                  </motion.span>

                  {/* Top Slice Shutter Layer (0% - 35%) */}
                  <motion.span
                    aria-hidden="true"
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{ x: '100%', opacity: [0, 1, 0] }}
                    transition={{
                      duration: 0.65,
                      delay: i * 0.035,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 text-[#00C269] z-10 pointer-events-none"
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 100% 35%, 0 35%)',
                    }}
                  >
                    {char}
                  </motion.span>

                  {/* Middle Slice Shutter Layer (35% - 65%) */}
                  <motion.span
                    aria-hidden="true"
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: '-100%', opacity: [0, 1, 0] }}
                    transition={{
                      duration: 0.65,
                      delay: i * 0.035 + 0.08,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 text-slate-300 z-10 pointer-events-none"
                    style={{
                      clipPath: 'polygon(0 35%, 100% 35%, 100% 65%, 0 65%)',
                    }}
                  >
                    {char}
                  </motion.span>

                  {/* Bottom Slice Shutter Layer (65% - 100%) */}
                  <motion.span
                    aria-hidden="true"
                    initial={{ x: '-100%', opacity: 0 }}
                    animate={{ x: '100%', opacity: [0, 1, 0] }}
                    transition={{
                      duration: 0.65,
                      delay: i * 0.035 + 0.16,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 text-[#34EE99] z-10 pointer-events-none"
                    style={{
                      clipPath: 'polygon(0 65%, 100% 65%, 100% 100%, 0 100%)',
                    }}
                  >
                    {char}
                  </motion.span>
                </span>
              )
            })}
          </span>
        )
      })}
    </h1>
  )
}

export default HeroShutterText
