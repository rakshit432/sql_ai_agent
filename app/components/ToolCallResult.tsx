'use client';

import { cn } from '@/lib/utils';
import { getToolName } from 'ai';
import {
  AlertCircle,
  Check,
  ChevronRight,
  Copy,
  Database,
  Download,
  LayoutList,
  Search,
} from 'lucide-react';
import { useState } from 'react';

type ToolResult = {
  success?: boolean;
  count?: number;
  rows?: Record<string, unknown>[];
  schema?: unknown[];
  error?: string;
};

function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = val == null ? '' : String(val);
          return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
        })
        .join(',')
    ),
  ];
  return lines.join('\n');
}

export function ToolCallResult({ toolPart }: { toolPart: any }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const toolName = getToolName(toolPart);
  const isPending =
    toolPart.state === 'input-streaming' ||
    toolPart.state === 'input-available' ||
    toolPart.state === 'approval-requested' ||
    toolPart.state === 'approval-responded';

  const result: ToolResult | undefined =
    toolPart.state === 'output-available'
      ? (toolPart.output as ToolResult)
      : toolPart.state === 'output-error'
        ? { success: false, error: toolPart.errorText }
        : undefined;

  const isSchemaTool = toolName === 'getDatabaseSchema';
  const isQueryTool = toolName === 'queryDatabase';
  const sqlQuery = toolPart.input?.query as string | undefined;

  let Icon = Database;
  let label = 'Working...';
  let color = 'text-zinc-400';
  let bg = 'bg-zinc-800/50';
  let accentBorder = 'border-white/5';

  if (isSchemaTool) {
    Icon = LayoutList;
    label = isPending ? 'Fetching schema...' : 'Schema analyzed';
    color = 'text-cyan-400';
    bg = 'bg-cyan-500/10';
    accentBorder = 'border-cyan-500/20';
  } else if (isQueryTool) {
    Icon = Search;
    label = isPending ? 'Running SQL...' : 'Query executed';
    color = 'text-rose-400';
    bg = 'bg-rose-500/10';
    accentBorder = 'border-rose-500/20';
  }

  const handleCopySql = async () => {
    if (!sqlQuery) return;
    await navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    if (!result?.rows?.length) return;
    const csv = rowsToCsv(result.rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        'my-4 overflow-hidden rounded-2xl border bg-zinc-950/40 shadow-lg transition-all duration-300',
        accentBorder,
        !isPending && 'hover:border-white/10 hover:shadow-xl'
      )}
    >
      <button
        onClick={() => !isPending && setExpanded(!expanded)}
        className={cn(
          'flex w-full items-center justify-between p-3.5 text-left transition-colors',
          bg,
          !isPending && 'cursor-pointer hover:bg-white/[0.03]'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-black/40 shadow-md',
              color
            )}
          >
            {isPending ? (
              <span className="relative flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-current" />
              </span>
            ) : (
              <Icon className="h-4.5 w-4.5" />
            )}
          </div>
          <div>
            <p className={cn('text-xs font-bold uppercase tracking-wider', color)}>{label}</p>
            {!isPending && result && (
              <p className="mt-0.5 text-[11px] font-medium text-zinc-500">
                {isQueryTool && result.success && `${result.count} row${result.count !== 1 ? 's' : ''} returned`}
                {isSchemaTool && result.success && `${result.schema?.length || 0} tables found`}
                {!result.success && <span className="text-red-400 font-bold uppercase tracking-wide">Failed</span>}
              </p>
            )}
          </div>
        </div>

        {!isPending && (
          <ChevronRight
            className={cn(
              'h-4 w-4 text-zinc-500 transition-transform duration-300',
              expanded && 'rotate-90 text-rose-400'
            )}
          />
        )}
      </button>

      {expanded && !isPending && result && (
        <div className="border-t border-white/5 bg-zinc-950/90 p-4 space-y-4">
          {isQueryTool && sqlQuery && (
            <div className="relative">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                  SQL Pipeline Code
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-[10px] text-zinc-400 font-semibold tracking-wide transition-all hover:border-rose-500/20 hover:text-white"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    Copy
                  </button>
                  {result.rows && result.rows.length > 0 && (
                    <button
                      onClick={handleExportCsv}
                      className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-[10px] text-zinc-400 font-semibold tracking-wide transition-all hover:border-rose-500/20 hover:text-white"
                    >
                      <Download className="h-3 w-3" />
                      Export CSV
                    </button>
                  )}
                </div>
              </div>
              <pre className="overflow-x-auto rounded-xl border border-rose-500/15 bg-black/60 p-4 font-mono text-xs leading-relaxed text-rose-300/95 shadow-inner">
                {sqlQuery}
              </pre>
            </div>
          )}

          {result.success ? (
            <div className="text-sm text-zinc-300">
              {isQueryTool && Array.isArray(result.rows) && result.rows.length > 0 ? (
                <div className="rounded-xl border border-white/5 bg-zinc-950/60 p-4 text-center">
                  <p className="text-xs font-semibold text-zinc-400">
                    Query output sent to workspace dashboard.
                  </p>
                  <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mt-1.5 animate-pulse">
                    See Right Explorer Pane
                  </p>
                </div>
              ) : (
                <pre className="max-h-60 overflow-auto rounded-xl bg-black/50 p-4 font-mono text-[10px] text-zinc-500 leading-normal border border-white/5">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400 leading-relaxed">
              <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-500" />
              <div>
                <p className="font-bold uppercase tracking-wider text-red-300">Query Exception</p>
                <p className="mt-1 text-red-400/80">{result.error || 'An unknown database error occurred'}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
