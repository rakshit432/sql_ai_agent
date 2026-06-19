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
  activeQuery?: string;
}

export function SchemaSidebar({ open = true, onToggle, inline = false, activeQuery }: SchemaSidebarProps) {
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

  if (!open && !inline) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-20 z-40 flex h-8 w-8 items-center justify-center rounded border border-[#27272A] bg-[#111113] text-[#A1A1AA] hover:text-[#FAFAFA] cursor-pointer"
        title="Show database schema"
      >
        <PanelLeftOpen className="h-4 w-4" />
      </button>
    );
  }

  const content = (
    <div className="flex h-full w-full flex-col bg-[#111113]">
      <div className="flex items-center justify-between border-b border-[#27272A] px-4 py-3 bg-[#09090B]">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-[#A1A1AA]" />
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FAFAFA]">Database Schema</p>
            <p className="text-[8px] font-mono text-[#A1A1AA] uppercase tracking-wider leading-none mt-0.5">Directory list</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchSchema}
            disabled={loading}
            className="rounded p-1 text-[#A1A1AA] hover:bg-zinc-900/40 hover:text-white transition-colors cursor-pointer"
            title="Refresh schema"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </button>
          {!inline && onToggle && (
            <button
              onClick={onToggle}
              className="rounded p-1 text-[#A1A1AA] hover:bg-zinc-900/40 hover:text-white transition-colors cursor-pointer"
              title="Hide schema"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 select-none">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-xs text-[#A1A1AA] font-mono">
            <Loader2 className="h-4 w-4 animate-spin text-[#6366f1]" />
            <span>Scanning tables...</span>
          </div>
        )}

        {error && (
          <div className="rounded border border-red-500/20 bg-red-500/5 p-3 text-[10px] font-mono text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && tables.map((table) => {
          const columns = parseColumns(table.definition);
          const isExpanded = expanded[table.name];

          // Substring regex match to see if table is mentioned in activeQuery
          const isTableActive = activeQuery
            ? new RegExp(`\\b${table.name}\\b`, 'i').test(activeQuery)
            : false;

          return (
            <div
              key={table.name}
              className={cn(
                'overflow-hidden rounded border transition-all duration-150',
                isTableActive
                  ? 'border-[#6366f1]/50 bg-[#6366f1]/5'
                  : 'border-[#27272A] bg-[#09090B]/30'
              )}
            >
              <button
                onClick={() => setExpanded((prev) => ({ ...prev, [table.name]: !prev[table.name] }))}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-zinc-900/20 cursor-pointer"
              >
                <Table2 className={cn('h-3.5 w-3.5 shrink-0', isTableActive ? 'text-[#6366f1]' : 'text-[#A1A1AA]')} />
                <span className="flex-1 truncate font-mono text-[11px] font-bold tracking-wide text-[#FAFAFA]">
                  {table.name}
                </span>
                
                {isTableActive && (
                  <span className="rounded bg-[#6366f1]/20 border border-[#6366f1]/30 px-1 py-0.2 text-[8px] font-bold text-[#6366f1] font-mono uppercase tracking-wider">
                    Active
                  </span>
                )}
                
                <span className="font-mono text-[9px] text-[#A1A1AA]">
                  ({columns.length})
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-[#A1A1AA]" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-[#A1A1AA]" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-[#27272A]/50 bg-[#09090B]/50 px-3 py-2 space-y-1">
                  <div className="flex items-center justify-between mb-1 border-b border-[#27272A]/40 pb-1">
                    <span className="text-[8px] font-mono font-bold text-[#A1A1AA] uppercase tracking-wider">Fields</span>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await navigator.clipboard.writeText(table.definition);
                        setCopiedTable(table.name);
                        setTimeout(() => setCopiedTable(null), 2000);
                      }}
                      className="text-[8px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] hover:text-[#FAFAFA] bg-[#161619] border border-[#27272A] rounded px-1.5 py-0.5 cursor-pointer"
                    >
                      {copiedTable === table.name ? 'Copied' : 'DDL'}
                    </button>
                  </div>
                  {columns.map((col) => (
                    <div
                      key={col}
                      className="flex items-center justify-between py-0.5 font-mono text-[10px] text-[#A1A1AA] hover:text-[#FAFAFA]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#27272A] font-bold">•</span>
                        <span>{col}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#27272A] p-2 bg-[#09090B] text-center">
        <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA] whitespace-nowrap truncate">
          Schema: Read-Only
        </p>
      </div>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <motion.aside
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex h-full w-60 shrink-0 flex-col border-r border-[#27272A]"
    >
      {content}
    </motion.aside>
  );
}
