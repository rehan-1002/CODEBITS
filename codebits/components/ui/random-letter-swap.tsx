"use client"

import React, { useRef, useState, useCallback } from "react"
import { useAnimate, motion, type Transition } from "framer-motion"

export interface RandomLetterSwapProps {
  label: string
  reverse?: boolean
  transition?: Transition
  staggerDuration?: number
  className?: string
  onClick?: () => void
  [key: string]: any
}

export function RandomLetterSwap({
  label,
  reverse = true,
  transition = {
    type: "spring",
    duration: 0.6,
  },
  staggerDuration = 0.025,
  className = "",
  onClick,
  ...props
}: RandomLetterSwapProps) {
  const [scope, animate] = useAnimate()
  const [blocked, setBlocked] = useState(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleHover = useCallback(() => {
    if (blocked) return

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (blocked) return
      setBlocked(true)

      const indices = Array.from({ length: label.length }, (_, i) => i).sort(
        () => Math.random() - 0.5
      )

      const animPromises: Promise<any>[] = []

      for (let i = 0; i < label.length; i++) {
        const randomIndex = indices[i]
        const delay = i * staggerDuration
        const charTransition = {
          ...transition,
          delay,
        }

        const p1 = animate(
          `.letter-${randomIndex}`,
          {
            y: reverse ? "100%" : "-100%",
          },
          charTransition
        ).then(() => {
          return animate(
            `.letter-${randomIndex}`,
            { y: "0%" },
            { duration: 0 }
          )
        })

        const p2 = animate(
          `.letter-secondary-${randomIndex}`,
          {
            top: "0%",
          },
          charTransition
        ).then(() => {
          return animate(
            `.letter-secondary-${randomIndex}`,
            { top: reverse ? "-100%" : "100%" },
            { duration: 0 }
          )
        })

        animPromises.push(Promise.all([p1, p2]))
      }

      Promise.all(animPromises).then(() => {
        setBlocked(false)
      })
    }, 40)
  }, [animate, blocked, label, reverse, staggerDuration, transition])

  return (
    <motion.span
      className={`relative inline-flex items-center justify-center overflow-hidden select-none ${className}`}
      onHoverStart={handleHover}
      onMouseEnter={handleHover}
      onClick={onClick}
      ref={scope}
      {...props}
    >
      <span className="sr-only">{label}</span>

      {label.split("").map((letter: string, i: number) => {
        const displayChar = letter === " " ? "\u00A0" : letter
        return (
          <span
            className="whitespace-pre relative inline-flex overflow-hidden leading-none"
            key={i}
            aria-hidden={true}
          >
            <motion.span
              className={`relative letter-${i} block`}
              style={{ top: 0 }}
            >
              {displayChar}
            </motion.span>
            <motion.span
              className={`absolute letter-secondary-${i} block left-0`}
              style={{ top: reverse ? "-100%" : "100%" }}
            >
              {displayChar}
            </motion.span>
          </span>
        )
      })}
    </motion.span>
  )
}

export default RandomLetterSwap
