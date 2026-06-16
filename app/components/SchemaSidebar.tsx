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
  open?: boolean;
  onToggle?: () => void;
  inline?: boolean;
}

export function SchemaSidebar({ open = true, onToggle, inline = false }: SchemaSidebarProps) {
  const [tables, setTables] = useState<SchemaTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [copiedTable, setCopiedTable] = useState<string | null>(null);

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

  if (!inline && !open) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-20 z-40 flex h-10 w-10 items-center justify-center rounded-xl glass-panel-premium text-zinc-400 transition-all duration-300 hover:text-white hover:border-rose-500/30 hover:shadow-lg hover:shadow-rose-500/5"
        title="Show schema"
      >
        <PanelLeftOpen className="h-4 w-4" />
      </button>
    );
  }

  const content = (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20">
            <Database className="h-4 w-4 text-rose-500 animate-pulse" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white">Database Schema</p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Metadata Pipeline</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchSchema}
            disabled={loading}
            className="group rounded-lg p-1.5 text-zinc-500 transition-all hover:bg-white/5 hover:text-zinc-300 active:scale-95"
            title="Refresh schema"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-180', loading && 'animate-spin')} />
          </button>
          {!inline && onToggle && (
            <button
              onClick={onToggle}
              className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
              title="Hide schema"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-xs text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
            <span>Scanning tables...</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && tables.map((table) => {
          const columns = parseColumns(table.definition);
          const isExpanded = expanded[table.name];

          return (
            <div
              key={table.name}
              className={cn(
                'overflow-hidden rounded-xl border border-white/5 bg-zinc-950/30 transition-all duration-300',
                isExpanded ? 'border-rose-500/10 bg-rose-500/[0.01]' : 'hover:border-white/10'
              )}
            >
              <button
                onClick={() => setExpanded((prev) => ({ ...prev, [table.name]: !prev[table.name] }))}
                className="flex w-full items-center gap-2 px-3 py-3 text-left transition-colors hover:bg-white/[0.02]"
              >
                <Table2 className={cn('h-4 w-4 shrink-0 transition-colors', isExpanded ? 'text-rose-500' : 'text-zinc-500')} />
                <span className="flex-1 truncate font-mono text-[11px] font-bold tracking-wide text-zinc-300 group-hover:text-white">
                  {table.name}
                </span>
                <span className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[9px] font-bold text-zinc-500">
                  {columns.length}
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-zinc-500" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-zinc-500" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-white/5 bg-black/20 px-3 py-2 space-y-1">
                  <div className="flex items-center justify-between mb-1.5 border-b border-white/5 pb-1">
                    <span className="text-[9px] font-bold text-rose-400/80 tracking-widest uppercase">Schema Fields</span>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await navigator.clipboard.writeText(table.definition);
                        setCopiedTable(table.name);
                        setTimeout(() => setCopiedTable(null), 2000);
                      }}
                      className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-rose-400 bg-white/5 border border-white/5 rounded-md px-1.5 py-0.5 transition-colors"
                      title="Copy full DDL script"
                    >
                      {copiedTable === table.name ? 'Copied DDL!' : 'Copy DDL'}
                    </button>
                  </div>
                  {columns.map((col) => (
                    <div
                      key={col}
                      className="group flex items-center justify-between py-1 font-mono text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-3 w-3 text-zinc-700 group-hover:text-rose-400/70 transition-colors" />
                        <span>{col}</span>
                      </div>
                      <span className="opacity-0 group-hover:opacity-100 text-[8px] uppercase tracking-widest text-rose-400/80 transition-opacity font-sans font-bold">
                        field
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/5 p-3.5 bg-black/10">
        <p className="text-center text-[10px] font-bold uppercase tracking-wider text-zinc-600 whitespace-nowrap truncate">
          {tables.length} table{tables.length !== 1 ? 's' : ''} · Read-Only Mode
        </p>
      </div>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex h-full w-72 shrink-0 flex-col border-r border-white/5 glass-panel-premium z-20"
    >
      {content}
    </motion.aside>
  );
}
