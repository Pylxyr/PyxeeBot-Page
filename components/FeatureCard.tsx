"use client"
import React from 'react'
import { motion } from 'framer-motion'

type Props = {
  title: string
  description: string
  icon?: React.ReactNode
}

export default function FeatureCard({ title, description, icon }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="relative p-6 rounded-xl glass border border-white/6 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="w-full h-full rounded-xl" style={{
          background: 'linear-gradient(120deg, rgba(138,43,226,0.03), rgba(255,45,149,0.02))',
          mixBlendMode: 'overlay'
        }} />
      </div>

      <div className="flex items-start gap-4 relative">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-neon-violet/20 to-neon-cyan/10 border border-white/5">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-slate-300 mt-1">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}
