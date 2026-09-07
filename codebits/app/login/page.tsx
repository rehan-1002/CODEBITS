"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

function LoginContent() {
  const searchParams = useSearchParams();
  const isConcurrent = searchParams.get("reason") === "concurrent_device";

  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto w-full">
      {/* Return to Vault Link */}
      <div className="mb-6">
        <Link
          href="/vault"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO ACADEMIC VAULT</span>
        </Link>
      </div>

      {/* Card Container */}
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded border border-[var(--border-subtle)] bg-[var(--surface-elevated)] mx-auto flex items-center justify-center overflow-hidden">
            <Image
              src="/LOGO CB.png"
              alt="CodeBits"
              width={36}
              height={36}
              className="object-contain p-0.5"
            />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {mode === "login" ? "CodeBits Student Portal" : "Create Student Account"}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            MUMBAI UNIVERSITY REV-2019 'C' SCHEME
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-base)]">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`py-1.5 text-xs font-mono font-semibold rounded transition-colors cursor-pointer ${
              mode === "login"
                ? "bg-[var(--surface-elevated)] text-[var(--brand-primary)] border border-[var(--border-subtle)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`py-1.5 text-xs font-mono font-semibold rounded transition-colors cursor-pointer ${
              mode === "register"
                ? "bg-[var(--surface-elevated)] text-[var(--brand-primary)] border border-[var(--border-subtle)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Forms */}
        {mode === "login" ? (
          <LoginForm concurrentReason={isConcurrent} />
        ) : (
          <RegisterForm onSuccess={() => setMode("login")} />
        )}

        {/* Security Policy Badge */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex items-start space-x-2 text-[10px] font-mono text-[var(--text-muted)] leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
          <span>
            CodeBits enforces single active session locking. Authenticating from another browser or device immediately concludes existing active viewer instances.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs font-mono text-[var(--text-muted)]">
          LOADING PORTAL ACCESS...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
