'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollFloat({
  children,
  logoSrc,
  useBrandLogo = true,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'top bottom-=20%',
  scrollEnd = 'bottom center',
  stagger = 0.03,
}: {
  children: string
  logoSrc?: string
  useBrandLogo?: boolean
  containerClassName?: string
  textClassName?: string
  animationDuration?: number
  ease?: string
  scrollStart?: string
  scrollEnd?: string
  stagger?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  const splitText = useMemo(() => {
    return children.split('').map((char, index) => (
      <span className="char climax-anim inline-block" key={index}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))
  }, [children])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const targets = el.querySelectorAll('.climax-anim')

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        {
          willChange: 'opacity, transform',
          opacity: 0,
          yPercent: 120,
          scaleY: 2.3,
          scaleX: 0.7,
          transformOrigin: '50% 0%',
        },
        {
          duration: animationDuration,
          ease,
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          stagger,
          scrollTrigger: {
            trigger: el,
            start: scrollStart,
            end: scrollEnd,
            scrub: true,
          },
        }
      )
    }, el)

    return () => ctx.revert()
  }, [animationDuration, ease, scrollStart, scrollEnd, stagger])

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center justify-center overflow-visible ${containerClassName}`}
    >
      {useBrandLogo ? (
        <div className="climax-anim relative w-48 sm:w-64 md:w-80 h-14 sm:h-18 md:h-22 mb-4 sm:mb-6 flex items-center justify-center">
          {/* Soft ambient radial emerald aura with zero hard edges */}
          <div className="absolute inset-0 -inset-x-6 bg-[radial-gradient(ellipse_at_center,rgba(0,194,105,0.22)_0%,transparent_70%)] blur-2xl pointer-events-none" />

          {/* Light Mode Brand Logo matching top-left navbar */}
          <Image
            src="/codebits-brand-logo.png"
            alt="CodeBits by Prof. MRF"
            fill
            sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, 320px"
            className="object-contain block dark:hidden select-none"
            priority
          />
          {/* Dark Mode Brand Logo matching top-left navbar with smooth emerald aura */}
          <Image
            src="/codebits-brand-logo-dark.png"
            alt="CodeBits by Prof. MRF"
            fill
            sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, 320px"
            className="object-contain hidden dark:block select-none drop-shadow-[0_0_16px_rgba(0,194,105,0.35)]"
            priority
          />
        </div>
      ) : logoSrc ? (
        <div className="climax-anim relative w-20 h-20 sm:w-28 sm:h-28 mb-6 inline-block">
          <Image
            src={logoSrc}
            alt="CodeBits Monogram"
            fill
            sizes="112px"
            className="object-contain drop-shadow-[0_0_20px_rgba(0,194,105,0.35)]"
            priority
          />
        </div>
      ) : null}
      <h2 className="overflow-hidden py-1 max-w-full">
        <span className={`inline-block font-black text-center ${textClassName}`}>
          {splitText}
        </span>
      </h2>
    </div>
  )
}
