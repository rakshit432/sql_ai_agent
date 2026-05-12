'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef, useMemo } from 'react';

// ================= TYPES =================
type TextPart = {
  type: 'text';
  text: string;
};

type ToolPart = {
  toolCallId: string;
  tool?: string;
  toolName?: string;
  input?: Record<string, any>;
  output?: any;
  result?: any;
};

type MessagePart = TextPart | ToolPart;

// ================= MAIN =================
export default function Chat() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { messages, sendMessage, error, status } = useChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-50">
      <Header />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4">
        <MessageList messages={messages} status={status} />

        {error && (
          <div className="mb-2 rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
            {String(error)}
          </div>
        )}

        <ChatInput
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
        />
      </main>
    </div>
  );
}

// ================= HEADER =================
function Header() {
  return (
    <header className="border-b border-zinc-800 bg-black/60 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <div>
          <h1 className="text-lg font-semibold">SQL AI Agent</h1>
          <p className="text-xs text-zinc-400">
            Natural language → SQL
          </p>
        </div>
      </div>
    </header>
  );
}

// ================= MESSAGE LIST =================
function MessageList({ messages, status }: any) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="mb-3 flex-1 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      {messages.length === 0 && (
        <EmptyState />
      )}

      <div className="space-y-4">
        {messages.map((message: any) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {(status === 'submitted' || status === 'streaming') && (
          <TypingIndicator />
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

// ================= EMPTY =================
function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-sm text-zinc-500">
      <p className="text-zinc-300">Start chatting with AI</p>
    </div>
  );
}

// ================= BUBBLE =================
function MessageBubble({ message }: any) {
  const parts: MessagePart[] = useMemo(() => {
    return (
      message.parts || [
        ...(message.content
          ? [{ type: 'text', text: message.content }]
          : []),
        ...(message.toolInvocations || []),
      ]
    );
  }, [message]);

  return (
    <div
      className={`flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm bg-zinc-900">
        {parts.map((part, i) => {
          if (part.type === 'text') {
            return <p key={i}>{part.text}</p>;
          }

          if ('toolCallId' in part) {
            const toolName = part.toolName ?? part.tool ?? 'unknown';

            if (toolName === 'queryDatabase') {
              return <QueryCard key={i} part={part} />;
            }
          }

          return null;
        })}
      </div>
    </div>
  );
}

// ================= QUERY CARD =================
function QueryCard({ part }: { part: ToolPart }) {
  const query = part.input?.query || '';
  const output = part.output || part.result;

  return (
    <div className="mt-3 rounded-xl border border-zinc-700 p-3">
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-400">SQL Query</span>
        <button
          onClick={() => navigator.clipboard.writeText(query)}
          className="text-xs text-emerald-400"
        >
          Copy
        </button>
      </div>

      <pre className="text-xs text-blue-300 mt-2">{query}</pre>

      {Array.isArray(output?.rows) && (
        <div className="mt-2 text-xs text-zinc-400">
          {output.rows.length} rows returned
        </div>
      )}
    </div>
  );
}

// ================= INPUT =================
function ChatInput({ input, setInput, sendMessage }: any) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!input.trim()) return;

        sendMessage({ text: input });
        setInput('');
      }}
      className="mt-2"
    >
      <div className="flex gap-2 border border-zinc-800 rounded-xl px-3 py-2">
        <input
          className="flex-1 bg-transparent outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button className="bg-emerald-500 px-3 py-1 text-xs rounded">
          Send
        </button>
      </div>
    </form>
  );
}

// ================= TYPING =================
function TypingIndicator() {
  return (
    <div className="text-xs text-zinc-400 animate-pulse">
      AI is thinking...
    </div>
  );
}
