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
  if (!result) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center h-full bg-[#111113]">
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded border border-[#27272A] bg-[#09090B] text-[#A1A1AA]">
          <Table className="h-4 w-4" />
        </div>
        <p className="text-xs font-bold text-[#FAFAFA] uppercase tracking-wider">Spreadsheet Vacant</p>
        <p className="max-w-xs text-[10px] text-[#A1A1AA] mt-1 leading-relaxed font-mono">
          Execute a query in the prompt capsule. Output rows will populate here as evidence.
        </p>
      </div>
    );
  }

  if (!result.success) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center h-full bg-[#111113]">
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded border border-red-500/20 bg-red-500/5 text-red-400">
          <AlertCircle className="h-4 w-4" />
        </div>
        <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Query Error</p>
        <p className="max-w-xs text-[10px] text-[#A1A1AA] mt-1 leading-relaxed font-mono">
          Syntax issue or table constraint failed. Check the execution logs timeline for details.
        </p>
      </div>
    );
  }

  const rows = result.rows || [];
  if (rows.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center h-full bg-[#111113]">
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded border border-[#27272A] bg-[#09090B] text-[#A1A1AA]">
          <Table className="h-4 w-4" />
        </div>
        <p className="text-xs font-bold text-[#FAFAFA] uppercase tracking-wider">Empty Set</p>
        <p className="max-w-xs text-[10px] text-[#A1A1AA] mt-1 leading-relaxed font-mono">
          Query completed successfully but returned 0 rows.
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
    a.download = 'query-evidence.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(rows, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query-evidence.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden h-full bg-[#111113]">
      {/* Evidence Tools Bar */}
      <div className="flex items-center justify-between border-b border-[#27272A] bg-[#09090B] px-4 py-2">
        <div className="flex items-center gap-2">
          <Table className="h-3.5 w-3.5 text-[#6366f1]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FAFAFA]">
            Evidence Grid
          </span>
          <span className="rounded border border-[#27272A] bg-[#111113] px-2 py-0.5 text-[9px] font-mono text-[#A1A1AA] font-bold">
            {rows.length} rows
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportCsv}
            className="flex h-6 items-center gap-1 rounded border border-[#27272A] bg-[#161619] px-2 text-[9px] font-mono font-bold text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A] cursor-pointer"
          >
            <Download className="h-3 w-3" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportJson}
            className="flex h-6 items-center gap-1 rounded border border-[#27272A] bg-[#161619] px-2 text-[9px] font-mono font-bold text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A] cursor-pointer"
          >
            <FileJson className="h-3 w-3" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Database Monospace Grid */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-[#27272A] text-[11px] font-mono text-[#A1A1AA]">
          <thead className="bg-[#09090B]/50 sticky top-0 z-10">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-4 py-2 text-left font-bold text-[#FAFAFA] border-b border-[#27272A]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A] bg-[#111113]">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-[#161619] transition-colors">
                {headers.map((h) => (
                  <td key={h} className="whitespace-nowrap px-4 py-2 border-r border-[#27272a]/40 text-[#FAFAFA]">
                    {row[h] == null ? (
                      <span className="text-[#A1A1AA]/30 italic">NULL</span>
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
  );
}
