'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SAMPLE_DRONES = [
  'UAV-ALPHA-01', 'UAV-BETA-07', 'DRONE-SF-12', 'AX-SURVEY-03',
  'CARGO-LA-09', 'PATROL-NYC-04', 'SCOUT-TK-22', 'MEDIV-OSA-01',
]

function randomCoord(base: number, spread: number) {
  return (base + (Math.random() - 0.5) * spread).toFixed(5)
}

function makeEvent() {
  const drone = SAMPLE_DRONES[Math.floor(Math.random() * SAMPLE_DRONES.length)]
  const lat = randomCoord(37.77, 0.2)
  const lon = randomCoord(-122.41, 0.2)
  const alt = (40 + Math.random() * 80).toFixed(1)
  return { drone, lat, lon, alt, id: Math.random().toString(36).slice(2) }
}

export default function LiveTicker() {
  const [events, setEvents] = useState(() => Array.from({ length: 3 }, makeEvent))

  useEffect(() => {
    const id = setInterval(() => {
      setEvents((prev) => [makeEvent(), ...prev].slice(0, 6))
    }, 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="overflow-hidden rounded-xl border border-[#1e2d42] bg-[#0d1520]/80 backdrop-blur">
      <div className="flex items-center gap-2 border-b border-[#1e2d42] px-4 py-2.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00ff87]" />
        <span className="font-mono text-xs tracking-widest text-[#00ff87] uppercase">Live Network Activity</span>
        <span className="ml-auto font-mono text-xs text-[#64748b]">Global</span>
      </div>
      <div className="divide-y divide-[#1e2d42]/60">
        <AnimatePresence initial={false}>
          {events.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 px-4 py-2 font-mono text-xs"
            >
              <span className="shrink-0 text-[#00d4ff]">{ev.drone}</span>
              <span className="text-[#64748b]">→</span>
              <span className="text-[#94a3b8]">{ev.lat}, {ev.lon}</span>
              <span className="ml-auto shrink-0 text-[#00ff87]">{ev.alt}m</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
