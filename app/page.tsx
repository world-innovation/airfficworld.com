'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import NavBar from '@/components/NavBar'
import ScrollProgress from '@/components/ScrollProgress'
import LiveTicker from '@/components/LiveTicker'
import { useCountUp } from '@/lib/useCountUp'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
}

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" d="M3 12h3m15 0h-3M12 3v3m0 15v-3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    color: '#00d4ff',
    label: 'Telemetry API',
    title: 'Stream at 100 ms Resolution',
    body: 'A single authenticated POST pushes GPS coordinates, altitude, and sensor data into our distributed time-series layer. Latency under 50 ms globally.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" d="M9 6.75V15m6-6v8.25m.503-9.998 3-1.5.501.25V16.5l-4 2-4-2-4 2-4-2V6.375c0-.621.504-1.125 1.125-1.125h.873a1.125 1.125 0 0 1 .75.286l1.502 1.251z" />
      </svg>
    ),
    color: '#00ff87',
    label: 'Live Mapping',
    title: 'See Every Drone, Everywhere',
    body: 'Real-time Supabase subscriptions push new pings to the Mapbox dashboard the instant they arrive — no polling, no lag, no guessing where your fleet is.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
      </svg>
    ),
    color: '#a78bfa',
    label: 'Fleet Management',
    title: 'Register, Monitor, Command',
    body: 'Provision drone IDs, rotate API keys, set geofences, and receive anomaly alerts — all from one operator console built for professional-grade deployments.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    color: '#fb923c',
    label: 'Secure by Default',
    title: '256-bit End-to-End Encryption',
    body: 'Every telemetry packet is authenticated, encrypted in transit, and stored with row-level security. Your airspace data never leaves your control.',
  },
]

const STATS = [
  { numeric: 50, prefix: '< ', suffix: 'ms', label: 'Global API Latency' },
  { numeric: 9999, prefix: '', suffix: '%', label: 'Uptime SLA', divisor: 100 },
  { numeric: 1, prefix: '', suffix: 'M+ / day', label: 'Telemetry Pings' },
  { numeric: 256, prefix: '', suffix: '-bit', label: 'AES Encryption' },
]

