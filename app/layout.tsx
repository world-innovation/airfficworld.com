import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Airspace OS — The Infrastructure Layer for the Sky',
  description:
    'The unified platform for autonomous aerial mobility. Stream real-time drone telemetry, orchestrate fleets, and build the future of flight on Airspace OS.',
  keywords: ['drone', 'UAV', 'airspace', 'telemetry', 'autonomous', 'aerial mobility', 'UTM'],
  openGraph: {
    title: 'Airspace OS',
    description: 'The nervous system of the sky.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#080c10',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#080c10] text-[#e2e8f0] antialiased">
        {children}
      </body>
    </html>
  )
}
