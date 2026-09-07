'use client'

import React, { useLayoutEffect, useRef, useCallback, useEffect } from 'react'

export const ScrollStackItem = ({
  children,
  itemClassName = '',
}: {
  children: React.ReactNode
  itemClassName?: string
}) => (
  <div
    className={`scroll-stack-card relative w-full will-change-transform transform-gpu box-border origin-top ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d',
    }}
  >
    {children}
  </div>
)

interface ScrollStackProps {
  children: React.ReactNode
  className?: string
  itemDistance?: number
  itemScale?: number
  itemStackDistance?: number
  stackPosition?: string
  scaleEndPosition?: string
  baseScale?: number
  scaleDuration?: number
  rotationAmount?: number
  blurAmount?: number
  useWindowScroll?: boolean
  onStackComplete?: () => void
}

export default function ScrollStack({
  children,
  className = '',
  itemDistance = 50,
  itemScale = 0.035,
  itemStackDistance = 28,
  stackPosition = '8%',
  scaleEndPosition = '4%',
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 3,
  useWindowScroll = false,
  onStackComplete,
}: ScrollStackProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const stackCompletedRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const cardsRef = useRef<HTMLElement[]>([])
  const initialTopsRef = useRef<number[]>([])
  const initialEndTopRef = useRef<number>(0)
  const lastTransformsRef = useRef(new Map())
  const isUpdatingRef = useRef(false)

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight
    }
    return typeof value === 'number' ? value : parseFloat(value)
  }, [])

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
        scrollContainer: document.documentElement,
      }
    } else {
      const scroller = scrollerRef.current
      return {
        scrollTop: scroller?.scrollTop || 0,
        containerHeight:
          scroller?.clientHeight && scroller.clientHeight > 0
            ? scroller.clientHeight
            : typeof window !== 'undefined'
            ? window.innerHeight
            : 800,
        scrollContainer: scroller,
      }
    }
  }, [useWindowScroll])

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return
    isUpdatingRef.current = true

    const { scrollTop, containerHeight } = getScrollData()
    const stackPositionPx = parsePercentage(stackPosition, containerHeight)
    const endElementTop = initialEndTopRef.current || containerHeight * 5

    cardsRef.current.forEach((card, i) => {
      if (!card) return

      const initialTop = initialTopsRef.current[i] ?? card.offsetTop
      const pinStart = initialTop - stackPositionPx - itemStackDistance * i
      const pinEnd = Math.max(pinStart + 200, endElementTop - containerHeight)

      // Calculate stacking translateY
      let translateY = 0
      if (scrollTop >= pinStart && scrollTop <= pinEnd) {
        // Pinned state: stays locked at stack position
        translateY = scrollTop - pinStart
      } else if (scrollTop > pinEnd) {
        // Stack released at end of track
        translateY = pinEnd - pinStart
      } else {
        // Before pinning: natural position
        translateY = 0
      }

      // Calculate scale & blur based on cards stacked on top
      let stackedAbove = 0
      for (let j = i + 1; j < cardsRef.current.length; j++) {
        const jInitialTop = initialTopsRef.current[j] ?? cardsRef.current[j].offsetTop
        const jPinStart = jInitialTop - stackPositionPx - itemStackDistance * j
        if (scrollTop >= jPinStart) {
          stackedAbove++
        } else if (scrollTop >= jPinStart - 120) {
          const smoothLanding = (scrollTop - (jPinStart - 120)) / 120
          stackedAbove += smoothLanding
        }
      }

      const scale = Math.max(0.75, 1 - stackedAbove * itemScale)
      const blur = blurAmount > 0 ? Math.min(12, stackedAbove * blurAmount) : 0
      const rotation = rotationAmount ? i * rotationAmount * Math.min(1, stackedAbove) : 0

      const newTransform = {
        translateY: Math.round(translateY * 10) / 10,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 10) / 10,
        blur: Math.round(blur * 10) / 10,
      }

      const lastTransform = lastTransformsRef.current.get(i)
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.2 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.002 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.2 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.2

      if (hasChanged) {
        card.style.transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`
        card.style.filter = newTransform.blur > 0.5 ? `blur(${newTransform.blur}px)` : 'none'
        lastTransformsRef.current.set(i, newTransform)
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true
          onStackComplete?.()
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false
        }
      }
    })

    isUpdatingRef.current = false
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    rotationAmount,
    blurAmount,
    onStackComplete,
    parsePercentage,
    getScrollData,
  ])

  const handleScroll = useCallback(() => {
    updateCardTransforms()
  }, [updateCardTransforms])

  useLayoutEffect(() => {
    const scroller = useWindowScroll ? document.documentElement : scrollerRef.current
    if (!scroller) return

    const cards = Array.from(
      (useWindowScroll ? document : scrollerRef.current)?.querySelectorAll('.scroll-stack-card') ?? []
    ) as HTMLElement[]

    cardsRef.current = cards

    // Initialize card styles and spacing
    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`
      }
      card.style.zIndex = `${i + 1}`
      card.style.transformOrigin = 'top center'
      card.style.backfaceVisibility = 'hidden'
      card.style.perspective = '1000px'
    })

    const endElement = (
      useWindowScroll
        ? document.querySelector('.scroll-stack-end')
        : scrollerRef.current?.querySelector('.scroll-stack-end')
    ) as HTMLElement | null

    const measureAndInit = () => {
      // Temporarily unset transforms to measure true layout offsets
      cards.forEach((card) => {
        card.style.transform = 'none'
      })
      initialTopsRef.current = cards.map((c) => c.offsetTop)
      if (endElement) {
        initialEndTopRef.current = endElement.offsetTop
      }
      lastTransformsRef.current.clear()
      updateCardTransforms()
    }

    measureAndInit()

    // Handle scroll events directly on container
    const scrollTarget = useWindowScroll ? window : scrollerRef.current
    if (scrollTarget) {
      scrollTarget.addEventListener('scroll', handleScroll, { passive: true })
    }

    // Measure again after brief delay to catch any font/CSS load shifts
    const timerId = setTimeout(measureAndInit, 50)
    const timerId2 = setTimeout(measureAndInit, 200)

    const handleResize = () => {
      measureAndInit()
    }
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      clearTimeout(timerId)
      clearTimeout(timerId2)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      window.removeEventListener('resize', handleResize)
      if (scrollTarget) {
        scrollTarget.removeEventListener('scroll', handleScroll)
      }
      cardsRef.current = []
      lastTransformsRef.current.clear()
    }
  }, [itemDistance, handleScroll, updateCardTransforms, useWindowScroll])

  return (
    <div
      ref={scrollerRef}
      data-lenis-prevent="true"
      className={`relative w-full h-full overflow-y-auto overflow-x-visible overscroll-contain ${className}`.trim()}
      style={{
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="scroll-stack-inner pt-4 pb-[45rem] px-4 sm:px-8 min-h-full">
        {children}
        <div className="scroll-stack-end w-full h-2" />
      </div>
    </div>
  )
}

