'use client';

import { Terminal, Database, BookOpen, Key, AlertTriangle } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (query: string) => void;
  disabled: boolean;
}

export function WelcomeScreen({ onSuggestionClick, disabled }: WelcomeScreenProps) {
  const templates = [
    {
      title: 'Low Stock Scan',
      query: 'SELECT name, category, stock FROM products WHERE stock < 30 ORDER BY stock ASC;',
      desc: 'Scans inventory database for products with less than 30 items in stock.',
    },
    {
      title: 'Revenue By Region',
      query: 'SELECT region, COUNT(id) as total_transactions, SUM(total_amount) as total_revenue FROM sales GROUP BY region ORDER BY total_revenue DESC;',
      desc: 'Aggregates sales revenue and transaction count grouped by customer region.',
    },
    {
      title: 'Top Purchasing Customers',
      query: 'SELECT customer_name, SUM(total_amount) as total_spent, COUNT(id) as orders_count FROM sales GROUP BY customer_name ORDER BY total_spent DESC LIMIT 5;',
      desc: 'Lists the top 5 customers sorted by highest historical order amount.',
    },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-8 px-6 max-w-2xl mx-auto select-none animate-fade-in">
      <div className="w-full border border-[#27272A] bg-[#111113] rounded-lg p-6 space-y-6">
        {/* Header Branding */}
        <div className="flex items-center gap-3 border-b border-[#27272A] pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-[#27272A] bg-[#09090B] text-[#6366f1]">
            <Terminal className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-[14px] font-bold uppercase tracking-wider text-[#FAFAFA]">
              New Database Investigation
            </h2>
            <p className="text-[10px] text-[#A1A1AA] font-mono mt-0.5">
              Nexus AI Agent Workspace Workspace
            </p>
          </div>
        </div>

        {/* Workspace direct instructions */}
        <div className="space-y-3 font-mono text-[10px] text-[#A1A1AA] leading-relaxed">
          <div className="flex items-start gap-2.5">
            <BookOpen className="h-4 w-4 text-[#6366f1] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#FAFAFA]">Investigation Workflow:</strong> Formulate a plain English request or write a SELECT statement. The agent automatically runs schema discovery, parses relevant tables, checks command safety, and executes LibSQL commands.
            </p>
          </div>
          
          <div className="flex items-start gap-2.5">
            <Key className="h-4 w-4 text-[#6366f1] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#FAFAFA]">Read-Only Layer:</strong> Only <code className="text-[#FAFAFA] bg-[#161619] px-1 rounded">SELECT</code> operations are permitted. Data mutation queries (<code className="text-red-400">INSERT</code>, <code className="text-red-400">DELETE</code>, <code className="text-red-400">UPDATE</code>) are blocked.
            </p>
          </div>
        </div>

        {/* Investigation Templates Section */}
        <div className="space-y-3 pt-2">
          <span className="font-mono text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
            Investigation Templates
          </span>
          
          <div className="grid grid-cols-1 gap-2.5">
            {templates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => !disabled && onSuggestionClick(tpl.query)}
                disabled={disabled}
                className="w-full text-left p-3.5 rounded border border-[#27272A] bg-[#09090B]/40 hover:bg-[#161619] hover:border-[#6366f1]/30 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-[#FAFAFA] group-hover:text-[#6366f1]">
                    {tpl.title}
                  </span>
                  <span className="font-mono text-[8px] text-[#A1A1AA] uppercase tracking-wider group-hover:text-white">
                    Load Query →
                  </span>
                </div>
                <p className="text-[10px] text-[#A1A1AA] mt-1 leading-relaxed">
                  {tpl.desc}
                </p>
                <code className="block mt-2 font-mono text-[9px] text-[#6366f1]/90 bg-[#09090B] p-1.5 rounded border border-[#27272A]/40 truncate">
                  {tpl.query}
                </code>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
