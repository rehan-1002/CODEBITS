'use client'

import React, {
  useLayoutEffect,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'

export const ScrollStackItem = ({
  children,
  itemClassName = '',
}: {
  children: React.ReactNode
  itemClassName?: string
}) => (
  <div
    className={`scroll-stack-card relative w-full will-change-transform transform-gpu box-border origin-top transition-shadow duration-300 ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d',
    }}
  >
    {children}
  </div>
)

export interface ScrollStackHandle {
  scrollToCard: (index: number) => void
  scrollToTop: () => void
}

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
  onActiveCardChange?: (index: number) => void
}

const ScrollStack = forwardRef<ScrollStackHandle, ScrollStackProps>(function ScrollStack(
  {
    children,
    className = '',
    itemDistance = 50,
    itemScale = 0.04,
    itemStackDistance = 28,
    stackPosition = '8%',
    scaleEndPosition = '4%',
    baseScale = 0.85,
    scaleDuration = 0.5,
    rotationAmount = 0,
    blurAmount = 2.5,
    useWindowScroll = false,
    onStackComplete,
    onActiveCardChange,
  },
  ref
) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const stackCompletedRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const cardsRef = useRef<HTMLElement[]>([])
  const initialTopsRef = useRef<number[]>([])
  const initialEndTopRef = useRef<number>(0)
  const lastTransformsRef = useRef<Map<number, any>>(new Map())
  const isUpdatingRef = useRef(false)
  const activeCardIndexRef = useRef<number>(0)

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

    let calculatedActiveIndex = 0

    cardsRef.current.forEach((card, i) => {
      if (!card) return

      const initialTop = initialTopsRef.current[i] ?? card.offsetTop
      const pinStart = initialTop - stackPositionPx - itemStackDistance * i
      const pinEnd = Math.max(pinStart + 2500, endElementTop - containerHeight)

      if (scrollTop >= pinStart - 60) {
        calculatedActiveIndex = i
      }

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

      // Calculate scale, blur & depth lighting based on cards stacked on top
      let stackedAbove = 0
      for (let j = i + 1; j < cardsRef.current.length; j++) {
        const jInitialTop = initialTopsRef.current[j] ?? cardsRef.current[j].offsetTop
        const jPinStart = jInitialTop - stackPositionPx - itemStackDistance * j
        if (scrollTop >= jPinStart) {
          stackedAbove++
        } else if (scrollTop >= jPinStart - 140) {
          const smoothLanding = (scrollTop - (jPinStart - 140)) / 140
          stackedAbove += smoothLanding
        }
      }

      // Scale decay: progressively scale down cards stacked underneath
      const scale = Math.max(0.76, 1 - stackedAbove * itemScale)
      // Progressive depth blur
      const blur = blurAmount > 0 ? Math.min(8, stackedAbove * blurAmount) : 0
      // Progressive depth dimming (brightness)
      const brightness = Math.max(0.65, 1 - stackedAbove * 0.08)
      // Subtle 3D tilt angle
      const rotateX = Math.min(3.5, stackedAbove * 1.2)
      const rotation = rotationAmount ? i * rotationAmount * Math.min(1, stackedAbove) : 0

      // Dynamic depth elevation shadow
      const shadowBlur = Math.round(15 + stackedAbove * 14)
      const shadowY = Math.round(8 + stackedAbove * 8)
      const shadowOpacity = Math.min(0.55, 0.15 + stackedAbove * 0.12)

      const newTransform = {
        translateY: Math.round(translateY * 10) / 10,
        scale: Math.round(scale * 1000) / 1000,
        rotateX: Math.round(rotateX * 10) / 10,
        rotation: Math.round(rotation * 10) / 10,
        blur: Math.round(blur * 10) / 10,
        brightness: Math.round(brightness * 100) / 100,
        shadowY,
        shadowBlur,
        shadowOpacity,
      }

      const lastTransform = lastTransformsRef.current.get(i)
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.2 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.002 ||
        Math.abs(lastTransform.rotateX - newTransform.rotateX) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.2 ||
        Math.abs(lastTransform.brightness - newTransform.brightness) > 0.02

      if (hasChanged) {
        card.style.transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) perspective(1200px) rotateX(${newTransform.rotateX}deg) rotate(${newTransform.rotation}deg)`

        const filterRules: string[] = []
        if (newTransform.blur > 0.4) {
          filterRules.push(`blur(${newTransform.blur}px)`)
        }
        if (newTransform.brightness < 0.98) {
          filterRules.push(`brightness(${newTransform.brightness})`)
        }
        card.style.filter = filterRules.length ? filterRules.join(' ') : 'none'

        if (stackedAbove > 0.05) {
          card.style.boxShadow = `0 ${newTransform.shadowY}px ${newTransform.shadowBlur}px rgba(0, 0, 0, ${newTransform.shadowOpacity})`
        } else {
          card.style.boxShadow = ''
        }

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

    if (activeCardIndexRef.current !== calculatedActiveIndex) {
      activeCardIndexRef.current = calculatedActiveIndex
      onActiveCardChange?.(calculatedActiveIndex)
    }

    isUpdatingRef.current = false
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    rotationAmount,
    blurAmount,
    onStackComplete,
    onActiveCardChange,
    parsePercentage,
    getScrollData,
  ])

  const handleScroll = useCallback(() => {
    updateCardTransforms()
  }, [updateCardTransforms])

  // Expose scroll helpers via forwardRef
  useImperativeHandle(
    ref,
    () => ({
      scrollToCard: (index: number) => {
        const scroller = useWindowScroll ? window : scrollerRef.current
        if (!scroller || index < 0 || index >= cardsRef.current.length) return

        const { containerHeight } = getScrollData()
        const stackPositionPx = parsePercentage(stackPosition, containerHeight)
        const initialTop = initialTopsRef.current[index] ?? cardsRef.current[index]?.offsetTop ?? 0
        const targetScrollTop = Math.max(
          0,
          initialTop - stackPositionPx - itemStackDistance * index + 10
        )

        scroller.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        })
      },
      scrollToTop: () => {
        const scroller = useWindowScroll ? window : scrollerRef.current
        scroller?.scrollTo({ top: 0, behavior: 'smooth' })
      },
    }),
    [useWindowScroll, getScrollData, parsePercentage, stackPosition, itemStackDistance]
  )

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
      card.style.perspective = '1200px'
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

  // Keyboard navigation inside scroller
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        const nextIdx = Math.min(cardsRef.current.length - 1, activeCardIndexRef.current + 1)
        if (nextIdx !== activeCardIndexRef.current) {
          e.preventDefault()
          const { containerHeight } = getScrollData()
          const stackPositionPx = parsePercentage(stackPosition, containerHeight)
          const initialTop = initialTopsRef.current[nextIdx] ?? cardsRef.current[nextIdx]?.offsetTop ?? 0
          const target = Math.max(0, initialTop - stackPositionPx - itemStackDistance * nextIdx + 10)
          scrollerRef.current?.scrollTo({ top: target, behavior: 'smooth' })
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        const prevIdx = Math.max(0, activeCardIndexRef.current - 1)
        if (prevIdx !== activeCardIndexRef.current) {
          e.preventDefault()
          const { containerHeight } = getScrollData()
          const stackPositionPx = parsePercentage(stackPosition, containerHeight)
          const initialTop = initialTopsRef.current[prevIdx] ?? cardsRef.current[prevIdx]?.offsetTop ?? 0
          const target = Math.max(0, initialTop - stackPositionPx - itemStackDistance * prevIdx + 10)
          scrollerRef.current?.scrollTo({ top: target, behavior: 'smooth' })
        }
      } else if (e.key === 'Home') {
        e.preventDefault()
        scrollerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [getScrollData, parsePercentage, stackPosition, itemStackDistance])

  return (
    <div
      ref={scrollerRef}
      tabIndex={0}
      data-lenis-prevent="true"
      className={`relative w-full h-full overflow-y-auto overflow-x-visible overscroll-contain focus:outline-none ${className}`.trim()}
      style={{
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
      }}
    >
      <div className="scroll-stack-inner pt-2 pb-[70rem] px-4 sm:px-8 min-h-full">
        {children}
        <div className="scroll-stack-end w-full h-2" />
      </div>
    </div>
  )
})

export default ScrollStack
