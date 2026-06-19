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
    <div className="relative border-t border-[#27272A] bg-[#111113] p-4">
      {showScrollButton && onScrollToBottom && (
        <button
          onClick={onScrollToBottom}
          className="absolute -top-3.5 left-1/2 z-50 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border border-[#27272A] bg-[#09090B] text-[#A1A1AA] hover:text-[#FAFAFA] transition-all cursor-pointer shadow"
          title="Scroll to bottom"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
      )}

      <form onSubmit={onSubmit} className="mx-auto max-w-3xl">
        <div className="relative rounded border border-[#27272A] bg-[#09090B] focus-within:border-[#6366f1]/40 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            className="w-full resize-none bg-transparent px-4 py-3 pr-24 text-[13px] leading-relaxed text-[#FAFAFA] placeholder-[#A1A1AA]/50 focus:outline-none font-sans"
            value={input}
            placeholder="Run new database investigation query..."
            onChange={(e) => setInput(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />

          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            {isLoading && onStop ? (
              <button
                type="button"
                onClick={onStop}
                className="inline-flex h-7 w-7 items-center justify-center rounded border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 cursor-pointer"
                title="Stop executing"
              >
                <Square className="h-3 w-3 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded transition-all border cursor-pointer',
                  !input.trim() || isLoading
                    ? 'bg-[#111113] border-[#27272A] text-[#A1A1AA]/45'
                    : 'bg-[#6366f1] border-indigo-500 text-white hover:bg-indigo-500'
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Send className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[9px] font-mono text-[#A1A1AA] uppercase tracking-wider hidden sm:flex">
          <div className="flex items-center gap-2">
            <span>[Enter] Submit</span>
            <span className="text-[#27272A]">•</span>
            <span>[Shift+Enter] New Line</span>
          </div>
          <span className="text-[#6366f1] font-bold">Safe SELECT Interceptor Active</span>
        </div>
      </form>
    </div>
  );
}
