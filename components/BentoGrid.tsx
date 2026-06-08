"use client"
import React from 'react'
import FeatureCard from './FeatureCard'
import { Zap, Sliders, ShieldCheck } from 'lucide-react'

export default function BentoGrid() {
  return (
    <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-6">
          <FeatureCard
            title="Blazing Execution"
            description="Optimized runtime paths and async execution for sub-100ms responses."
            icon={<Zap className="text-neon-fuchsia" />}
          />
          <FeatureCard
            title="Customizable"
            description="Easily plug modules, scripts, and custom handlers via a modular API."
            icon={<Sliders className="text-neon-cyan" />}
          />
        </div>

        <FeatureCard
          title="Enterprise Stability"
          description="Robust error handling, automatic retries, and long-run stability." 
          icon={<ShieldCheck className="text-neon-violet" />}
        />
      </div>

      <div className="flex flex-col gap-6">
        <FeatureCard
          title="Observability"
          description="Built-in telemetry and logs for fast debugging and tracing."
          icon={<Zap className="text-neon-cyan" />}
        />
        <FeatureCard
          title="Open Source"
          description="Community-first repo with clear docs and contributors guide."
          icon={<Sliders className="text-neon-fuchsia" />}
        />
      </div>
    </section>
  )
}
