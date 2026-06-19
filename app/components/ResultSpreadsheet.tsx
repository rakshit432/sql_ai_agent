'use client';

import { Download, Table, FileJson, AlertCircle } from 'lucide-react';
import { useState } from 'react';

type QueryResult = {
  query: string;
  success: boolean;
  rows?: Record<string, unknown>[];
  count?: number;
  error?: string;
};

interface ResultSpreadsheetProps {
  result: QueryResult | null;
}

function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = val == null ? '' : String(val);
          return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
        })
        .join(',')
    ),
  ];
  return lines.join('\n');
}

export function ResultSpreadsheet({ result }: ResultSpreadsheetProps) {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center h-full">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-600">
          <Table className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-zinc-400">Spreadsheet vacant</p>
        <p className="max-w-xs text-xs text-zinc-600 mt-1 leading-relaxed">
          Execute an AI database query first. The query results will render inside this interactive data grid.
        </p>
      </div>
    );
  }

  if (!result.success) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center h-full">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
          <AlertCircle className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-red-400">Query execution failed</p>
        <p className="max-w-xs text-xs text-zinc-500 mt-1 leading-relaxed">
          Inspect the error details inline within the chat query step to resolve database syntax issues.
        </p>
      </div>
    );
  }

  const rows = result.rows || [];
  if (rows.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center h-full">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-500">
          <Table className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-zinc-300">Empty result set</p>
        <p className="max-w-xs text-xs text-zinc-500 mt-1 leading-relaxed">
          The query ran successfully, but returned 0 database entries.
        </p>
      </div>
    );
  }

  const headers = Object.keys(rows[0]);

  const handleExportCsv = () => {
    const csv = rowsToCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(rows, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden h-full">
      {/* Interactive table tools bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 bg-zinc-950/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <Table className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider font-sans text-zinc-400">
            Explorer Grid
          </span>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/10 px-2.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest leading-none">
            {rows.length} rows returned
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportCsv}
            className="flex h-7 items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 transition-all hover:border-emerald-500/20 hover:text-white cursor-pointer"
          >
            <Download className="h-3 w-3" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportJson}
            className="flex h-7 items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 transition-all hover:border-emerald-500/20 hover:text-white cursor-pointer"
          >
            <FileJson className="h-3 w-3" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet grid */}
      <div className="flex-1 overflow-auto bg-[#040406]/10">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-white/5 text-[11px] font-medium leading-normal">
            <thead>
              <tr className="bg-zinc-950/40">
                {headers.map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-3 text-left font-bold uppercase tracking-wider text-zinc-400 border-b border-white/5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="transition-colors hover:bg-white/[0.02] even:bg-white/[0.01]"
                >
                  {headers.map((h) => (
                    <td key={h} className="whitespace-nowrap px-4 py-2.5 font-mono text-zinc-300">
                      {row[h] == null ? (
                        <span className="text-zinc-600 font-sans italic font-bold">NULL</span>
                      ) : (
                        String(row[h])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
