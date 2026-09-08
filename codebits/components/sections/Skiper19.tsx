'use client'

import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import TextAnimate from '@/components/ui/text-animate'
import VerticalCutRevealChars from '@/components/ui/m-vertical-cut-reveal-2'
import ScrollFloat from '@/components/sections/ScrollFloat'

export function Skiper19() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  return (
    <section
      ref={ref}
      className="relative mx-auto flex min-h-[320vh] w-full flex-col items-center overflow-hidden bg-[var(--bg-base)] px-4 text-[var(--text-primary)] transition-colors duration-200"
    >
      {/* Ambient Radial Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(0,194,105,0.12)_0%,transparent_70%)] pointer-events-none z-0" />

      {/* 1. TOP LANDING BLOCK (Text brought to front, centered in hero viewport) */}
      <div className="relative z-20 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center max-w-5xl mx-auto w-full px-4">
        <div className="relative z-20 w-full flex items-center justify-center text-center">
          <VerticalCutRevealChars />
        </div>

        {/* The Exact Skiper19 SVG Scribble & Trail positioned directly behind the centered landing text */}
        <LinePath
          className="absolute top-1/2 -translate-y-[240px] left-1/2 -translate-x-1/2 -z-10 pointer-events-none w-[1100px] md:w-[1278px] h-auto overflow-visible opacity-85"
          scrollYProgress={scrollYProgress}
          containerRef={ref}
        />
      </div>

      {/* 2. STORY POCKET 1: ONLY "scattered resources?" (No HUD card, clean typography) */}
      <div className="relative z-20 w-full max-w-5xl mx-auto mt-[40vh] flex justify-start pl-6 md:pl-16">
        <TextAnimate
          animation="blurInUp"
          by="word"
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[var(--text-primary)] tracking-tight leading-tight select-none drop-shadow-[0_0_25px_rgba(0,194,105,0.1)]"
        >
          scattered resources?
        </TextAnimate>
      </div>

      {/* 3. STORY POCKET 2: ONLY "we got you." (No HUD card, clean emerald typography) */}
      <div className="relative z-20 w-full max-w-5xl mx-auto mt-[48vh] flex justify-end pr-6 md:pr-16 text-right">
        <TextAnimate
          animation="blurInUp"
          by="word"
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#00C269] tracking-tight leading-tight select-none drop-shadow-[0_0_30px_rgba(0,194,105,0.3)]"
        >
          we got you.
        </TextAnimate>
      </div>

      {/* 4. CLIMAX: The Name and Logo arrive as the scroll finishes */}
      <div className="relative z-20 w-full max-w-5xl mx-auto mt-[48vh] pb-28 flex flex-col items-center justify-center text-center">
        <ScrollFloat
          logoSrc="/LOGO CB.png"
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="top bottom-=20%"
          scrollEnd="bottom center"
          containerClassName="my-4"
          textClassName="text-[var(--text-primary)] tracking-[0.25em] font-black uppercase text-[12vw] sm:text-[9vw]"
        >
          CODEBITS
        </ScrollFloat>

        <Link
          href="/vault"
          className="mt-6 bg-[#00C269] hover:bg-[#009E52] text-[#0B0F0E] font-bold px-10 py-4 rounded-xl text-sm transition-all shadow-[0_0_25px_rgba(0,194,105,0.3)] hover:scale-105"
        >
          CONTINUE TO RESOURCES
        </Link>
      </div>
    </section>
  )
}

export default Skiper19

const BASE_PATH =
  "M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89"

const LinePath = ({
  className,
  scrollYProgress,
  containerRef,
}: {
  className?: string
  scrollYProgress: any
  containerRef?: React.RefObject<HTMLDivElement | null>
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [extraD, setExtraD] = useState<string>('')

  useEffect(() => {
    const updatePath = () => {
      if (!containerRef?.current || !svgRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const svgRect = svgRef.current.getBoundingClientRect()

      if (svgRect.width === 0) return

      const scale = 1278 / svgRect.width
      // Distance from SVG top to the bottom of container (where Footer begins)
      const distanceToBottom = containerRect.bottom - svgRect.top
      const startX = 303.794
      const startY = 2668.89

      // Target Y in SVG viewBox coordinate space, stopping cleanly before the footer
      const targetY = Math.max(startY, distanceToBottom * scale - 12)
      const deltaY = targetY - startY

      if (deltaY <= 0) {
        setExtraD('')
        return
      }

      // dx / dy from previous bezier tangent (202.989 / 804.19 ~ 0.2524)
      const slope = 0.2524
      const endX = startX + slope * Math.min(deltaY, 180)
      const endY = targetY

      const cp1X = startX + slope * deltaY * 0.35
      const cp1Y = startY + deltaY * 0.35
      const cp2X = endX
      const cp2Y = startY + deltaY * 0.75

      setExtraD(
        ` C ${cp1X.toFixed(3)} ${cp1Y.toFixed(3)}, ${cp2X.toFixed(3)} ${cp2Y.toFixed(3)}, ${endX.toFixed(3)} ${endY.toFixed(3)}`
      )
    }

    updatePath()
    window.addEventListener('resize', updatePath)
    const t = setTimeout(updatePath, 400)
    return () => {
      window.removeEventListener('resize', updatePath)
      clearTimeout(t)
    }
  }, [containerRef])

  // Starts with the scribble already visible (0.35), then traces down as you scroll the page (to 1.0)
  const pathLength = useTransform(scrollYProgress, [0, 1], [0.35, 1])

  const fullPath = extraD ? BASE_PATH + extraD : BASE_PATH

  return (
    <svg
      ref={svgRef}
      width="1278"
      height="2319"
      viewBox="0 0 1278 2319"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Track in subtle border adapting to theme */}
      <path
        d={fullPath}
        stroke="currentColor"
        className="text-[#E2E8F0] dark:text-[#1F2925]"
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* Active Animated CodeBits Emerald Path */}
      <motion.path
        d={fullPath}
        stroke="#00C269"
        strokeWidth="20"
        strokeLinecap="round"
        style={{
          pathLength,
          strokeDashoffset: useTransform(pathLength, (value) => 1 - value),
        }}
      />
    </svg>
  )
}
