'use client'

import { motion } from 'framer-motion'

const easeOutCubic = [0.22, 1, 0.36, 1] as const

const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: easeOutCubic,
    },
  },
}

interface PageAnimationProps {
  children: React.ReactNode
}

export default function PageAnimation({ children }: PageAnimationProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={revealVariants}
    >
      {children}
    </motion.div>
  )
}
