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
import { AlertTriangle } from 'lucide-react';

export default function Home() {
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

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

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#030303] text-zinc-50 selection:bg-indigo-500/30">
      <Background />

      <div className="relative z-10 flex h-full w-full">
        <SchemaSidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <ChatHeader
            messageCount={messages.length}
            status={status}
            onNewChat={handleNewChat}
            canNewChat={messages.length > 0 || isLoading}
          />

          <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth px-4 py-6 sm:px-6">
            <div className="mx-auto flex min-h-full max-w-3xl flex-col">
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
                <div className="my-4 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 backdrop-blur-sm">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                  <div>
                    <p className="font-semibold text-red-300">Something went wrong</p>
                    <p className="mt-1 text-red-200/80">{error.message}</p>
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
      </div>
    </div>
  );
}
