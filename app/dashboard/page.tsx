'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import NavBar from '@/components/NavBar'
import TelemetryFeed from '@/components/TelemetryFeed'
import { supabase } from '@/lib/supabase'

// Load map client-side only (mapbox-gl is not SSR compatible)
const DroneMap = dynamic(() => import('@/components/DroneMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#080c10]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1e2d42] border-t-[#00d4ff]" />
        <span className="font-mono text-xs text-[#64748b]">Initializing airspace...</span>
      </div>
    </div>
  ),
})

const DEMO_API_KEY = 'airos_sk_demo_••••••••••••••••••••••••'

export default function DashboardPage() {
  const [droneId, setDroneId] = useState('')
  const [registered, setRegistered] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'map' | 'feed'>('map')
  const [pingCount, setPingCount] = useState<number | null>(null)
  const [droneCount, setDroneCount] = useState<number | null>(null)

  // Fetch real-time stats
  useEffect(() => {
    async function fetchStats() {
      const [pings, drones] = await Promise.all([
        supabase.from('flight_telemetry').select('*', { count: 'exact', head: true }),
        supabase.from('flight_telemetry').select('drone_id', { count: 'exact', head: false }),
      ])
      if (pings.count !== null) setPingCount(pings.count)
      if (drones.data) {
        const unique = new Set(drones.data.map((r: { drone_id: string }) => r.drone_id))
        setDroneCount(unique.size)
      }
    }

    fetchStats()

    const channel = supabase
      .channel('dashboard_stats')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'flight_telemetry' }, (payload) => {
        setPingCount((n) => (n !== null ? n + 1 : 1))
        setDroneCount((prev) => {
          // We can't easily track unique without more state; just trigger a refetch
          fetchStats()
          return prev
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!droneId.trim()) return
    setRegistering(true)
    await new Promise((r) => setTimeout(r, 800))
    setRegistered(droneId.trim().toUpperCase())
    setDroneId('')
    setRegistering(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText('airos_sk_demo_live_key_replace_me')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#080c10]">
      <NavBar />

      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* ── SIDEBAR ─────────────────────────────────────────── */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="hidden w-80 flex-shrink-0 flex-col border-r border-[#1e2d42] bg-[#0d1520]/80 backdrop-blur md:flex overflow-y-auto"
        >
          <div className="p-5 border-b border-[#1e2d42]">
            <p className="font-mono text-xs tracking-widest text-[#64748b] uppercase mb-1">Operator Console</p>
            <h1 className="text-lg font-semibold">Fleet Dashboard</h1>
          </div>

          {/* Status */}
          <div className="px-5 py-4 border-b border-[#1e2d42]">
            <div className="flex items-center justify-between text-xs font-mono mb-3">
              <span className="text-[#64748b] uppercase tracking-wider">System Status</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00ff87]" />
                <span className="text-[#00ff87]">Operational</span>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Telemetry API', status: 'online' },
                { label: 'Realtime Engine', status: 'online' },
                { label: 'Map Renderer', status: 'online' },
              ].map(({ label, status }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-[#64748b]">{label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00ff87]" />
                    <span className="font-mono text-[#00ff87]">{status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Register Drone */}
          <div className="px-5 py-5 border-b border-[#1e2d42]">
            <p className="mb-3 font-mono text-xs tracking-widest text-[#00d4ff] uppercase">Register Drone</p>
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="mb-1.5 block font-mono text-xs text-[#64748b]">Drone ID</label>
                <input
                  type="text"
                  value={droneId}
                  onChange={(e) => setDroneId(e.target.value)}
                  placeholder="e.g. UAV-ALPHA-01"
                  className="w-full rounded-lg border border-[#1e2d42] bg-[#080c10] px-3 py-2.5 font-mono text-sm text-[#e2e8f0] placeholder-[#374151] outline-none focus:border-[#00d4ff]/60 focus:ring-1 focus:ring-[#00d4ff]/20 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={registering || !droneId.trim()}
                className="w-full rounded-lg py-2.5 font-mono text-xs font-semibold tracking-wider uppercase transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #00d4ff, #00ff87)', color: '#080c10' }}
              >
                {registering ? 'Registering…' : 'Register →'}
              </button>
            </form>

            {registered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-lg border border-[#00ff87]/30 bg-[#00ff87]/5 px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 text-[#00ff87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-mono text-xs text-[#00ff87]">{registered} registered</span>
                </div>
                <p className="mt-1 font-mono text-xs text-[#64748b]">Start pushing telemetry to see it on the map.</p>
              </motion.div>
            )}
          </div>

          {/* API Key */}
          <div className="px-5 py-5 border-b border-[#1e2d42]">
            <p className="mb-3 font-mono text-xs tracking-widest text-[#00d4ff] uppercase">API Key</p>
            <div className="rounded-lg border border-[#1e2d42] bg-[#080c10] p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-[#64748b]">Default Key</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="font-mono text-xs text-[#64748b] hover:text-[#e2e8f0] transition-colors"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="font-mono text-xs text-[#64748b] hover:text-[#00d4ff] transition-colors"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <p className="font-mono text-xs text-[#94a3b8] break-all">
                {showKey ? 'airos_sk_demo_live_key_replace_me' : DEMO_API_KEY}
              </p>
            </div>
            <p className="mt-2 font-mono text-xs text-[#64748b]">
              Include as <span className="text-[#00d4ff]">X-API-Key</span> header in requests.
            </p>
          </div>

          {/* Quick stats */}
          <div className="px-5 py-5">
            <p className="mb-3 font-mono text-xs tracking-widest text-[#64748b] uppercase">Live Stats</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Active Drones', value: droneCount !== null ? String(droneCount) : '…', color: '#00d4ff' },
                { label: 'Total Pings', value: pingCount !== null ? pingCount.toLocaleString() : '…', color: '#00ff87' },
                { label: 'Uptime', value: '99.9%', color: '#a78bfa' },
                { label: 'API Latency', value: '< 50ms', color: '#fb923c' },
              ].map(({ label, value, color }) => (
                <motion.div
                  key={label}
                  layout
                  className="rounded-lg border border-[#1e2d42] bg-[#080c10]/60 p-3"
                >
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={value}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.2 }}
                      className="font-mono text-lg font-bold tabular-nums"
                      style={{ color }}
                    >
                      {value}
                    </motion.p>
                  </AnimatePresence>
                  <p className="font-mono text-xs text-[#64748b]">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.aside>

        {/* ── MAIN CONTENT ────────────────────────────────────── */}
        <main className="flex flex-1 flex-col min-w-0">
          {/* Tab bar */}
          <div className="flex items-center gap-1 border-b border-[#1e2d42] bg-[#0d1520]/60 px-4 py-2">
            {(['map', 'feed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-4 py-1.5 font-mono text-xs tracking-wider uppercase transition-colors ${
                  activeTab === tab
                    ? 'bg-[#1e2d42] text-[#00d4ff]'
                    : 'text-[#64748b] hover:text-[#e2e8f0]'
                }`}
              >
                {tab === 'map' ? '⬡ Live Map' : '≡ Telemetry Feed'}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 font-mono text-xs text-[#64748b]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00d4ff]" />
              Realtime active
            </div>
          </div>

          {/* Map */}
          <div className={`flex-1 ${activeTab === 'map' ? 'block' : 'hidden'}`}>
            <DroneMap />
          </div>

          {/* Feed */}
          <div className={`flex-1 overflow-hidden ${activeTab === 'feed' ? 'flex flex-col' : 'hidden'}`}>
            <TelemetryFeed />
          </div>
        </main>
      </div>

      {/* Simulator hint bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="border-t border-[#1e2d42] bg-[#0d1520]/80 px-6 py-2.5"
      >
        <p className="font-mono text-xs text-[#64748b] text-center">
          No drones yet?{' '}
          <span className="text-[#94a3b8]">Run </span>
          <code className="rounded bg-[#1e2d42] px-1.5 py-0.5 text-[#00d4ff]">python simulate_drone.py</code>
          <span className="text-[#94a3b8]"> to push live telemetry to this map.</span>
        </p>
      </motion.div>
    </div>
  )
}
