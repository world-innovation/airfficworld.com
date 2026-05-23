'use client'

import { useScroll, useTransform, motion } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div
      style={{ scaleX, transformOrigin: 'left' }}
      className="fixed top-0 left-0 right-0 z-[100] h-[2px]"
      aria-hidden
      role="presentation"
    >
      <div
        className="h-full w-full"
        style={{ background: 'linear-gradient(90deg, #00d4ff, #00ff87)' }}
      />
    </motion.div>
  )
}
