'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, isToolUIPart, getToolName } from 'ai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Background } from '@/app/components/Background';
import { GlobalHeader } from '@/app/components/GlobalHeader';
import { ChatInput } from '@/app/components/ChatInput';
import { ChatMessage } from '@/app/components/ChatMessage';
import { SchemaSidebar } from '@/app/components/SchemaSidebar';
import { WelcomeScreen } from '@/app/components/WelcomeScreen';
import { ResultSpreadsheet } from '@/app/components/ResultSpreadsheet';
import { AlertTriangle, MessageSquare, Database, Table } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [input, setInput] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [activeTab, setActiveTab] = useState<'schema' | 'explorer'>('schema');
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'schema' | 'explorer'>('chat');
  const [desktopFocus, setDesktopFocus] = useState<'split' | 'chat-focus' | 'workspace-focus'>('split');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');

  const selectedModelRef = useRef(selectedModel);
  useEffect(() => {
    selectedModelRef.current = selectedModel;
  }, [selectedModel]);

  const { messages, sendMessage, error, status, setMessages, stop } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: () => ({
        modelId: selectedModelRef.current,
      }),
    }),
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
  let activeQueryResult: any = null;

  messages.forEach((m) => {
    const msg = m as any;

    const processToolCall = (toolName: string, state: string, query: string, output: any, errorText?: string) => {
      if (toolName !== 'queryDatabase') return;
      if (!query) return;

      const timestamp = msg.createdAt 
        ? new Date(msg.createdAt).toLocaleTimeString() 
        : new Date().toLocaleTimeString();

      if (state === 'result' || state === 'output-available') {
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
        const errorMsg = errorText || output?.error || 'Unknown execution error';
        const log = {
          query,
          success: false,
          error: errorMsg,
          timestamp,
        };
        queryLogs.push(log);
        activeQueryResult = {
          query,
          success: false,
          error: errorMsg,
        };
      }
    };

    // 1. Process from toolInvocations (standard in Vercel AI SDK)
    if (msg.toolInvocations && msg.toolInvocations.length > 0) {
      msg.toolInvocations.forEach((part: any) => {
        const query = part.args?.query || part.input?.query;
        const state = part.state;
        const output = part.result || part.output;
        const errorText = part.error || part.errorText;
        processToolCall(part.toolName, state, query, output, errorText);
      });
    }

    // 2. Process from parts (Vercel AI SDK parts)
    if (msg.parts && msg.parts.length > 0) {
      msg.parts.forEach((part: any) => {
        if (isToolUIPart(part)) {
          const toolPart = part as any;
          const toolName = getToolName(toolPart);
          const query = toolPart.input?.query || toolPart.args?.query;
          const state = toolPart.state;
          const output = toolPart.result || toolPart.output;
          const errorText = toolPart.error || toolPart.errorText;
          processToolCall(toolName, state, query, output, errorText);
        }
      });
    }
  });

  // Automatically switch tab to Explorer Grid when a new query executes
  const lastQueryCountRef = useRef<number>(0);
  useEffect(() => {
    if (queryLogs.length === 0) {
      lastQueryCountRef.current = 0;
      return;
    }
    if (queryLogs.length > lastQueryCountRef.current) {
      lastQueryCountRef.current = queryLogs.length;
      setActiveTab('explorer');
      setActiveMobileTab('explorer'); // Switch mobile view automatically
    }
  }, [queryLogs.length]);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#020204] text-zinc-50 selection:bg-indigo-500/30 font-sans flex-col">
      <Background />

      <GlobalHeader
        messageCount={messages.length}
        status={status}
        onNewChat={handleNewChat}
        canNewChat={messages.length > 0 || isLoading}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        desktopFocus={desktopFocus}
        onFocusChange={setDesktopFocus}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setActiveMobileTab(tab);
        }}
        hasResults={!!activeQueryResult && activeQueryResult.success && !!activeQueryResult.rows && activeQueryResult.rows.length > 0}
      />

      <div className="relative z-10 flex h-[calc(100vh-56px)] w-full flex-col lg:flex-row pb-16 lg:pb-0">
        {/* LEFT COLUMN: Conversational AI panel */}
        <div className={cn(
          "flex-col border-r border-zinc-800 bg-zinc-950/25 backdrop-blur-md relative z-10 transition-all duration-500 ease-in-out min-h-0 h-full",
          // Mobile visibility
          activeMobileTab === 'chat' ? 'flex' : 'hidden lg:flex',
          // Desktop sizing
          desktopFocus === 'split' && "w-full lg:w-[40%] min-w-0 lg:min-w-[360px] max-w-none lg:max-w-[500px] lg:flex-none",
          desktopFocus === 'chat-focus' && "w-full lg:w-full lg:flex-1",
          desktopFocus === 'workspace-focus' && "hidden lg:hidden"
        )}>
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
                <div className="my-4 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400 backdrop-blur-sm">
                  <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-500" />
                  <div>
                    <p className="font-bold text-red-300 uppercase tracking-widest leading-none">System Warning</p>
                    <p className="mt-1.5 text-red-400/80 leading-relaxed">{error.message}</p>
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

        {/* RIGHT COLUMN: Database Workspace Dashboard */}
        <div className={cn(
          "flex-col min-h-0 h-full bg-zinc-950/10 backdrop-blur-sm overflow-hidden relative z-10 transition-all duration-500 ease-in-out",
          // Mobile visibility
          activeMobileTab !== 'chat' ? 'flex' : 'hidden lg:flex',
          // Desktop sizing
          desktopFocus === 'split' && "flex-1",
          desktopFocus === 'chat-focus' && "hidden lg:hidden",
          desktopFocus === 'workspace-focus' && "flex-1 w-full lg:w-full"
        )}>
          {/* Active Workspace View Panel */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className={cn("flex-1 flex-col overflow-hidden", activeMobileTab === 'schema' ? 'flex' : 'hidden lg:hidden', activeTab === 'schema' ? 'lg:flex' : 'lg:hidden')}>
              <SchemaSidebar inline open={true} />
            </div>
            <div className={cn("flex-1 flex-col overflow-hidden", activeMobileTab === 'explorer' ? 'flex' : 'hidden lg:hidden', activeTab === 'explorer' ? 'lg:flex' : 'lg:hidden')}>
              <ResultSpreadsheet result={activeQueryResult} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 z-50 mobile-bottom-nav flex lg:hidden items-center justify-around px-2 py-1">
        {[
          { tab: 'chat', label: 'Chat', icon: MessageSquare },
          { tab: 'schema', label: 'Schema', icon: Database },
          { tab: 'explorer', label: 'Results', icon: Table },
        ].map(({ tab, label, icon: Icon }) => {
          const isActive = activeMobileTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveMobileTab(tab as any);
                if (tab !== 'chat') {
                  setActiveTab(tab as any);
                }
              }}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer flex-1 border border-transparent',
                isActive ? 'tab-active-glow text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              <span className="text-[9px] font-extrabold uppercase tracking-wider">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
