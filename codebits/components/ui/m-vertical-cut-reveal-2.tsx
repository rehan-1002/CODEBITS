'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

interface VerticalCutRevealCharsProps {
  text?: string
  className?: string
  charClassName?: string
}

export default function VerticalCutRevealChars({
  text = 'Let us build the bridge between your career and dream.',
  className = '',
  charClassName = '',
}: VerticalCutRevealCharsProps) {
  // Split sentence into words to prevent unnatural mid-word line breaking
  const words = useMemo(() => text.split(' '), [text])

  // Calculate total characters to determine the exact center index
  const totalChars = useMemo(() => text.length, [text])
  const centerIndex = useMemo(() => (totalChars - 1) / 2, [totalChars])

  let runningCharIndex = 0

  return (
    <h1
      className={`flex flex-wrap justify-center items-center content-center gap-x-[0.28em] gap-y-[0.12em] text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.12] max-w-5xl mx-auto text-center text-[var(--text-primary)] w-full transition-colors duration-200 ${className}`}
    >
      {words.map((word, wordIdx) => {
        const chars = word.split('')
        const wordStartIndex = runningCharIndex
        runningCharIndex += chars.length + (wordIdx < words.length - 1 ? 1 : 0)

        return (
          <span key={`${word}-${wordIdx}`} className="inline-flex justify-center items-center whitespace-nowrap">
            {chars.map((char, charInWordIdx) => {
              const currentIndex = wordStartIndex + charInWordIdx
              // Calculate outward distance from center
              const distFromCenter = Math.abs(currentIndex - centerIndex)
              const staggerDelay = distFromCenter * 0.032 + 0.15

              return (
                <span
                  key={`${char}-${charInWordIdx}`}
                  className="relative overflow-hidden inline-block px-[0.02em] py-[0.05em] select-none text-center"
                >
                  {/* Vertical Cut Character Motion (slides up from bottom cut) */}
                  <motion.span
                    initial={{ y: '110%', opacity: 0, filter: 'blur(3px)' }}
                    animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                    transition={{
                      delay: staggerDelay,
                      duration: 0.6,
                      ease: [0.215, 0.61, 0.355, 1], // easeOutCubic
                    }}
                    className={`inline-block ${charClassName}`}
                  >
                    {char}
                  </motion.span>

                  {/* Cut Wipe Micro-Accent Line */}
                  <motion.span
                    aria-hidden="true"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{
                      delay: staggerDelay,
                      duration: 0.45,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-[#00C269] origin-center pointer-events-none"
                  />
                </span>
              )
            })}
          </span>
        )
      })}
    </h1>
  )
}

export { VerticalCutRevealChars }
