"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";

interface PathDrawingTextProps {
  text?: string;
  className?: string;
  align?: "left" | "center";
}

export default function PathDrawingText({
  text = "MUMBAI UNIVERSITY",
  className = "",
  align = "left",
}: PathDrawingTextProps) {
  const rawId = useId();
  const gradId = `pgrad-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const gradId2 = `pgrad2-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const isLeft = align === "left";

  return (
    <div
      className={`relative w-full flex flex-col ${
        isLeft ? "items-start justify-start text-left" : "items-center justify-center text-center"
      } my-2 sm:my-3 select-none ${className}`}
    >
      {/* Screen Reader Accessible Text */}
      <h1 className="sr-only">{text}</h1>

      {/* Hero Path-Drawing SVG Container */}
      <div className={`w-full flex items-center ${isLeft ? "justify-start" : "justify-center max-w-5xl"} px-0`}>
        <svg
          viewBox="0 0 940 145"
          className="w-full max-w-6xl h-auto max-h-[180px] overflow-visible"
          role="img"
          aria-label={text}
        >
          <defs>
            {/* Dynamic Looping Emerald Gradient for Text Stroke */}
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00C269">
                <animate
                  attributeName="stop-color"
                  values="#00C269;#34EE99;#00E575;#00C269"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="50%" stopColor="#34EE99">
                <animate
                  attributeName="stop-color"
                  values="#34EE99;#00E575;#00C269;#34EE99"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
              <stop offset="100%" stopColor="#00E575">
                <animate
                  attributeName="stop-color"
                  values="#00E575;#00C269;#34EE99;#00E575"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </stop>
            </linearGradient>

            {/* Gradient for Underline Accent */}
            <linearGradient id={gradId2} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00C269" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#34EE99" stopOpacity="1" />
              <stop offset="100%" stopColor="#00C269" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Background Ambient Glow behind text */}
          <text
            x={isLeft ? "4" : "50%"}
            y="50%"
            textAnchor={isLeft ? "start" : "middle"}
            dominantBaseline="middle"
            fill="none"
            stroke="#00C269"
            strokeWidth="12"
            strokeOpacity="0.18"
            strokeLinejoin="round"
            strokeLinecap="round"
            fontSize="72"
            fontWeight="900"
            letterSpacing="0.04em"
            className="font-black uppercase"
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
          >
            {text}
          </text>

          {/* Base Solid Luminous Text Fill (Guarantees 100% instant readability) */}
          <text
            x={isLeft ? "4" : "50%"}
            y="50%"
            textAnchor={isLeft ? "start" : "middle"}
            dominantBaseline="middle"
            fill="currentColor"
            fontSize="72"
            fontWeight="900"
            letterSpacing="0.04em"
            className="font-black uppercase text-[#00C269] dark:text-[#34EE99]"
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              opacity: 0.95,
            }}
          >
            {text}
          </text>

          {/* Looping Gradient Path-Drawing Stroke Layer */}
          <motion.text
            x={isLeft ? "4" : "50%"}
            y="50%"
            textAnchor={isLeft ? "start" : "middle"}
            dominantBaseline="middle"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            fontSize="72"
            fontWeight="900"
            letterSpacing="0.04em"
            className="font-black uppercase"
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
            initial={{
              strokeDasharray: "20 150",
              strokeDashoffset: 0,
            }}
            animate={{
              strokeDashoffset: [-340, 340],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {text}
          </motion.text>

          {/* Animated SVG Flourish Underline */}
          <motion.path
            d={isLeft ? "M 4 116 Q 380 130 840 116" : "M 60 116 Q 470 130 880 116"}
            fill="none"
            stroke={`url(#${gradId2})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0.2, strokeDashoffset: 0 }}
            animate={{
              pathLength: [0.2, 0.9, 0.2],
              strokeDashoffset: [0, -200, -400],
            }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </div>
    </div>
  );
}

export { PathDrawingText };
