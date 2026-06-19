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
    <div className="flex flex-1 flex-col overflow-hidden h-full bg-[#111113]">
      {/* Activity Header */}
      <div className="flex items-center justify-between border-b border-[#27272A] bg-[#09090B] px-4 py-2">
        <div className="flex items-center gap-2 text-[#A1A1AA]">
          <Terminal className="h-3.5 w-3.5 text-[#6366f1]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FAFAFA]">Activity Logs</span>
        </div>
        <div className="flex items-center gap-1.5 rounded border border-[#27272A] bg-[#111113] px-2 py-0.5 font-mono text-[9px] text-[#A1A1AA] font-bold">
          <History className="h-3 w-3 text-[#A1A1AA]" />
          <span>{logs.length} executed</span>
        </div>
      </div>

      {/* Main Console Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#111113]">
        {logs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded border border-[#27272A] bg-[#09090B] text-[#A1A1AA]">
              <Terminal className="h-4 w-4" />
            </div>
            <p className="text-[11px] font-bold text-[#FAFAFA] uppercase tracking-wider">No Activity Logged</p>
            <p className="max-w-xs text-[10px] text-[#A1A1AA] mt-1 leading-relaxed font-mono">
              Executed queries from your AI investigations will log parameters and latency stats here.
            </p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`overflow-hidden rounded border transition-all ${
                log.success ? 'border-[#27272A] bg-[#09090B]/30' : 'border-red-500/20 bg-red-500/5'
              }`}
            >
              {/* Header log status bar */}
              <div className="flex items-center justify-between gap-2 border-b border-[#27272A]/70 px-3 py-1.5 bg-[#09090B]/60">
                <div className="flex items-center gap-2 text-[9px] font-mono font-bold">
                  <span className="text-[#A1A1AA]">{log.timestamp}</span>
                  <span className="text-[#27272A]">•</span>
                  {log.success ? (
                    <span className="text-emerald-400 uppercase tracking-widest text-[8px] bg-emerald-500/10 px-1 rounded">
                      Success
                    </span>
                  ) : (
                    <span className="text-red-400 uppercase tracking-widest text-[8px] bg-red-500/10 px-1 rounded">
                      Exception
                    </span>
                  )}
                  {log.count !== undefined && (
                    <>
                      <span className="text-[#27272A]">•</span>
                      <span className="text-[#A1A1AA] font-normal">{log.count} rows</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(log.query, index)}
                    className="flex h-5 items-center gap-1 rounded border border-[#27272A] bg-[#161619] px-2 text-[8px] font-mono font-bold text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A] cursor-pointer"
                    title="Copy query code"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="h-2 w-2 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => onLoadQuery(log.query)}
                    className="flex h-5 items-center gap-1 rounded border border-[#27272A] bg-[#161619] px-2 text-[8px] font-mono font-bold text-[#6366f1] hover:text-white hover:bg-[#6366f1] cursor-pointer"
                    title="Load into capsule editor"
                  >
                    <span>Run</span>
                  </button>
                </div>
              </div>

              {/* Code display */}
              <div className="p-3.5 bg-[#0c0c0f] font-mono text-[10px] leading-relaxed text-[#FAFAFA] overflow-x-auto select-text">
                <pre>{log.query}</pre>
              </div>

              {/* Exception details */}
              {!log.success && log.error && (
                <div className="border-t border-[#27272A] bg-red-500/[0.02] px-3.5 py-2 text-[9px] font-mono text-red-400 leading-relaxed select-text">
                  <span className="font-bold uppercase tracking-wider block mb-0.5 text-red-300">Exception trace:</span>
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
