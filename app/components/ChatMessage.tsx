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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.25), ease: [0.16, 1, 0.3, 1] }}
      className={cn('group flex w-full py-4', isUser ? 'justify-end' : 'justify-start')}
    >
      <div className={cn('flex max-w-[85%] gap-3.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
        {/* Avatar container */}
        <div
          className={cn(
            'mt-1.5 flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl border transition-all duration-300',
            isUser
              ? 'border-white/5 bg-zinc-900 text-zinc-400'
              : 'border-rose-500/20 bg-gradient-to-br from-rose-500 via-amber-500 to-pink-500 text-white shadow-lg shadow-rose-500/10 hover:scale-105'
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4.5 w-4.5" />}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Header metadata */}
          <div className={cn('flex items-center gap-2.5 px-1', isUser ? 'flex-row-reverse' : 'flex-row')}>
            <span
              className={cn(
                'text-[10px] font-extrabold uppercase tracking-widest',
                isUser ? 'text-zinc-500' : 'text-rose-400 font-bold'
              )}
            >
              {isUser ? 'You' : 'Nexus Agent'}
            </span>
            <span className="text-[9px] font-medium text-zinc-600">{formatTime(message.createdAt)}</span>
          </div>

          {/* Bubble content */}
          <div
            className={cn(
              'relative rounded-2xl px-5 py-4 text-[14px] leading-relaxed shadow-xl border transition-all duration-300',
              isUser
                ? 'rounded-tr-none border-white/10 bg-zinc-900/40 text-zinc-100'
                : 'rounded-tl-none border-white/5 bg-zinc-950/40 text-zinc-200 backdrop-blur-md hover:border-rose-500/10'
            )}
          >
            {!isUser && textContent && (
              <button
                onClick={handleCopy}
                className="absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-zinc-900/60 text-zinc-500 opacity-0 transition-all hover:text-zinc-200 hover:border-white/10 group-hover:opacity-100"
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
                    <div key={i} className="flex items-center gap-2 text-zinc-500 py-1">
                      <span className="flex gap-1">
                        {[0, 1, 2].map((dot) => (
                          <span
                            key={dot}
                            className="h-1.5 w-1.5 rounded-full bg-rose-500"
                            style={{
                              animation: `typing-dot 1.2s ease-in-out ${dot * 0.2}s infinite`,
                            }}
                          />
                        ))}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider">Analyzing Schema...</span>
                    </div>
                  );
                }

                return (
                  <div key={i} className="prose prose-invert max-w-none prose-p:leading-relaxed">
                    <p className="whitespace-pre-wrap text-[14.5px] text-zinc-300 font-medium">{part.text}</p>
                  </div>
                );
              }

              if (isToolUIPart(part)) {
                return <ToolCallResult key={part.toolCallId || i} toolPart={part} />;
              }

              return null;
            })}

            {(!message.parts || message.parts.length === 0) && (
              <div className="flex items-center gap-2 text-zinc-500 py-1">
                <span className="flex gap-1">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-1.5 w-1.5 rounded-full bg-rose-500"
                      style={{
                        animation: `typing-dot 1.2s ease-in-out ${dot * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider">Thinking...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
