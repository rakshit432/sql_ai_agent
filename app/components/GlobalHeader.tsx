'use client';

import { cn } from '@/lib/utils';
import { 
  MessageSquarePlus, 
  MessageSquare, 
  Columns, 
  Database,
  Table
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ChatStatus } from 'ai';

interface GlobalHeaderProps {
  messageCount: number;
  status: ChatStatus;
  onNewChat: () => void;
  canNewChat: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
  desktopFocus: 'split' | 'chat-focus' | 'workspace-focus';
  onFocusChange: (focus: 'split' | 'chat-focus' | 'workspace-focus') => void;
  activeTab: 'schema' | 'explorer';
  onTabChange: (tab: 'schema' | 'explorer') => void;
  hasResults: boolean;
}

export function GlobalHeader({
  messageCount,
  status,
  onNewChat,
  canNewChat,
  selectedModel,
  onModelChange,
  desktopFocus,
  onFocusChange,
  activeTab,
  onTabChange,
  hasResults,
}: GlobalHeaderProps) {
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
    <header className="relative z-50 h-14 w-full border-b border-white/5 bg-zinc-950/40 backdrop-blur-md">
      <div className="flex h-full w-full items-center justify-between px-4 sm:px-6">
        {/* Left Section: Branding & Model selector */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center">
            {/* Ambient neon radial glow */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 opacity-20 blur-[4px] animate-pulse" />
            
            {/* Main logo frame */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950/90 shadow-md transition-all duration-300 hover:border-indigo-500/50">
              <svg viewBox="0 0 100 100" className="h-4.5 w-4.5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <path d="M20 28 C20 22, 80 22, 80 28 C80 34, 20 34, 20 28 Z" stroke="url(#logo-grad)" strokeWidth="6" strokeLinecap="round" />
                <path d="M20 48 C20 42, 80 42, 80 48 C80 54, 20 54, 20 48 Z" stroke="url(#logo-grad)" strokeWidth="6" strokeLinecap="round" />
                <path d="M20 68 C20 62, 80 62, 80 68 C80 74, 20 74, 20 68 Z" stroke="url(#logo-grad)" strokeWidth="6" strokeLinecap="round" />
                <path d="M50 38 L52 45 L59 47 L52 49 L50 56 L48 49 L41 47 L48 45 Z" fill="#ffffff" className="animate-pulse" />
              </svg>
            </div>
          </div>
          
          <div className="flex flex-col">
            <h1 className="font-display text-[11px] font-extrabold uppercase tracking-widest text-zinc-100 leading-none">
              Nexus DB Agent
            </h1>
            <div className="mt-0.5 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider leading-none">
              <span className="text-zinc-500">Core:</span>
              <select
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="bg-transparent text-indigo-400 font-extrabold cursor-pointer hover:text-indigo-300 transition-colors focus:outline-none border-none p-0 pr-1 m-0 text-[8px]"
              >
                <option value="gemini-2.5-flash" className="bg-zinc-950 text-zinc-300">Gemini 2.5 Flash</option>
                <option value="qwen/qwen3-32b" className="bg-zinc-950 text-zinc-300">Qwen3 32B</option>
                <option value="openai/gpt-oss-120b" className="bg-zinc-950 text-zinc-300">GPT-OSS 120B</option>
              </select>
            </div>
          </div>

          {dbStatus === 'online' && (
            <div className="hidden items-center gap-1 rounded-full border border-white/5 bg-white/[0.02] px-2 py-0.5 text-[8px] font-bold text-zinc-500 uppercase tracking-widest md:flex animate-fade-in shadow-inner">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
              <span>Turso Db</span>
            </div>
          )}
        </div>

        {/* Center Section: Workspace Navigation Tabs (Visible on Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 bg-zinc-900/40 p-1 rounded-xl border border-white/5">
          {[
            { id: 'schema', label: 'Schema Inspector', icon: Database },
            { id: 'explorer', label: 'Results Spreadsheet', icon: Table },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as 'schema' | 'explorer')}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider transition-all duration-200 rounded-lg cursor-pointer font-display',
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 shadow-sm border border-indigo-500/10'
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                )}
              >
                <TabIcon className="h-3 w-3" />
                <span>{tab.label}</span>
                {tab.id === 'explorer' && hasResults && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Section: Focus Layout controllers & New Chat */}
        <div className="flex items-center gap-2.5">
          {/* Desktop Layout Selectors (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-0.5 bg-zinc-900/40 p-0.5 rounded-xl border border-white/5">
            {[
              { id: 'chat-focus', label: 'Chat Focus', icon: MessageSquare },
              { id: 'split', label: 'Split View', icon: Columns },
              { id: 'workspace-focus', label: 'Workspace Focus', icon: Database },
            ].map((layout) => {
              const isActive = desktopFocus === layout.id;
              const LayoutIcon = layout.icon;

              return (
                <button
                  key={layout.id}
                  onClick={() => onFocusChange(layout.id as any)}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer border',
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10'
                      : 'text-zinc-500 hover:text-zinc-300 border-transparent hover:bg-zinc-800/10'
                  )}
                  title={layout.label}
                >
                  <LayoutIcon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            disabled={!canNewChat}
            className={cn(
              'group flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[9px] font-extrabold transition-all duration-300 uppercase tracking-wider font-display',
              canNewChat
                ? 'border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-white hover:shadow-lg hover:shadow-indigo-500/5'
                : 'cursor-not-allowed border-zinc-800/50 text-zinc-650 bg-transparent'
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
