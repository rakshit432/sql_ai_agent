'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Background } from '@/app/components/Background';
import { ChatHeader } from '@/app/components/ChatHeader';
import { ChatInput } from '@/app/components/ChatInput';
import { ChatMessage } from '@/app/components/ChatMessage';
import { SchemaSidebar } from '@/app/components/SchemaSidebar';
import { WelcomeScreen } from '@/app/components/WelcomeScreen';
import { WorkspaceConsole } from '@/app/components/WorkspaceConsole';
import { ResultSpreadsheet } from '@/app/components/ResultSpreadsheet';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [input, setInput] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [activeTab, setActiveTab] = useState<'schema' | 'console' | 'explorer'>('schema');
  const [mobileView, setMobileView] = useState<'chat' | 'workspace'>('chat');

  const { messages, sendMessage, error, status, setMessages, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const mainRef = useRef<HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const handleScroll = () => {
      const distanceFromBottom = main.scrollHeight - main.scrollTop - main.clientHeight;
      setShowScrollButton(distanceFromBottom > 200);
    };

    main.addEventListener('scroll', handleScroll);
    return () => main.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const handleSuggestion = (query: string) => {
    if (isLoading) return;
    sendMessage({ text: query });
  };

  const handleNewChat = () => {
    if (isLoading) stop();
    setMessages([]);
    setInput('');
  };

  // Compute live SQL queries executed and query outputs
  const queryLogs: { query: string; success: boolean; count?: number; error?: string; timestamp: string }[] = [];
  let activeQueryResult: { query: string; success: boolean; rows?: any[]; count?: number; error?: string } | null = null;

  messages.forEach((m) => {
    m.parts?.forEach((part: any) => {
      if (part.type === 'tool-invocation' && part.toolName === 'queryDatabase') {
        const query = part.input?.query;
        const state = part.state;
        const timestamp = (m as any).createdAt ? new Date((m as any).createdAt).toLocaleTimeString() : new Date().toLocaleTimeString();
        if (state === 'result' || state === 'output-available') {
          const output = part.result || part.output;
          const log = {
            query,
            success: output?.success ?? false,
            count: output?.count,
            error: output?.error,
            timestamp,
          };
          queryLogs.push(log);
          activeQueryResult = {
            query,
            success: output?.success ?? false,
            rows: output?.rows,
            count: output?.count,
            error: output?.error,
          };
        } else if (state === 'error' || state === 'output-error') {
          const errorMsg = part.error || part.errorText;
          queryLogs.push({
            query,
            success: false,
            error: errorMsg,
            timestamp,
          });
          activeQueryResult = {
            query,
            success: false,
            error: errorMsg,
          };
        }
      }
    });
  });

  // Automatically switch tab to Explorer Grid when a query executes
  const lastQueryRef = useRef<string | null>(null);
  useEffect(() => {
    if (activeQueryResult && activeQueryResult.query !== lastQueryRef.current) {
      lastQueryRef.current = activeQueryResult.query;
      setActiveTab('explorer');
      setMobileView('workspace'); // Shift view on mobile automatically
    }
  }, [activeQueryResult]);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#040406] text-zinc-50 selection:bg-rose-500/30 font-sans">
      <Background />

      <div className="relative z-10 flex h-full w-full flex-col lg:flex-row">
        {/* Mobile view selector */}
        <div className="flex lg:hidden items-center justify-center border-b border-white/5 bg-zinc-950/60 p-2 gap-1.5 relative z-20">
          <button
            onClick={() => setMobileView('chat')}
            className={cn(
              'px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300',
              mobileView === 'chat' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15 shadow-md' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            Chat Console
          </button>
          <button
            onClick={() => setMobileView('workspace')}
            className={cn(
              'px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300',
              mobileView === 'workspace' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15 shadow-md' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            Data Workspace
          </button>
        </div>

        {/* LEFT COLUMN: Conversational AI panel (width: 40%) */}
        <div className={cn(
          "w-full lg:w-[40%] min-w-0 lg:min-w-[360px] max-w-none lg:max-w-[500px] flex-col border-r border-white/5 bg-zinc-950/20 backdrop-blur-md flex-1 min-h-0 lg:h-full lg:flex-none relative z-10",
          mobileView === 'chat' ? 'flex' : 'hidden lg:flex'
        )}>
          <ChatHeader
            messageCount={messages.length}
            status={status}
            onNewChat={handleNewChat}
            canNewChat={messages.length > 0 || isLoading}
          />

          <main ref={mainRef} className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
            <div className="mx-auto flex min-h-full w-full flex-col">
              {messages.length === 0 ? (
                <WelcomeScreen onSuggestionClick={handleSuggestion} disabled={isLoading} />
              ) : (
                <div className="flex flex-col">
                  {messages.map((m, i) => (
                    <ChatMessage key={m.id} message={m} index={i} />
                  ))}
                </div>
              )}

              {error && (
                <div className="my-4 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-200 backdrop-blur-sm">
                  <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-400" />
                  <div>
                    <p className="font-bold text-rose-300 uppercase tracking-widest leading-none">System Warning</p>
                    <p className="mt-1.5 text-rose-200/80 leading-relaxed">{error.message}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          </main>

          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onStop={stop}
            showScrollButton={showScrollButton && messages.length > 0}
            onScrollToBottom={() => scrollToBottom()}
          />
        </div>

        {/* RIGHT COLUMN: Database Workspace Dashboard (width: 60%) */}
        <div className={cn(
          "flex-1 flex-col min-h-0 lg:h-full bg-[#040406]/35 backdrop-blur-sm overflow-hidden relative z-10",
          mobileView === 'workspace' ? 'flex' : 'hidden lg:flex'
        )}>
          {/* Workspace Tabs Header Bar */}
          <div className="flex items-center justify-between border-b border-white/5 bg-zinc-950/45 px-6 py-2.5">
            <div className="flex items-center gap-1.5">
              {(['schema', 'console', 'explorer'] as const).map((tab) => {
                let tabLabel = 'Schema Inspector';
                if (tab === 'console') tabLabel = 'SQL Logs';
                if (tab === 'explorer') tabLabel = 'Explorer Grid';
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'relative px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 rounded-lg',
                      isActive
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15 shadow-md'
                        : 'text-zinc-500 hover:text-zinc-300 border border-transparent hover:bg-white/[0.02]'
                    )}
                  >
                    {tabLabel}
                    {tab === 'explorer' && activeQueryResult && (
                      <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="hidden sm:block text-[9px] font-extrabold text-zinc-600 uppercase tracking-widest font-mono">
              Database Core Workspace
            </div>
          </div>

          {/* Active Workspace View Panel */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'schema' && (
              <SchemaSidebar inline open={true} />
            )}
            {activeTab === 'console' && (
              <WorkspaceConsole logs={queryLogs} onLoadQuery={(q) => setInput(q)} />
            )}
            {activeTab === 'explorer' && (
              <ResultSpreadsheet result={activeQueryResult} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
