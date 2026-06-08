"use client"
import { MotionProps, motion } from 'framer-motion'
import { Cpu } from 'lucide-react'
import React from 'react'

export default function AnimatedLogo(props: MotionProps) {
  return (
    <motion.div
      {...props}
      initial={{ rotate: 0, scale: 0.9 }}
      animate={{ rotate: [0, 10, -8, 0], scale: [0.98, 1.02, 1.0, 1.0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-neon-violet/20 to-neon-cyan/10 glass border border-white/5"
    >
      <Cpu className="text-neon-cyan" size={20} />
    </motion.div>
  )
}
