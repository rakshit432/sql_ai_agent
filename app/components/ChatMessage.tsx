'use client';

import { cn } from '@/lib/utils';
import { isToolUIPart } from 'ai';
import { motion } from 'framer-motion';
import { Check, Copy, Sparkles, User } from 'lucide-react';
import { useState } from 'react';
import { ToolCallResult } from './ToolCallResult';

function getMessageText(message: any): string {
  return (
    message.parts
      ?.filter((p: any) => p.type === 'text' && p.text)
      .map((p: any) => p.text)
      .join('\n\n') || ''
  );
}

function formatTime(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatMessage({ message, index }: { message: any; index: number }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const textContent = getMessageText(message);

  const handleCopy = async () => {
    if (!textContent) return;
    await navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className={cn('group flex w-full py-4', isUser ? 'justify-end' : 'justify-start')}
    >
      <div className={cn('flex max-w-[88%] gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <div
          className={cn(
            'mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-sm',
            isUser
              ? 'border-zinc-700/60 bg-zinc-800/80 text-zinc-400'
              : 'border-indigo-500/30 bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-500/20'
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <div className={cn('flex items-center gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}>
            <span
              className={cn(
                'text-[11px] font-bold uppercase tracking-widest',
                isUser ? 'text-zinc-500' : 'text-indigo-400'
              )}
            >
              {isUser ? 'You' : 'Nexus Agent'}
            </span>
            <span className="text-[10px] text-zinc-600">{formatTime(message.createdAt)}</span>
          </div>

          <div
            className={cn(
              'relative rounded-2xl px-5 py-4 text-[15px] leading-relaxed',
              isUser
                ? 'rounded-tr-sm border border-zinc-700/40 bg-zinc-800/60 text-zinc-100'
                : 'rounded-tl-sm border border-white/5 bg-zinc-900/60 text-zinc-200 backdrop-blur-sm'
            )}
          >
            {!isUser && textContent && (
              <button
                onClick={handleCopy}
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-black/40 text-zinc-500 opacity-0 transition-all hover:text-zinc-200 group-hover:opacity-100"
                title="Copy response"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            )}

            {message.parts?.map((part: any, i: number) => {
              if (part.type === 'text') {
                if (!part.text) {
                  return (
                    <div key={i} className="flex items-center gap-1.5 text-zinc-500">
                      <span className="flex gap-1">
                        {[0, 1, 2].map((dot) => (
                          <span
                            key={dot}
                            className="h-1.5 w-1.5 rounded-full bg-indigo-400"
                            style={{
                              animation: `typing-dot 1.2s ease-in-out ${dot * 0.2}s infinite`,
                            }}
                          />
                        ))}
                      </span>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  );
                }

                return (
                  <div key={i} className="prose prose-invert max-w-none prose-p:leading-relaxed">
                    <p className="whitespace-pre-wrap">{part.text}</p>
                  </div>
                );
              }

              if (isToolUIPart(part)) {
                return <ToolCallResult key={part.toolCallId || i} toolPart={part} />;
              }

              return null;
            })}

            {(!message.parts || message.parts.length === 0) && (
              <div className="flex items-center gap-1.5 text-zinc-500">
                <span className="flex gap-1">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-1.5 w-1.5 rounded-full bg-indigo-400"
                      style={{
                        animation: `typing-dot 1.2s ease-in-out ${dot * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </span>
                <span className="text-sm">Thinking...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
