'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function NavBar() {
  const path = usePathname()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#1e2d42] bg-[#080c10]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full bg-[#00d4ff]/20 group-hover:bg-[#00d4ff]/30 transition-colors" />
            <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8">
              <circle cx="16" cy="16" r="6" fill="#00d4ff" opacity="0.9" />
              <circle cx="16" cy="16" r="10" stroke="#00d4ff" strokeWidth="1" opacity="0.4" />
              <circle cx="16" cy="16" r="14" stroke="#00d4ff" strokeWidth="0.5" opacity="0.2" />
              <line x1="16" y1="2" x2="16" y2="8" stroke="#00d4ff" strokeWidth="1.5" opacity="0.6" />
              <line x1="16" y1="24" x2="16" y2="30" stroke="#00d4ff" strokeWidth="1.5" opacity="0.6" />
              <line x1="2" y1="16" x2="8" y2="16" stroke="#00d4ff" strokeWidth="1.5" opacity="0.6" />
              <line x1="24" y1="16" x2="30" y2="16" stroke="#00d4ff" strokeWidth="1.5" opacity="0.6" />
            </svg>
          </div>
          <span className="font-mono text-sm font-semibold tracking-widest text-[#00d4ff] uppercase">
            Airspace OS
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: '/', label: 'Home' },
            { href: '/dashboard', label: 'Dashboard' },
            { href: '#docs', label: 'Docs' },
            { href: '#api', label: 'API' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`font-mono text-xs tracking-wider uppercase transition-colors ${
                path === href
                  ? 'text-[#00d4ff]'
                  : 'text-[#64748b] hover:text-[#e2e8f0]'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="group relative overflow-hidden rounded-md border border-[#00d4ff]/40 bg-[#00d4ff]/10 px-4 py-1.5 font-mono text-xs tracking-wider text-[#00d4ff] uppercase transition-all hover:bg-[#00d4ff]/20 hover:border-[#00d4ff]/70"
        >
          Launch Console
        </Link>
      </div>
    </motion.header>
  )
}
