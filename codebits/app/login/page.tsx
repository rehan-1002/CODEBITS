"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  GraduationCap 
} from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

function LoginContent() {
  const searchParams = useSearchParams();
  const isConcurrent = searchParams.get("reason") === "concurrent_device";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [isDesktop, setIsDesktop] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    setHasMounted(true);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isRegister = mode === "register";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Return to Vault Header Link */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mb-4"
      >
        <Link
          href="/vault"
          className="inline-flex items-center space-x-2 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>RETURN TO ACADEMIC VAULT</span>
        </Link>
      </motion.div>

      {/* Main Single Joined Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 35, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-base)] shadow-2xl overflow-hidden min-h-[660px] lg:h-[720px] flex flex-col lg:block"
      >
        {/* Top Ambient Glow Edge */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--brand-primary)] to-transparent opacity-80 z-30 pointer-events-none" />

        {/* =========================================================================
            PANEL 1: THE PICTORIAL CANVAS (z-10: Sits behind the form to emerge/slide)
            ========================================================================= */}
        <motion.div
          key="canvas-panel"
          initial={
            hasMounted && isDesktop
              ? { x: "0%", opacity: 0.4, scale: 0.96 }
              : false
          }
          animate={{
            x: isDesktop ? (isRegister ? "0%" : "100%") : "0%",
            opacity: 1,
            scale: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 24,
            mass: 0.9,
          }}
          className="w-full lg:w-1/2 lg:h-full lg:absolute lg:top-0 lg:left-0 z-10 bg-[var(--brand-primary)] text-black selection:bg-black selection:text-[var(--brand-primary)] flex flex-col justify-between p-7 sm:p-10 lg:p-12 overflow-hidden order-1 lg:order-none"
        >
          {/* Subtle Primary Specular Lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.22),transparent_65%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.10),transparent_50%)] pointer-events-none" />

          {/* Blueprint Dot Grid Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(rgba(0, 0, 0, 0.45) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Canvas Centerpiece: Clean Class Logo */}
          <div className="relative z-10 my-auto py-8 sm:py-12 text-center flex flex-col items-center justify-center">
            {/* Logo Container featuring the uploaded CodeBits by Prof. MRF banner */}
            <div className="relative group w-full max-w-[340px] px-2">
              <div className="absolute -inset-2 rounded-2xl bg-black/20 opacity-40 blur-xl group-hover:opacity-60 transition-opacity duration-500" />
              
              <div className="relative w-full h-28 sm:h-32 rounded-2xl bg-white p-4 shadow-2xl flex items-center justify-center border-2 border-black/10 transition-transform duration-500 group-hover:scale-[1.02]">
                <Image
                  src="/codebits-logo.png"
                  alt="CodeBits by Prof. MRF"
                  width={320}
                  height={102}
                  priority
                  className="w-auto h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Canvas Bottom Bar: Offline Hubs & Mentor */}
          <div className="relative z-10 space-y-2.5 pt-3 border-t border-black/15">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-black/10 border border-black/15 text-black font-semibold">
                <MapPin className="w-3 h-3 text-black shrink-0" />
                <span className="truncate">Kalyan West • Opp. Railway Station</span>
              </div>
              <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-black/10 border border-black/15 text-black font-semibold">
                <MapPin className="w-3 h-3 text-black shrink-0" />
                <span className="truncate">Ulhasnagar • Shivaji Chowk</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-black font-bold pt-0.5">
              <div className="flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-black" />
                <span>Head of Pedagogy: Prof. Rohit Falake (M.R.F)</span>
              </div>
              <span className="underline decoration-black/40">MUMBAI UNIVERSITY</span>
            </div>
          </div>

        </motion.div>

        {/* =========================================================================
            PANEL 2: THE FORM PANEL (z-20: Sits on top of the canvas, sliding left/right)
            ========================================================================= */}
        <motion.div
          key="form-panel"
          animate={{
            x: isDesktop ? (isRegister ? "100%" : "0%") : "0%",
          }}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 24,
            mass: 0.9,
          }}
          className={`w-full lg:w-1/2 lg:h-full lg:absolute lg:top-0 lg:left-0 z-20 bg-[var(--surface-base)] flex flex-col justify-between p-6 sm:p-8 lg:p-10 overflow-y-auto order-2 lg:order-none ${
            isRegister ? "lg:border-l lg:border-[var(--border-subtle)]" : "lg:border-r lg:border-[var(--border-subtle)]"
          }`}
        >
          <div className="space-y-5">
            {/* Form Top Brand Header with New Logo */}
            <div className="flex items-center justify-center pb-1">
              <div className="relative h-10 w-40 bg-white rounded-xl px-2.5 py-1 shadow-sm flex items-center justify-center border border-black/10">
                <Image
                  src="/codebits-logo.png"
                  alt="CodeBits by Prof. MRF"
                  width={150}
                  height={44}
                  priority
                  className="w-auto h-full object-contain"
                />
              </div>
            </div>

            {/* Clean Title */}
            <div className="text-center">
              <AnimatePresence mode="wait">
                {mode === "login" ? (
                  <motion.div
                    key="title-login"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                      Welcome Back
                    </h1>
                  </motion.div>
                ) : (
                  <motion.div
                    key="title-register"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                      Create Account
                    </h1>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Segmented Mode Tab Toggle */}
            <div className="grid grid-cols-2 p-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`py-2 text-xs font-mono font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-[var(--surface-elevated)] text-[var(--brand-primary)] border border-[var(--border-subtle)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`py-2 text-xs font-mono font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-[var(--surface-elevated)] text-[var(--brand-primary)] border border-[var(--border-subtle)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                CREATE ACCOUNT
              </button>
            </div>

            {/* Animated Form Content */}
            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.div
                  key="form-login"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.25 }}
                >
                  <LoginForm concurrentReason={isConcurrent} />
                </motion.div>
              ) : (
                <motion.div
                  key="form-register"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <RegisterForm onSuccess={() => setMode("login")} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form Bottom Link */}
          <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)] font-mono">
            {mode === "login" ? (
              <p>
                Don&apos;t have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="font-bold text-[var(--brand-primary)] hover:underline cursor-pointer ml-1"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have a registered account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-bold text-[var(--brand-primary)] hover:underline cursor-pointer ml-1"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-xs font-mono text-[var(--text-muted)]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-ping" />
            <span>INITIALIZING CODEBITS STUDENT GATEWAY...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}



