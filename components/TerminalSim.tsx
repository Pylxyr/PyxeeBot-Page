"use client"
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const LINES = [
  "git clone https://github.com/Pylxyr/PyxeeBot.git",
  "cd PyxeeBot",
  "python -m venv .venv",
  "source .venv/bin/activate",
  "pip install -r requirements.txt",
  "pyxee --start",
  "[INFO] Starting PyxeeBot...",
  "[OK] Connected to gateway",
  "[OK] Ready — PyxeeBot v1.0.0"
]

function useTyping(lines: string[], speed = 35) {
  const [output, setOutput] = useState<string[]>([])
  useEffect(() => {
    let idx = 0
    let char = 0
    let current = ''
    let mounted = true

    function step() {
      if (!mounted) return
      if (idx >= lines.length) return
      const line = lines[idx]
      if (char <= line.length) {
        current = line.slice(0, char)
        setOutput(prev => {
          const copy = [...prev]
          copy[idx] = current
          return copy
        })
        char++
        setTimeout(step, speed)
      } else {
        idx++
        char = 0
        setTimeout(step, 300)
      }
    }

    step()
    return () => { mounted = false }
  }, [lines, speed])

  return output
}

export default function TerminalSim() {
  const output = useTyping(LINES, 28)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="terminal w-full max-w-3xl bg-[#071018]/60 glass p-4 rounded-lg border border-white/6 text-sm text-slate-200"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <div className="ml-auto text-xs text-slate-400">bash</div>
      </div>
      <div className="space-y-1">
        {LINES.map((line, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="text-slate-400">$</div>
            <div className={`whitespace-pre-wrap ${i === LINES.length -1 ? 'text-neon-cyan' : 'text-slate-200'}`}>
              {output[i] ?? ''}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
