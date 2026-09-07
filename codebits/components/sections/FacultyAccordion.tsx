'use client'

import React, { useState } from 'react'
import Image from 'next/image'

const facultyMembers = [
  {
    name: 'Prof. Rohit Falake (M.R.F)',
    role: 'Founder & Head of Pedagogy',
    specialty: 'Applied Mathematics, Algorithms, System Software',
    image: '/faculty/Prof. Rohit Falake (M.R.F).webp',
  },
  {
    name: 'Prof. Bharat Acharya',
    role: 'Senior Faculty & Computing Mentor',
    specialty: 'Discrete Structures, Microprocessors, Computational Logic',
    image: '/faculty/Prof. Bharat Acharya.webp',
  },
  {
    name: 'Prof. Om Baviskar',
    role: 'Technical Lead Mentor',
    specialty: 'Network Architectures, Communication Systems, Cyber Security',
    image: '/faculty/Prof. Om Baviskar.webp',
  },
  {
    name: 'Prof. Prashant Patil',
    role: 'Faculty Mentor',
    specialty: 'Data Structures, Database Management, Distributed Systems',
    image: '/faculty/Prof. Prashant Patil.webp',
  },
  {
    name: 'Prof. Sunil Jadhav',
    role: 'Academic Mentor',
    specialty: 'Algorithms, Object Oriented Programming, Software Engineering',
    image: '/faculty/Prof. Sunil Jadhav.webp',
  },
]

export default function FacultyAccordion() {
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[500px] max-w-6xl mx-auto">
      {facultyMembers.map((fac, idx) => (
        <div
          key={fac.name}
          onMouseEnter={() => setActiveIdx(idx)}
          className={`relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer border ${
            activeIdx === idx
              ? 'flex-[3] border-[#00C269] shadow-[0_0_25px_rgba(0,194,105,0.15)]'
              : 'flex-1 border-[#1F2925] opacity-60'
          }`}
        >
          <Image
            src={fac.image}
            alt={fac.name}
            fill
            sizes="(max-width: 1200px) 50vw, 33vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F0E] via-[#0B0F0E]/40 to-transparent flex flex-col justify-end p-6">
            <span className="font-mono text-xs text-[#34EE99] uppercase tracking-wider mb-1">
              {fac.role}
            </span>
            <h3 className="text-2xl font-bold text-white mb-2">{fac.name}</h3>
            {activeIdx === idx && (
              <p className="text-sm text-slate-300 transition-opacity duration-300">
                {fac.specialty}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export { FacultyAccordion }

