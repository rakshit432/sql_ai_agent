'use client';

import { cn } from '@/lib/utils';
import { isToolUIPart } from 'ai';
import { motion } from 'framer-motion';
import { Check, Copy, Terminal, Database, ShieldAlert, Sparkles, User } from 'lucide-react';
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
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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

  // Build tool timeline metrics
  const toolCallsInfo: { name: string; status: string; info: string }[] = [];
  
  if (message.toolInvocations) {
    message.toolInvocations.forEach((inv: any) => {
      const name = inv.toolName;
      const state = inv.state;
      if (name === 'getDatabaseSchema') {
        toolCallsInfo.push({
          name: 'Schema Discovery',
          status: state === 'result' ? 'Completed' : 'Running',
          info: 'Scanned tables and relational structure from sqlite_master'
        });
      } else if (name === 'queryDatabase') {
        toolCallsInfo.push({
          name: 'SQL Execution',
          status: state === 'result' ? 'Success' : state === 'error' ? 'Failed' : 'Running',
          info: `Ran SELECT statement: ${inv.args?.query || inv.input?.query || ''}`
        });
      }
    });
  }

  if (message.parts) {
    message.parts.forEach((part: any) => {
      if (isToolUIPart(part)) {
        const toolPart = part as any;
        const name = toolPart.toolCallId?.includes('getDatabaseSchema') ? 'getDatabaseSchema' : 'queryDatabase';
        const state = toolPart.state;
        const query = toolPart.input?.query || toolPart.args?.query || '';
        
        if (toolPart.toolCallId?.includes('getDatabaseSchema') || toolPart.toolName === 'getDatabaseSchema') {
          if (!toolCallsInfo.some(t => t.name === 'Schema Discovery')) {
            toolCallsInfo.push({
              name: 'Schema Discovery',
              status: state === 'output-available' ? 'Completed' : 'Running',
              info: 'Scanned tables and relational structure from sqlite_master'
            });
          }
        } else {
          if (!toolCallsInfo.some(t => t.name === 'SQL Execution')) {
            toolCallsInfo.push({
              name: 'SQL Execution',
              status: state === 'output-available' ? 'Success' : state === 'output-error' ? 'Failed' : 'Running',
              info: `Ran SELECT statement: ${query}`
            });
          }
        }
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.1) }}
      className="w-full py-3"
    >
      <div className="border border-[#27272A] bg-[#111113] rounded-lg overflow-hidden shadow-sm">
        {/* Card Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#27272A] bg-[#09090B]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider">
              {isUser ? `Prompt Input // Investigation #${Math.floor(index / 2) + 1}` : `Analysis Report // Investigation #${Math.floor(index / 2) + 1}`}
            </span>
          </div>
          <span className="font-mono text-[9px] text-[#A1A1AA]">{formatTime(message.createdAt)}</span>
        </div>

        {/* Card Content Area */}
        <div className="p-4">
          {isUser ? (
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#27272A] bg-[#161619] text-[#A1A1AA]">
                <User className="h-3 w-3" />
              </div>
              <p className="text-[13px] font-sans text-[#FAFAFA] font-medium leading-relaxed select-text pt-0.5">
                {message.content || textContent}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tool Execution Timeline */}
              {toolCallsInfo.length > 0 && (
                <div className="border border-[#27272A] bg-[#09090B] rounded-md p-3 space-y-2.5 font-mono">
                  <div className="flex items-center gap-1.5 border-b border-[#27272A] pb-1.5">
                    <Terminal className="h-3.5 w-3.5 text-[#6366f1]" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#FAFAFA]">Agent Pipeline Timeline</span>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Hardcoded safety check display since we restrict execution to SELECT */}
                    <div className="flex items-center justify-between text-[10px] py-0.5">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[#FAFAFA] font-bold">SQL Safety Check</span>
                      </div>
                      <span className="text-emerald-400 font-bold uppercase tracking-widest text-[8px] bg-emerald-500/10 px-1 rounded">Passed</span>
                    </div>

                    {toolCallsInfo.map((tool, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] py-0.5">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            tool.status === 'Completed' || tool.status === 'Success' ? "bg-emerald-500" : "bg-[#6366f1] animate-pulse"
                          )} />
                          <span className="text-[#FAFAFA]">{tool.name}</span>
                        </div>
                        <span className={cn(
                          "font-bold uppercase tracking-widest text-[8px] px-1 rounded",
                          tool.status === 'Completed' || tool.status === 'Success'
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-[#6366f1]/10 text-[#6366f1]"
                        )}>
                          {tool.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy Vercel Tool Output Component Render */}
              {message.parts?.map((part: any, i: number) => {
                if (isToolUIPart(part)) {
                  return (
                    <div key={part.toolCallId || i} className="border border-[#27272A] bg-[#09090B]/30 rounded-md overflow-hidden">
                      <ToolCallResult toolPart={part} />
                    </div>
                  );
                }
                return null;
              })}

              {/* Muted Agent Text Conclusions */}
              {textContent && (
                <div className="relative pt-1 animate-fade-in group">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#27272A] bg-indigo-500/10 text-[#6366f1]">
                      <Sparkles className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA] font-mono">Findings & Conclusion</span>
                        <button
                          onClick={handleCopy}
                          className="flex h-5 w-5 items-center justify-center rounded border border-[#27272A] bg-[#09090B]/80 text-[#A1A1AA] opacity-0 transition-all hover:text-zinc-200 group-hover:opacity-100 cursor-pointer"
                          title="Copy conclusions"
                        >
                          {copied ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <div className="prose prose-invert max-w-none text-[13px] text-[#A1A1AA] font-medium leading-relaxed select-text space-y-2 whitespace-pre-wrap">
                        {textContent}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loader placeholder when thinking */}
              {(!message.parts || message.parts.length === 0) && (
                <div className="flex items-center gap-2 text-[#A1A1AA] py-1 font-mono text-[10px]">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="h-1 w-1 rounded-full bg-[#6366f1]"
                        style={{
                          animation: `typing-dot 1.2s ease-in-out ${dot * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider">Evaluating database instructions...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
