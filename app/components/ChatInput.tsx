'use client';

import { cn } from '@/lib/utils';
import { ArrowDown, Loader2, Send, Square } from 'lucide-react';
import { FormEvent, KeyboardEvent, useEffect, useRef } from 'react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  onStop?: () => void;
  showScrollButton?: boolean;
  onScrollToBottom?: () => void;
}

export function ChatInput({
  input,
  setInput,
  onSubmit,
  isLoading,
  onStop,
  showScrollButton,
  onScrollToBottom,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        e.currentTarget.form?.requestSubmit();
      }
    }
  };

  return (
    <div className="sticky bottom-0 z-40 bg-gradient-to-t from-[#060608] via-[#060608]/98 to-transparent px-4 pb-5 pt-8">
      {showScrollButton && onScrollToBottom && (
        <button
          onClick={onScrollToBottom}
          className="absolute -top-3 left-1/2 z-50 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-400 shadow-xl transition-all duration-300 hover:border-indigo-500/30 hover:text-indigo-300 hover:scale-110"
          title="Scroll to bottom"
        >
          <ArrowDown className="h-4.5 w-4.5" />
        </button>
      )}

      <form onSubmit={onSubmit} className="mx-auto max-w-3xl">
        <div className="relative rounded-2xl border border-white/5 bg-zinc-950/70 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 focus-within:border-indigo-500/30 focus-within:shadow-[0_16px_48px_-12px_rgba(99,102,241,0.15)] focus-within:ring-2 focus-within:ring-indigo-500/5">
          <textarea
            ref={textareaRef}
            rows={1}
            className="w-full resize-none bg-transparent px-5 py-4 pr-24 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            value={input}
            placeholder="Ask anything about your data..."
            onChange={(e) => setInput(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {isLoading && onStop ? (
              <button
                type="button"
                onClick={onStop}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 transition-all hover:bg-red-500/20 active:scale-95"
                title="Stop generating"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300',
                  !input.trim() || isLoading
                    ? 'bg-white/5 border border-white/5 text-zinc-700'
                    : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:scale-105 hover:shadow-indigo-500/40 active:scale-95'
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        <p className="mt-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-600 space-x-1">
          <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">Enter</kbd>
          <span>to send</span>
          <span>·</span>
          <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">Shift+Enter</kbd>
          <span>new line</span>
          <span>·</span>
          <span className="text-indigo-500/80 font-bold">read-only queries</span>
        </p>
      </form>
    </div>
  );
}