function StatCounter({
  numeric, prefix, suffix, label, divisor, index,
}: {
  numeric: number; prefix: string; suffix: string; label: string; divisor?: number; index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const count = useCountUp(numeric, 1400, inView)
  const display = divisor ? (count / divisor).toFixed(2) : count

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="flex flex-col items-center gap-1 px-8 py-4 text-center"
    >
      <span className="font-mono text-3xl font-bold text-[#00d4ff] text-glow-accent tabular-nums">
        {prefix}{display}{suffix}
      </span>
      <span className="font-mono text-xs tracking-wider text-[#64748b] uppercase">{label}</span>
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <ScrollProgress />
      <NavBar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative grid-bg flex min-h-screen items-center justify-center overflow-hidden px-6 pt-16">
        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="h-[600px] w-[600px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)', filter: 'blur(80px)' }}
          />
        </div>

        {/* Orbiting rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="pointer-events-none absolute h-[500px] w-[500px] rounded-full border border-[#00d4ff]/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="pointer-events-none absolute h-[360px] w-[360px] rounded-full border border-[#00ff87]/10"
        />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" animate="show"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 px-4 py-1.5"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00d4ff]" />
            <span className="font-mono text-xs tracking-widest text-[#00d4ff] uppercase">Now in Early Access</span>
          </motion.div>

          <motion.h1
            custom={1} variants={fadeUp} initial="hidden" animate="show"
            className="mb-6 text-5xl font-bold tracking-tight md:text-7xl"
          >
            The Nervous System{' '}
            <span
              className="text-glow-accent"
              style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #00ff87 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              of the Sky
            </span>
          </motion.h1>

          <motion.p
            custom={2} variants={fadeUp} initial="hidden" animate="show"
            className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#94a3b8]"
          >
            Airspace OS is the unified infrastructure layer for autonomous aerial mobility.
            Register drones, stream real-time telemetry, and orchestrate the future of flight — all from a single API.
          </motion.p>

          <motion.div
            custom={3} variants={fadeUp} initial="hidden" animate="show"
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/dashboard"
              className="rounded-lg px-8 py-3.5 font-mono text-sm font-semibold tracking-wider text-[#080c10] uppercase transition-transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #00ff87)' }}
            >
              Start Building →
            </Link>
            <a
              href="#features"
              className="rounded-lg border border-[#1e2d42] bg-[#0d1520]/60 px-8 py-3.5 font-mono text-sm tracking-wider text-[#64748b] uppercase transition-all hover:border-[#00d4ff]/40 hover:text-[#e2e8f0]"
            >
              See How It Works
            </a>
          </motion.div>

          {/* API teaser */}
          <motion.div
            custom={5} variants={fadeUp} initial="hidden" animate="show"
            className="mx-auto mt-14 max-w-xl overflow-hidden rounded-xl border border-[#1e2d42] bg-[#0d1520]/80 text-left backdrop-blur"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 border-b border-[#1e2d42] px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
              <span className="ml-2 font-mono text-xs text-[#64748b]">telemetry_push.sh</span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[#94a3b8]">
              <span className="text-[#64748b]">$ </span>
              <span className="text-[#00d4ff]">curl</span>
              {' -X POST /api/telemetry \\\n'}
              {'  '}<span className="text-[#64748b]">-H</span>{" 'Content-Type: application/json' \\\n"}
              {'  '}<span className="text-[#64748b]">-d</span>{" '{\n"}
              {'    '}<span className="text-[#00ff87]">"drone_id"</span>{': '}<span className="text-[#fb923c]">"UAV-ALPHA-01"</span>{',\n'}
              {'    '}<span className="text-[#00ff87]">"latitude"</span>{': '}<span className="text-[#a78bfa]">37.7749</span>{',\n'}
              {'    '}<span className="text-[#00ff87]">"longitude"</span>{': '}<span className="text-[#a78bfa]">-122.4194</span>{',\n'}
              {'    '}<span className="text-[#00ff87]">"altitude"</span>{': '}<span className="text-[#a78bfa]">52.3</span>{"\n  }'\n\n"}
              <span className="text-[#00ff87]">✓ 201 Created</span>{' — record inserted in 38ms'}
            </pre>
          </motion.div>

          {/* Live ticker */}
          <motion.div
            custom={6} variants={fadeUp} initial="hidden" animate="show"
            className="mx-auto mt-6 max-w-xl"
          >
            <LiveTicker />
          </motion.div>
        </div>

        <motion.a
          href="#stats"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#64748b]"
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.a>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <section id="stats" className="border-y border-[#1e2d42] bg-[#0d1520]/60 py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px md:grid-cols-4">
          {STATS.map((stat, i) => (
            <StatCounter key={stat.label} {...stat} index={i} />
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section id="features" className="grid-bg px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="mb-3 font-mono text-xs tracking-widest text-[#00d4ff] uppercase">Platform Capabilities</p>
            <h2 className="text-4xl font-bold tracking-tight">Built for the Era of Autonomous Flight</h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2">
            {FEATURES.map(({ icon, color, label, title, body }, i) => (
              <motion.div
                key={label}
                custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="group relative overflow-hidden rounded-xl border border-[#1e2d42] bg-[#0d1520]/60 p-6 transition-colors hover:border-[#1e2d42]/80"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `radial-gradient(400px at 0% 0%, ${color}08 0%, transparent 70%)` }}
                />
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}15`, color }}>
                  {icon}
                </div>
                <p className="mb-1 font-mono text-xs tracking-widest uppercase" style={{ color }}>{label}</p>
                <h3 className="mb-3 text-xl font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-[#64748b]">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="mb-3 font-mono text-xs tracking-widest text-[#00ff87] uppercase">Developer Flow</p>
            <h2 className="text-4xl font-bold tracking-tight">From Zero to Airborne in Minutes</h2>
          </motion.div>
          <div className="relative space-y-8">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#00d4ff]/30 via-[#00ff87]/30 to-transparent" />
            {[
              { step: '01', title: 'Register Your Drone', body: 'Create a free account, generate a drone ID and API key from the console in under 60 seconds.' },
              { step: '02', title: 'Push Telemetry', body: 'Send a single authenticated POST from your drone or ground station. Any language, any hardware.' },
              { step: '03', title: 'Watch It Live', body: 'Open the dashboard map and watch your aircraft plot its own path in real time as pings arrive.' },
              { step: '04', title: 'Scale to Your Fleet', body: 'Add unlimited drones, configure alerts, export historical data, and integrate via webhooks.' },
            ].map(({ step, title, body }, i) => (
              <motion.div
                key={step}
                custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="relative flex gap-6 pl-14"
              >
                <div
                  className="absolute left-0 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[#1e2d42] bg-[#0d1520] font-mono text-xs font-bold"
                  style={{ color: i % 2 === 0 ? '#00d4ff' : '#00ff87' }}
                >
                  {step}
                </div>
                <div className="rounded-xl border border-[#1e2d42] bg-[#0d1520]/60 p-5">
                  <h3 className="mb-2 font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-[#64748b]">{body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="px-6 py-24">
        <motion.div
          custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[#1e2d42] bg-[#0d1520]/80 p-12 text-center"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(600px at 50% 0%, #00d4ff08, transparent 70%)' }}
          />
          <p className="mb-4 font-mono text-xs tracking-widest text-[#00d4ff] uppercase">Join the Waitlist</p>
          <h2 className="mb-4 text-4xl font-bold">
            Claim Your Spot in the <span style={{ color: '#00d4ff' }}>Airspace</span>
          </h2>
          <p className="mb-10 text-[#64748b]">
            Be among the first operators to deploy on Airspace OS. Early partners get priority support,
            extended free tier, and a voice in shaping the roadmap.
          </p>
          <Link
            href="/dashboard"
            className="inline-block rounded-lg px-10 py-4 font-mono text-sm font-semibold tracking-wider text-[#080c10] uppercase transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #00ff87)' }}
          >
            Open the Console →
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-[#1e2d42] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-mono text-xs text-[#64748b]">© 2026 Airspace OS. All rights reserved.</p>
          <p className="font-mono text-xs text-[#64748b]">Built for the era of autonomous flight.</p>
        </div>
      </footer>
    </div>
  )
}
