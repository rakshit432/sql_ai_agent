'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  DatabaseZap,
  Package,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: TrendingUp,
    label: 'Revenue',
    query: 'What were our total sales last month?',
    hoverBorder: 'glow-border-crimson',
    cardBg: 'from-rose-500/5 via-zinc-950/20 to-transparent border-rose-500/10',
    iconColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/10',
  },
  {
    icon: BarChart3,
    label: 'Regions',
    query: 'Which region has the highest revenue?',
    hoverBorder: 'glow-border-amber',
    cardBg: 'from-amber-500/5 via-zinc-950/20 to-transparent border-amber-500/10',
    iconColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
  },
  {
    icon: Package,
    label: 'Products',
    query: 'Show me the top 5 most expensive products.',
    hoverBorder: 'glow-border-cyan',
    cardBg: 'from-cyan-500/5 via-zinc-950/20 to-transparent border-cyan-500/10',
    iconColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10',
  },
];

interface WelcomeScreenProps {
  onSuggestionClick: (query: string) => void;
  disabled?: boolean;
}

export function WelcomeScreen({ onSuggestionClick, disabled }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 text-center select-none">
      {/* Premium Badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/5 px-4 py-1.5 text-xs font-semibold text-rose-300/95 shadow-md backdrop-blur-md"
      >
        <Sparkles className="h-3.5 w-3.5 animate-pulse text-rose-400" />
        <span>Next Generation DB Interface</span>
      </motion.div>

      {/* Pulsing AI Core Graphic */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-8"
      >
        {/* Rotating outer orbital rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-5 rounded-full border border-dashed border-rose-500/15"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-8 rounded-full border border-dashed border-cyan-500/10"
        />

        {/* Glow center */}
        <div className="absolute inset-0 rounded-full bg-rose-500/10 blur-3xl animate-glow-pulse" />

        {/* Glossy Spherical Badge */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-rose-500/25 bg-gradient-to-b from-rose-950/40 via-zinc-950/90 to-black/95 shadow-2xl backdrop-blur-xl">
          <DatabaseZap className="h-10 w-10 text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]" />
          {/* Inner radar ping */}
          <div className="absolute inset-2 rounded-full border border-rose-500/10 animate-radar" />
        </div>
      </motion.div>

      {/* Main Slogan */}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5 }}
        className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-gradient-premium"
      >
        Ask your database
      </motion.h2>

      {/* Sub-text details */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8 max-w-sm text-sm leading-relaxed text-zinc-400"
      >
        Natural language in, SQL out. I execute queries securely and render tables inside the Right Panel dashboard.
      </motion.p>

      {/* Interactive recommendation list - single column format for split view */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.6 }}
        className="flex flex-col w-full max-w-sm gap-2.5"
      >
        {SUGGESTIONS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.06, duration: 0.4 }}
              disabled={disabled}
              onClick={() => onSuggestionClick(item.query)}
              className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br p-3.5 text-left transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 glass-card-premium ${item.cardBg} ${item.hoverBorder}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.badgeBg}`}>
                    <Icon className={`h-4 w-4 ${item.iconColor}`} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400 block transition-colors leading-none">
                      {item.label}
                    </span>
                    <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors block mt-1">
                      {item.query}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-600 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-rose-400" />
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
