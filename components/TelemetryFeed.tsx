'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import type { TelemetryRecord } from '@/types/telemetry'

export default function TelemetryFeed() {
  const [records, setRecords] = useState<TelemetryRecord[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Seed with recent records
    supabase
      .from('flight_telemetry')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setRecords(data as TelemetryRecord[])
      })

    const channel = supabase
      .channel('telemetry_feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'flight_telemetry' },
        (payload) => {
          setRecords((prev) => [payload.new as TelemetryRecord, ...prev].slice(0, 50))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e2d42]">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00ff87]" />
          <span className="font-mono text-xs tracking-widest text-[#00ff87] uppercase">Live Feed</span>
        </div>
        <span className="font-mono text-xs text-[#64748b]">{records.length} events</span>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-xs">
        <AnimatePresence initial={false}>
          {records.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-3 border-b border-[#1e2d42]/50 px-4 py-2 hover:bg-[#0d1520]/60"
            >
              <span className="mt-0.5 shrink-0 text-[#64748b]">
                {new Date(r.timestamp).toLocaleTimeString('en-US', { hour12: false })}
              </span>
              <span className="shrink-0 text-[#00d4ff]">{r.drone_id}</span>
              <span className="text-[#64748b]">
                {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
              </span>
              <span className="ml-auto shrink-0 text-[#00ff87]">{r.altitude.toFixed(1)}m</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
