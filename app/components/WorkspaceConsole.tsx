'use client';

import { Check, Copy, History, Play, Terminal } from 'lucide-react';
import { useState } from 'react';

type QueryLog = {
  query: string;
  success: boolean;
  count?: number;
  error?: string;
  timestamp: string;
};

interface WorkspaceConsoleProps {
  logs: QueryLog[];
  onLoadQuery: (query: string) => void;
}

export function WorkspaceConsole({ logs, onLoadQuery }: WorkspaceConsoleProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (query: string, index: number) => {
    await navigator.clipboard.writeText(query);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden h-full">
      {/* Tab Header Stats */}
      <div className="flex items-center justify-between border-b border-white/5 bg-zinc-950/20 px-4 py-3">
        <div className="flex items-center gap-2 text-zinc-400">
          <Terminal className="h-4 w-4 text-rose-500" />
          <span className="text-xs font-bold uppercase tracking-wider font-sans">Query Execution Logs</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
          <History className="h-3 w-3" />
          <span>{logs.length} Queries run</span>
        </div>
      </div>

      {/* Main Console Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {logs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-600">
              <Terminal className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-zinc-400">No queries executed yet</p>
            <p className="max-w-xs text-xs text-zinc-600 mt-1 leading-relaxed">
              Queries parsed from your AI chat sessions will appear here as live console history logs.
            </p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`overflow-hidden rounded-xl border bg-zinc-950/30 transition-all duration-300 ${
                log.success ? 'border-white/5 hover:border-white/10' : 'border-rose-500/20 bg-rose-950/5'
              }`}
            >
              {/* Header log status bar */}
              <div className="flex items-center justify-between border-b border-white/5 px-3.5 py-2.5 bg-black/10">
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider font-mono">
                  <span className="text-zinc-500">{log.timestamp}</span>
                  <span>·</span>
                  {log.success ? (
                    <span className="text-emerald-400 font-sans uppercase font-extrabold text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Success
                    </span>
                  ) : (
                    <span className="text-rose-400 font-sans uppercase font-extrabold text-[9px] bg-rose-500/10 px-1.5 py-0.5 rounded animate-pulse">
                      Error
                    </span>
                  )}
                  {log.count !== undefined && (
                    <>
                      <span>·</span>
                      <span className="text-zinc-400 font-normal">{log.count} rows</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(log.query, index)}
                    className="flex h-6 items-center gap-1 rounded bg-white/5 border border-white/5 px-2 text-[9px] font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-white hover:border-white/10"
                    title="Copy query code"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="h-2.5 w-2.5 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-2.5 w-2.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => onLoadQuery(log.query)}
                    className="flex h-6 items-center gap-1 rounded bg-rose-500/10 border border-rose-500/15 px-2 text-[9px] font-bold uppercase tracking-wider text-rose-400 transition-all hover:bg-rose-500 hover:text-white active:scale-95"
                    title="Load into chat editor"
                  >
                    <Play className="h-2.5 w-2.5 fill-current" />
                    <span>Run</span>
                  </button>
                </div>
              </div>

              {/* Code display */}
              <div className="p-3 bg-zinc-950/20 font-mono text-[11px] leading-relaxed text-zinc-300 overflow-x-auto">
                <pre className="text-indigo-300/80">{log.query}</pre>
              </div>

              {/* Exception details */}
              {!log.success && log.error && (
                <div className="border-t border-rose-950 bg-rose-950/10 px-3.5 py-2 text-[10px] text-rose-300 font-mono leading-relaxed">
                  <span className="font-bold text-rose-400 uppercase tracking-widest block mb-0.5">Exception details:</span>
                  {log.error}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
