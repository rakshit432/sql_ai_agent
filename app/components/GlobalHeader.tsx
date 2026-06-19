'use client';

import { cn } from '@/lib/utils';
import { 
  MessageSquarePlus, 
  MessageSquare, 
  Columns, 
  Database,
  Table,
  Check
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
    <header className="relative z-50 h-12 w-full border-b border-[#27272A] bg-[#111113] px-4">
      <div className="flex h-full items-center justify-between">
        {/* Left Section: Brand & Core Model selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded border border-[#27272A] bg-[#09090B]">
              <Database className="h-4 w-4 text-[#A1A1AA]" />
            </div>
            <h1 className="font-display text-[11px] font-bold uppercase tracking-wider text-[#FAFAFA]">
              Nexus Workspace
            </h1>
          </div>
          
          <div className="h-4 w-[1px] bg-[#27272A]" />

          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-[#A1A1AA] font-mono">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="bg-transparent text-[#6366f1] font-mono font-bold cursor-pointer hover:text-indigo-400 focus:outline-none border-none p-0 pr-1 m-0 text-[10px]"
            >
              <option value="gemini-2.5-flash" className="bg-[#111113] text-[#FAFAFA]">Gemini 2.5 Flash</option>
              <option value="qwen/qwen3-32b" className="bg-[#111113] text-[#FAFAFA]">Qwen3 32B</option>
              <option value="openai/gpt-oss-120b" className="bg-[#111113] text-[#FAFAFA]">GPT-OSS 120B</option>
            </select>
          </div>

          <div className="h-4 w-[1px] bg-[#27272A]" />

          <div className={cn(
            "flex items-center gap-1.5 rounded px-2 py-0.5 text-[9px] font-mono border",
            dbStatus === 'online' 
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
              : "border-[#27272A] bg-zinc-900 text-[#A1A1AA]"
          )}>
            <span className={cn(
              "h-1 w-1 rounded-full",
              dbStatus === 'online' ? "bg-emerald-400 animate-pulse-subtle" : "bg-zinc-650"
            )} />
            <span className="uppercase tracking-wider font-bold">
              {dbStatus === 'online' ? 'Turso DB' : 'Checking'}
            </span>
          </div>
        </div>

        {/* Center Section: Workspace Navigation Tabs (Visible on Desktop) */}
        <div className="hidden lg:flex items-center gap-1 bg-[#09090B] p-0.5 rounded border border-[#27272A]">
          {[
            { id: 'schema', label: 'Database Inspector', icon: Database },
            { id: 'explorer', label: 'Evidence Grid', icon: Table },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as 'schema' | 'explorer')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all rounded cursor-pointer font-display border',
                  isActive
                    ? 'bg-[#111113] text-[#FAFAFA] border-[#27272A] shadow-sm font-extrabold'
                    : 'text-[#A1A1AA] hover:text-[#FAFAFA] border-transparent hover:bg-zinc-900/30'
                )}
              >
                <TabIcon className="h-3.5 w-3.5 text-[#A1A1AA]" />
                <span>{tab.label}</span>
                {tab.id === 'explorer' && hasResults && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1] inline-block shadow-[0_0_4px_rgba(99,102,241,0.6)]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Section: Focus Layout controllers & New Chat */}
        <div className="flex items-center gap-3">
          {/* Desktop Layout Selectors (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center bg-[#09090B] p-0.5 rounded border border-[#27272A]">
            {[
              { id: 'chat-focus', label: 'Investigation Panel Only', icon: MessageSquare },
              { id: 'split', label: 'Split Workspace', icon: Columns },
              { id: 'workspace-focus', label: 'Data Panel Only', icon: Database },
            ].map((layout) => {
              const isActive = desktopFocus === layout.id;
              const LayoutIcon = layout.icon;

              return (
                <button
                  key={layout.id}
                  onClick={() => onFocusChange(layout.id as any)}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded transition-all cursor-pointer border',
                    isActive
                      ? 'bg-[#111113] text-[#6366f1] border-[#27272A]'
                      : 'text-[#A1A1AA] hover:text-[#FAFAFA] border-transparent hover:bg-[#111113]/40'
                  )}
                  title={layout.label}
                >
                  <LayoutIcon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>

          {/* New Investigation Button */}
          <button
            onClick={onNewChat}
            disabled={!canNewChat}
            className={cn(
              'group flex items-center gap-1.5 rounded border px-3 py-1.5 text-[10px] font-bold transition-all uppercase tracking-wider font-display cursor-pointer',
              canNewChat
                ? 'border-[#27272A] bg-[#161619] text-[#FAFAFA] hover:bg-[#27272A] hover:text-white'
                : 'cursor-not-allowed border-[#27272A]/40 text-[#A1A1AA]/40 bg-transparent'
            )}
            title="Start a new database investigation"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>New Investigation</span>
          </button>
        </div>
      </div>
    </header>
  );
}
