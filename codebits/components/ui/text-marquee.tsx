"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
  wrap,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface ParallaxTextProps {
  children: string;
  baseVelocity: number;
  className?: string;
  separator?: string;
}

function ParallaxText({
  children,
  baseVelocity = 100,
  className = "",
  separator = "✦",
}: ParallaxTextProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], {
    clamp: false,
  });

  // Wrap between -20% and -45% (delta 25% matches exactly 2 repetitions in an 8-element list)
  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap m-0 select-none py-1">
      <motion.div
        className={cn("flex whitespace-nowrap flex-nowrap gap-6 sm:gap-10 will-change-transform", className)}
        style={{ x }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="flex items-center gap-6 sm:gap-10">
            <span>{children}</span>
            <span className="text-[var(--brand-primary)] opacity-60 text-[0.55em]">{separator}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

interface TextMarqueeProps {
  text1?: string;
  text2?: string;
  speed?: number;
  className?: string;
}

export function TextMarquee({
  text1 = "MEET THE TEAM",
  text2 = "PILLARS OF CODEBITS",
  speed = 1.8,
  className = "",
}: TextMarqueeProps) {
  return (
    <div
      className={cn(
        "w-full py-6 sm:py-10 overflow-hidden border-y border-[var(--border-subtle)] bg-[var(--surface-base)]/30 flex flex-col gap-2 sm:gap-4 my-16",
        className
      )}
    >
      {/* Row 1: Leftward moving Marquee - Meet The Team */}
      <ParallaxText
        baseVelocity={-speed}
        className="font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter uppercase text-[var(--text-primary)]"
      >
        {text1}
      </ParallaxText>

      {/* Row 2: Rightward moving Marquee - Pillars Of Codebits */}
      <ParallaxText
        baseVelocity={speed}
        className="font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tighter uppercase text-[var(--brand-primary)] drop-shadow-[0_0_25px_rgba(0,194,105,0.2)]"
      >
        {text2}
      </ParallaxText>
    </div>
  );
}

export default TextMarquee;
