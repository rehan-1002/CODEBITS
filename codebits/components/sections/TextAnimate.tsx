"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface TextAnimateProps {
  text: string;
  className?: string;
  highlightWords?: string[];
}

export function TextAnimate({
  text,
  className = "",
  highlightWords = [],
}: TextAnimateProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });

  const words = text.split(" ");

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <span className="sr-only">{text}</span>
      <div aria-hidden="true" className="flex flex-wrap gap-x-[0.25em] gap-y-1">
        {words.map((word, i) => {
          const isHighlight = highlightWords.includes(word.toLowerCase().replace(/[^a-z0-9]/g, ""));
          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
              animate={
                isInView
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, y: 15, filter: "blur(4px)" }
              }
              transition={{
                duration: 0.35,
                delay: i * 0.04,
                ease: [0.215, 0.61, 0.355, 1],
              }}
              className={`inline-block ${
                isHighlight ? "text-[var(--brand-primary)] font-semibold" : "text-[var(--text-primary)]"
              }`}
            >
              {word}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}
