'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { messages, sendMessage, error, isLoading } = useChat({
    api: '/api/chat',
  });

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-50">
      
      {/* HEADER */}
      <header className="border-b border-zinc-800 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              SQL AI Agent
            </h1>
            <p className="text-xs text-zinc-400">
              Tool-powered AI · Natural language → SQL
            </p>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4">

        {/* CHAT BOX */}
        <div className="mb-3 flex-1 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 shadow-lg">

          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-sm text-zinc-500">
              <p className="mb-2 font-medium text-zinc-300">
                Start chatting with your AI Database Agent
              </p>
              <p className="text-xs">
                Ask anything about your database in plain English.
              </p>
            </div>
          )}

          <div className="space-y-4">

            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    message.role === 'user'
                      ? 'bg-emerald-500 text-emerald-50'
                      : 'bg-zinc-900 text-zinc-100 border border-zinc-800'
                  }`}
                >
                  {/* ROLE */}
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wide opacity-75">
                    {message.role === 'user' ? 'You' : 'AI'}
                  </div>

                  {/* MESSAGE PARTS */}
                  {message.parts?.map((part, i) => {

                    // 🧠 FINAL TEXT RESPONSE
                    if (part.type === 'text') {
                      return (
                        <p
                          key={i}
                          className="whitespace-pre-wrap leading-relaxed"
                        >
                          {part.text || '⚠️ No response generated'}
                        </p>
                      );
                    }

                    // ⚡ TOOL CALL + RESULT
                    if (part.type === 'tool-invocation') {
                      return (
                        <div
                          key={i}
                          className="mt-3 rounded-xl border border-yellow-500/30 bg-yellow-900/20 p-3 text-xs"
                        >
                          <p className="font-semibold text-yellow-300">
                            ⚡ Tool: {part.toolName}
                          </p>

                          {/* ARGS */}
                          <pre className="mt-2 overflow-x-auto text-[10px] text-yellow-200">
                            {JSON.stringify(part.args, null, 2)}
                          </pre>

                          {/* RESULT */}
                          {part.result && (
                            <div className="mt-2">
                              <p className="text-[10px] text-green-400">
                                Result:
                              </p>

                              {/* 🔥 TABLE RENDER */}
                              {Array.isArray(part.result.rows) ? (
                                <div className="overflow-x-auto mt-1">
                                  <table className="text-[10px] border border-zinc-700">
                                    <thead>
                                      <tr>
                                        {Object.keys(part.result.rows[0] || {}).map(col => (
                                          <th key={col} className="px-2 py-1 border">
                                            {col}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {part.result.rows.map((row, idx) => (
                                        <tr key={idx}>
                                          {Object.values(row).map((val, i) => (
                                            <td key={i} className="px-2 py-1 border">
                                              {String(val)}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <pre className="text-green-300">
                                  {JSON.stringify(part.result, null, 2)}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            ))}

            {/* LOADING */}
            {isLoading && (
              <div className="text-xs text-zinc-500">
                AI is thinking...
              </div>
            )}

            {/* DEBUG */}
            {!isLoading && messages.length > 0 && (
              <p className="text-[10px] text-zinc-500">
                Debug: last message has {messages[messages.length - 1]?.parts?.length || 0} parts
              </p>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-2 rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
            <span className="font-semibold">Error: </span>
            {String((error as any).message ?? error.toString())}
          </div>
        )}

        {/* INPUT */}
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!input.trim()) return;

            sendMessage({ text: input });
            setInput('');
          }}
          className="sticky bottom-0 mt-2 w-full"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 shadow-xl">
            <input
              className="flex-1 bg-transparent text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none"
              value={input}
              placeholder="e.g. Show all products or sales by region..."
              onChange={e => setInput(e.currentTarget.value)}
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-50 shadow-sm transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}