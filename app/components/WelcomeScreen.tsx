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
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/40',
    iconColor: 'text-emerald-400',
  },
  {
    icon: BarChart3,
    label: 'Regions',
    query: 'Which region has the highest revenue?',
    color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40',
    iconColor: 'text-blue-400',
  },
  {
    icon: Package,
    label: 'Products',
    query: 'Show me the top 5 most expensive products.',
    color: 'from-violet-500/20 to-purple-500/10 border-violet-500/20 hover:border-violet-500/40',
    iconColor: 'text-violet-400',
  },
  {
    icon: Sparkles,
    label: 'Inventory',
    query: 'How many products are currently out of stock?',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40',
    iconColor: 'text-amber-400',
  },
];

interface WelcomeScreenProps {
  onSuggestionClick: (query: string) => void;
  disabled?: boolean;
}

export function WelcomeScreen({ onSuggestionClick, disabled }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative mb-10"
      >
        <div className="absolute inset-0 rounded-3xl bg-indigo-500/30 blur-3xl" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/20 to-violet-600/20 shadow-2xl glow-border">
          <DatabaseZap className="h-14 w-14 text-indigo-300" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-3 text-4xl font-extrabold tracking-tight sm:text-5xl text-gradient"
      >
        Ask your database anything
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-12 max-w-lg text-base leading-relaxed text-zinc-500"
      >
        Natural language in, SQL out. I inspect your schema, run safe read-only queries,
        and explain the results — no SQL knowledge required.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {SUGGESTIONS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              disabled={disabled}
              onClick={() => onSuggestionClick(item.query)}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/10 disabled:opacity-50 disabled:hover:scale-100 ${item.color}`}
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/30">
                  <Icon className={`h-4 w-4 ${item.iconColor}`} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  {item.label}
                </span>
              </div>
              <p className="text-sm font-medium leading-snug text-zinc-300">{item.query}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                Ask now <ArrowRight className="h-3 w-3" />
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
