'use client';

import { cn } from '@/lib/utils';
import { Loader2, MessageSquarePlus, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatusPill } from './StatusPill';
import type { ChatStatus } from 'ai';

interface ChatHeaderProps {
  messageCount: number;
  status: ChatStatus;
  onNewChat: () => void;
  canNewChat: boolean;
}

export function ChatHeader({ messageCount, status, onNewChat, canNewChat }: ChatHeaderProps) {
  const [dbStatus, setDbStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      try {
        const res = await fetch('/api/db-health');
        if (!cancelled) setDbStatus(res.ok ? 'online' : 'offline');
      } catch {
        if (!cancelled) setDbStatus('offline');
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/20 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 shadow-md shadow-rose-500/10 transition-transform duration-300 hover:scale-105">
            <span className="text-base font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">N</span>
            {/* Inner gloss effect */}
            <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-60" />
            <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 opacity-20 blur-sm" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-white sm:text-sm leading-none">
              Nexus DB Agent
            </h1>
            <p className="mt-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
              Gemini 2.5 Flash
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dbStatus === 'online' && (
            <div className="hidden items-center gap-1.5 rounded-full border border-white/5 bg-zinc-950/60 px-2.5 py-1 text-[9px] font-bold text-zinc-500 uppercase tracking-widest md:flex animate-fade-in shadow-inner">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(255,42,95,0.6)]" />
              <span>Ping: 12ms</span>
            </div>
          )}

          <button
            onClick={onNewChat}
            disabled={!canNewChat}
            className={cn(
              'group flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-bold transition-all duration-300 uppercase tracking-wider',
              canNewChat
                ? 'border-white/5 bg-white/5 text-zinc-300 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-white hover:shadow-lg hover:shadow-rose-500/5'
                : 'cursor-not-allowed border-white/5 text-zinc-700 bg-transparent'
            )}
            title="Start a new conversation"
          >
            <MessageSquarePlus className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
            <span>New Chat</span>
          </button>
        </div>
      </div>
    </header>
  );
}
