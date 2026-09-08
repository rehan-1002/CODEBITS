"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (event?: React.MouseEvent<HTMLElement> | MouseEvent) => void;
  setTheme: (t: Theme, event?: React.MouseEvent<HTMLElement> | MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check saved preference or default to dark (primary CodeBits identity)
    const saved = localStorage.getItem("codebits-theme") as Theme | null;
    const initial = saved || "dark";
    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    root.setAttribute("data-theme", t);
    if (t === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  };

  const setThemeWithTransition = (
    next: Theme,
    event?: React.MouseEvent<HTMLElement> | MouseEvent
  ) => {
    // Document with View Transitions API support
    const doc = typeof document !== "undefined" ? (document as Document & {
      startViewTransition?: (callback: () => void | Promise<void>) => {
        ready: Promise<void>;
      };
    }) : null;

    if (
      !doc?.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setThemeState(next);
      localStorage.setItem("codebits-theme", next);
      applyTheme(next);
      return;
    }

    // Determine circular expansion coordinates from event or target
    let x: number;
    let y: number;

    if (event && "clientX" in event && (event.clientX !== 0 || event.clientY !== 0)) {
      x = event.clientX;
      y = event.clientY;
    } else if (event?.currentTarget && "getBoundingClientRect" in event.currentTarget) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else {
      x = window.innerWidth - 80;
      y = 32;
    }

    // Radius needed to reach the farthest viewport corner from (x, y)
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      setThemeState(next);
      localStorage.setItem("codebits-theme", next);
      applyTheme(next);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 520,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  const setTheme = (t: Theme, event?: React.MouseEvent<HTMLElement> | MouseEvent) => {
    setThemeWithTransition(t, event);
  };

  const toggleTheme = (event?: React.MouseEvent<HTMLElement> | MouseEvent) => {
    const next = theme === "dark" ? "light" : "dark";
    setThemeWithTransition(next, event);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {/* Prevent flash of unstyled theme on initial load */}
      <div style={{ visibility: mounted ? "visible" : "visible" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
