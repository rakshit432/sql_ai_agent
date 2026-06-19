'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  TrendingUp,
  BarChart3,
  Package,
  Database,
} from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: TrendingUp,
    label: 'Revenue Analysis',
    query: 'What were our total sales last month?',
  },
  {
    icon: BarChart3,
    label: 'Regional Performance',
    query: 'Which region has the highest revenue?',
  },
  {
    icon: Package,
    label: 'Inventory Insights',
    query: 'Show me the top 5 most expensive products.',
  },
];

interface WelcomeScreenProps {
  onSuggestionClick: (query: string) => void;
  disabled?: boolean;
}

export function WelcomeScreen({ onSuggestionClick, disabled }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center select-none max-w-md mx-auto">
      {/* Icon Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-md"
      >
        <Database className="h-6 w-6 text-indigo-400" />
      </motion.div>

      {/* Slogan */}
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="mb-3 text-2xl font-bold tracking-tight text-zinc-100"
      >
        Query Database in Plain English
      </motion.h2>

      {/* Sub-text */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mb-8 text-sm leading-relaxed text-zinc-400"
      >
        Ask questions naturally. The AI translates prompts to SQL, executes the queries securely, and returns structured data tables.
      </motion.p>

      {/* Suggestions List */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex flex-col w-full gap-3"
      >
        {SUGGESTIONS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
              disabled={disabled}
              onClick={() => onSuggestionClick(item.query)}
              className="group flex w-full items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-3.5 text-left transition-all duration-200 hover:bg-zinc-900/50 hover:border-zinc-700 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-indigo-400 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block leading-none">
                    {item.label}
                  </span>
                  <span className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors block mt-1.5 truncate">
                    {item.query}
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-600 opacity-0 -translate-x-1.5 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-indigo-400 shrink-0 ml-2" />
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
