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
    color = 'text-violet-400';
    bg = 'bg-violet-500/10';
    accentBorder = 'border-violet-500/20';
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
        'my-3 overflow-hidden rounded-xl border bg-black/40 shadow-sm transition-all',
        accentBorder,
        !isPending && 'hover:border-white/15'
      )}
    >
      <button
        onClick={() => !isPending && setExpanded(!expanded)}
        className={cn(
          'flex w-full items-center justify-between p-3 text-left transition-colors',
          bg,
          !isPending && 'cursor-pointer hover:bg-white/5'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-black/50',
              color
            )}
          >
            {isPending ? (
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-current" />
              </span>
            ) : (
              <Icon className="h-4 w-4" />
            )}
          </div>
          <div>
            <p className={cn('text-sm font-semibold', color)}>{label}</p>
            {!isPending && result && (
              <p className="mt-0.5 text-xs text-zinc-500">
                {isQueryTool && result.success && `${result.count} row${result.count !== 1 ? 's' : ''} returned`}
                {isSchemaTool && result.success && `${result.schema?.length || 0} tables found`}
                {!result.success && <span className="text-red-400">Failed</span>}
              </p>
            )}
          </div>
        </div>

        {!isPending && (
          <ChevronRight
            className={cn(
              'h-4 w-4 text-zinc-500 transition-transform duration-200',
              expanded && 'rotate-90'
            )}
          />
        )}
      </button>

      {expanded && !isPending && result && (
        <div className="border-t border-white/5 bg-zinc-950/80 p-4">
          {isQueryTool && sqlQuery && (
            <div className="relative mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  SQL
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
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
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
                    >
                      <Download className="h-3 w-3" />
                      CSV
                    </button>
                  )}
                </div>
              </div>
              <pre className="overflow-x-auto rounded-lg border border-violet-500/20 bg-black/60 p-3 font-mono text-xs leading-relaxed text-violet-300">
                {sqlQuery}
              </pre>
            </div>
          )}

          {result.success ? (
            <div className="text-sm text-zinc-300">
              {isQueryTool && Array.isArray(result.rows) && result.rows.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5">
                        {Object.keys(result.rows[0]).map((col) => (
                          <th
                            key={col}
                            className="whitespace-nowrap px-4 py-2.5 font-semibold text-zinc-400"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {result.rows.slice(0, 10).map((row, i) => (
                        <tr key={i} className="transition-colors hover:bg-white/[0.03]">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="whitespace-nowrap px-4 py-2 text-zinc-300">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {result.rows.length > 10 && (
                    <div className="border-t border-white/5 bg-white/[0.02] p-2 text-center text-[11px] text-zinc-600">
                      Showing 10 of {result.rows.length} rows
                    </div>
                  )}
                </div>
              ) : (
                <pre className="max-h-60 overflow-auto rounded-lg bg-black/60 p-3 font-mono text-[10px] text-zinc-500">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{result.error || 'An unknown error occurred'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
