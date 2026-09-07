'use client'

import React from 'react'
import NumberFlow from '@number-flow/react'

export function Skiper37Stats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
      <div className="p-8 rounded-2xl bg-[#131917] border border-[#1F2925] text-center">
        <div className="text-5xl sm:text-6xl font-black text-[#00C269] font-mono mb-2">
          <NumberFlow value={250} suffix="+" />
        </div>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-mono">
          Candidates Placed
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-[#131917] border border-[#1F2925] text-center">
        <div className="text-5xl sm:text-6xl font-black text-[#00C269] font-mono mb-2">
          <NumberFlow value={15} suffix="+" />
        </div>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-mono">
          Hiring Partners
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-[#131917] border border-[#1F2925] text-center">
        <div className="text-5xl sm:text-6xl font-black text-[#00C269] font-mono mb-2">
          <NumberFlow value={8} suffix=" LPA" />
        </div>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-mono">
          Average Package
        </p>
      </div>
    </div>
  )
}
