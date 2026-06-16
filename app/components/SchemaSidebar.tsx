'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  Database,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Table2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type SchemaTable = {
  name: string;
  definition: string;
};

function parseColumns(definition: string): string[] {
  const match = definition.match(/\(([\s\S]+)\)/);
  if (!match) return [];

  return match[1]
    .split(',')
    .map((col) => col.trim().split(/\s+/)[0].replace(/[`"']/g, ''))
    .filter((col) => col && !col.startsWith('FOREIGN') && !col.startsWith('PRIMARY'));
}

interface SchemaSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function SchemaSidebar({ open, onToggle }: SchemaSidebarProps) {
  const [tables, setTables] = useState<SchemaTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchSchema = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/schema');
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to load schema');
      setTables(data.tables);
      setExpanded(Object.fromEntries(data.tables.map((t: SchemaTable) => [t.name, true])));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load schema');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  if (!open) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-20 z-40 flex h-10 w-10 items-center justify-center rounded-xl glass-panel text-zinc-400 transition-all hover:text-white hover:glow-border"
        title="Show schema"
      >
        <PanelLeftOpen className="h-4 w-4" />
      </button>
    );
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex h-full w-72 shrink-0 flex-col border-r border-white/5 glass-panel"
    >
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20">
            <Database className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Schema</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Live from DB</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchSchema}
            disabled={loading}
            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
            title="Refresh schema"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </button>
          <button
            onClick={onToggle}
            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
            title="Hide schema"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading tables...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && tables.map((table) => {
          const columns = parseColumns(table.definition);
          const isExpanded = expanded[table.name];

          return (
            <div key={table.name} className="mb-2 overflow-hidden rounded-xl border border-white/5 bg-black/30">
              <button
                onClick={() => setExpanded((prev) => ({ ...prev, [table.name]: !prev[table.name] }))}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
              >
                <Table2 className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                <span className="flex-1 truncate font-mono text-xs font-medium text-zinc-200">
                  {table.name}
                </span>
                <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-500">
                  {columns.length}
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-zinc-500" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-zinc-500" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-white/5 px-3 py-2">
                  {columns.map((col) => (
                    <div
                      key={col}
                      className="flex items-center gap-2 py-1 font-mono text-[11px] text-zinc-500"
                    >
                      <BarChart3 className="h-2.5 w-2.5 text-zinc-600" />
                      {col}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/5 p-3">
        <p className="text-center text-[10px] text-zinc-600">
          {tables.length} table{tables.length !== 1 ? 's' : ''} · read-only
        </p>
      </div>
    </motion.aside>
  );
}
