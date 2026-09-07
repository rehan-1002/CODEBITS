'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollFloat({
  children,
  logoSrc,
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
      className={`flex flex-col items-center justify-center overflow-hidden ${containerClassName}`}
    >
      {logoSrc && (
        <div className="climax-anim relative w-20 h-20 sm:w-28 sm:h-28 mb-6 inline-block">
          <Image
            src={logoSrc}
            alt="CodeBits Monogram"
            fill
            sizes="112px"
            className="object-contain drop-shadow-[0_0_35px_rgba(0,194,105,0.45)]"
            priority
          />
        </div>
      )}
      <h2 className="overflow-hidden">
        <span className={`inline-block font-black text-center ${textClassName}`}>
          {splitText}
        </span>
      </h2>
    </div>
  )
}
