"use client"
import React from 'react'
import AnimatedLogo from '../components/AnimatedLogo'
import TerminalSim from '../components/TerminalSim'
import BentoGrid from '../components/BentoGrid'
import { motion } from 'framer-motion'
import { Star, GitBranch } from 'lucide-react'

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="sticky top-4 z-40 mx-auto w-full max-w-6xl px-4">
        <div className="glass backdrop-blur-md py-3 px-4 rounded-xl flex items-center gap-4 border border-white/6">
          <AnimatedLogo />
          <div className="flex-1">
            <div className="text-sm font-semibold">PyxeeBot</div>
            <div className="text-xs text-slate-400">Lightweight bot framework</div>
          </div>
          <a href="https://github.com/Pylxyr/PyxeeBot" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-br from-neon-violet to-neon-cyan text-black shadow-lg hover:scale-105 transition-transform active:scale-95">
            <GitBranch size={16} />
            Launch Repo
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="w-full max-w-5xl">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tighter">
            <span className="neon-text">PyxeeBot</span>
            <span className="ml-3 text-slate-300 block text-2xl md:inline md:text-3xl font-medium">— Fast, customizable, stable</span>
          </h1>
          <p className="mt-4 text-slate-400 max-w-3xl mx-auto">A developer-first bot framework with blazing execution and modular extensibility. Drop it into your projects and scale with confidence.</p>

          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6">
            <motion.a
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-br from-neon-fuchsia to-neon-cyan text-black text-sm font-semibold shadow-xl glow"
              href="https://github.com/Pylxyr/PyxeeBot"
              target="_blank"
              rel="noreferrer"
            >
              <Star size={16} />
              Star on GitHub
            </motion.a>

            <motion.div className="text-sm text-slate-300 p-3 rounded-lg glass border border-white/5">
              <span className="font-medium">Stable</span>
              <span className="ml-2 text-xs text-slate-400">v1.0.0</span>
            </motion.div>
          </div>

          <div className="mt-10">
            <TerminalSim />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full px-4 py-16 flex items-center justify-center">
        <div className="max-w-6xl w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">What makes PyxeeBot special</h2>
              <p className="text-slate-400 text-sm">An opinionated toolkit optimized for developer ergonomics.</p>
            </div>
          </div>

          <BentoGrid />
        </div>
      </section>

      {/* CTA + Footer */}
      <footer className="w-full px-4 py-10 border-t border-white/6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-lg font-semibold">Contribute & Star</div>
            <div className="text-slate-400 text-sm">Help improve PyxeeBot by starring the repository and opening PRs.</div>
          </div>

          <div className="flex items-center gap-4">
            <motion.a whileHover={{ scale: 1.05 }} href="https://github.com/Pylxyr/PyxeeBot" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-gradient-to-br from-neon-cyan to-neon-fuchsia text-black font-semibold shadow-lg">
              <Star size={16} /> Star Repo
            </motion.a>

            <div className="flex items-center gap-3 text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
              <a href="https://github.com/Pylxyr/PyxeeBot" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
