'use client'

import React from 'react'
import Navbar from '@/components/navigation/Navbar'
import { Skiper19 } from '@/components/sections/Skiper19'
import Footer from '@/components/ui/footer-section'

export default function HomePage() {
  return (
    <div className="bg-[var(--bg-base)] text-[var(--text-primary)] min-h-screen transition-colors duration-200">
      {/* NAVBAR */}
      <Navbar />

      {/* KINETIC SVG SCROLL ENGINE */}
      <Skiper19 />

      {/* FOOTER */}
      <Footer />
    </div>
  )
}
