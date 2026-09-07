'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export function Skiper19() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // SVG stroke length mapping
  const pathLength = useTransform(scrollYProgress, [0, 0.85], [0.02, 1])

  // Pocket 1: "scattered resources?"
  const opacity1 = useTransform(scrollYProgress, [0.12, 0.25, 0.38], [0, 1, 0])
  const y1 = useTransform(scrollYProgress, [0.12, 0.25], [30, 0])

  // Pocket 2: "we got you."
  const opacity2 = useTransform(scrollYProgress, [0.42, 0.58, 0.75], [0, 1, 0])
  const y2 = useTransform(scrollYProgress, [0.42, 0.58], [30, 0])

  return (
    <section ref={containerRef} className="relative h-[320vh] w-full bg-[#0B0F0E] overflow-hidden">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* Radial Ambient Center Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,194,105,0.08)_0%,transparent_70%)] pointer-events-none" />

        {/* Pocket 1 Text */}
        <motion.div
          style={{ opacity: opacity1, y: y1 }}
          className="absolute left-6 sm:left-24 top-1/3 z-20 max-w-sm pointer-events-none"
        >
          <span className="font-mono text-xs text-[#00C269] uppercase tracking-widest block mb-2">
            The Friction
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            scattered resources?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Dead Google Drives, missing KT papers, and corrupted syllabus files.
          </p>
        </motion.div>

        {/* Pocket 2 Text */}
        <motion.div
          style={{ opacity: opacity2, y: y2 }}
          className="absolute right-6 sm:right-24 top-1/2 z-20 max-w-sm text-right pointer-events-none"
        >
          <span className="font-mono text-xs text-[#34EE99] uppercase tracking-widest block mb-2">
            The Resolution
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-[#00C269] tracking-tight leading-tight">
            we got you.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            A single authenticated vault indexed strictly to Mumbai University Rev-2019 'C' Scheme.
          </p>
        </motion.div>

        {/* The Animated Vector Path */}
        <svg
          width="1278"
          height="2319"
          viewBox="0 0 1278 2319"
          fill="none"
          className="absolute w-full h-full object-contain pointer-events-none opacity-85"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M876.6 394.1C788.9 335.9 696.1 358.1 691.8 416.3C685.4 501.4 853.7 498.4 941.9 409.7C1016.1 335.1 1008.6 186.9 906.1 142.8C807 100.2 712.6 198.4 789 245.1C889 306.2 986 116.9 840.5 43.3C743.9 -5.5 678 57.1 672.2 112.1C666.5 167.2 712.5 172.9 736.3 163C760.1 153.2 764.1 120.9 746.6 93.3C717.4 47.4 638.8 77.8 601 116.9C568.1 150.9 557 201 576.4 246.9C593.3 286.6 630.2 310.5 671.6 302.6C756.1 286.4 729.7 206.5 681.8 186.4C630.5 164.8 492 209.3 495 287.6C496.8 334.4 518.4 366.4 582.4 367.2C680 368.5 771.5 299.4 898.6 292.4C1007 286.4 1192.6 309.3 1242.3 382.2C1266.9 418.3 1273.6 443.1 1247.7 474.4C1217.3 511.3 1149.4 511.2 1096.8 466C1044.2 420.9 1029.1 380.5 1033.9 324.1C1038.3 273.4 1069.5 228.9 1117.2 216.3C1152.2 207.1 1188.2 213.6 1194.4 245.1C1201.4 281 1132.2 280.1 1100.4 272.6C1065.3 264.4 1044.2 234.8 1032.7 201.4C1019.2 162 1029.7 131.1 1056.4 100.9C1086.1 67.4 1143.9 54.5 1175.7 86.1C1207 117.1 1186.8 143.3 1156.2 166.6C1112.5 199.9 1052.5 186.2 999.7 155.1C957.3 130.1 899.1 63.7 931.2 26.3C952 2.1 996.2 3.8 1007.2 43.5C1018.1 83.2 1003.5 122.6 975.9 163.3C948.3 204.1 907.2 255.1 913.5 321C919.7 385.7 990.9 497 1063.8 503.3C1111.4 507.4 1166.7 511.9 1175.6 464.5C1191.5 379.9 1101.2 334.9 1030.2 377C971.1 412 956.2 483.6 953.7 561.6C947.5 755.4 1197.5 941.8 936 1140.6C745.7 1285.3 321.9 950.7 134.5 1202.1C-6.6 1391.6 -53.4 1655.3 131.9 1760.5C478.3 1956.9 1124.1 1515 1201.2 1997.8C1273.6 2451.2 100.8 1864.7 303.7 2668.8"
            stroke="#1F2925"
            strokeWidth="12"
          />
          <motion.path
            d="M876.6 394.1C788.9 335.9 696.1 358.1 691.8 416.3C685.4 501.4 853.7 498.4 941.9 409.7C1016.1 335.1 1008.6 186.9 906.1 142.8C807 100.2 712.6 198.4 789 245.1C889 306.2 986 116.9 840.5 43.3C743.9 -5.5 678 57.1 672.2 112.1C666.5 167.2 712.5 172.9 736.3 163C760.1 153.2 764.1 120.9 746.6 93.3C717.4 47.4 638.8 77.8 601 116.9C568.1 150.9 557 201 576.4 246.9C593.3 286.6 630.2 310.5 671.6 302.6C756.1 286.4 729.7 206.5 681.8 186.4C630.5 164.8 492 209.3 495 287.6C496.8 334.4 518.4 366.4 582.4 367.2C680 368.5 771.5 299.4 898.6 292.4C1007 286.4 1192.6 309.3 1242.3 382.2C1266.9 418.3 1273.6 443.1 1247.7 474.4C1217.3 511.3 1149.4 511.2 1096.8 466C1044.2 420.9 1029.1 380.5 1033.9 324.1C1038.3 273.4 1069.5 228.9 1117.2 216.3C1152.2 207.1 1188.2 213.6 1194.4 245.1C1201.4 281 1132.2 280.1 1100.4 272.6C1065.3 264.4 1044.2 234.8 1032.7 201.4C1019.2 162 1029.7 131.1 1056.4 100.9C1086.1 67.4 1143.9 54.5 1175.7 86.1C1207 117.1 1186.8 143.3 1156.2 166.6C1112.5 199.9 1052.5 186.2 999.7 155.1C957.3 130.1 899.1 63.7 931.2 26.3C952 2.1 996.2 3.8 1007.2 43.5C1018.1 83.2 1003.5 122.6 975.9 163.3C948.3 204.1 907.2 255.1 913.5 321C919.7 385.7 990.9 497 1063.8 503.3C1111.4 507.4 1166.7 511.9 1175.6 464.5C1191.5 379.9 1101.2 334.9 1030.2 377C971.1 412 956.2 483.6 953.7 561.6C947.5 755.4 1197.5 941.8 936 1140.6C745.7 1285.3 321.9 950.7 134.5 1202.1C-6.6 1391.6 -53.4 1655.3 131.9 1760.5C478.3 1956.9 1124.1 1515 1201.2 1997.8C1273.6 2451.2 100.8 1864.7 303.7 2668.8"
            stroke="#00C269"
            strokeWidth="14"
            strokeLinecap="round"
            style={{ pathLength }}
          />
        </svg>
      </div>
    </section>
  )
}
