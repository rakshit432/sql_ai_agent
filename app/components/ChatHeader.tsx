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
    <header className="sticky top-0 z-50 border-b border-white/5 glass-panel">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <span className="text-lg font-black text-white">N</span>
            <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 opacity-30 blur-sm" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
              Nexus DB Agent
            </h1>
            <p className="text-[11px] font-medium text-zinc-500">
              Gemini 2.5 Flash · SQL Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <StatusPill status={status} />

          <div className="hidden items-center gap-2 rounded-full border border-white/5 bg-black/30 px-3 py-1.5 text-xs text-zinc-500 sm:flex">
            {dbStatus === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
            {dbStatus === 'online' && <Wifi className="h-3 w-3 text-emerald-400" />}
            {dbStatus === 'offline' && <WifiOff className="h-3 w-3 text-red-400" />}
            <span>
              {dbStatus === 'checking' && 'Checking DB...'}
              {dbStatus === 'online' && 'Turso connected'}
              {dbStatus === 'offline' && 'DB offline'}
            </span>
          </div>

          {messageCount > 0 && (
            <span className="hidden rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-500 md:inline">
              {messageCount} msg{messageCount !== 1 ? 's' : ''}
            </span>
          )}

          <button
            onClick={onNewChat}
            disabled={!canNewChat}
            className={cn(
              'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all',
              canNewChat
                ? 'border-white/10 bg-white/5 text-zinc-300 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white'
                : 'cursor-not-allowed border-white/5 text-zinc-600'
            )}
            title="Start a new conversation"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </div>
      </div>
    </header>
  );
}
