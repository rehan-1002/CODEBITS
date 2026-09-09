"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the border in pixels
   * @default 1
   */
  borderWidth?: number
  /**
   * Duration of the animation in seconds
   * @default 14
   */
  duration?: number
  /**
   * Color of the border, can be a single color or an array of colors
   * @default "#00C269"
   */
  shineColor?: string | string[]
  color?: string | string[]
  children?: React.ReactNode
}

/**
 * Shine Border
 *
 * Official Magic UI / 21st.dev animated background border effect component by Dillion Verma.
 * Works seamlessly both as a self-closing overlay and as an all-in-one container.
 */
export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  shineColor,
  color = "#00C269",
  className,
  style,
  children,
  ...props
}: ShineBorderProps) {
  const activeColor = shineColor ?? color

  const borderElement = (
    <div
      style={
        {
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          backgroundImage: `radial-gradient(transparent,transparent, ${
            Array.isArray(activeColor) ? activeColor.join(",") : activeColor
          },transparent,transparent)`,
          backgroundSize: "300% 300%",
          mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "var(--border-width)",
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        "animate-shine motion-safe:animate-shine pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] z-20",
        !children && className
      )}
      {...(!children ? props : {})}
    />
  )

  if (!children) {
    return borderElement
  }

  return (
    <div className={cn("relative", className)} {...props}>
      {borderElement}
      {children}
    </div>
  )
}

export default ShineBorder
