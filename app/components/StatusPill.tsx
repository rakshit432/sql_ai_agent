import { cn } from '@/lib/utils';
import type { ChatStatus } from 'ai';
import { Brain, Database, Search, Sparkles } from 'lucide-react';

const STATUS_CONFIG: Record<
  ChatStatus,
  { label: string; icon: typeof Sparkles; color: string; pulse?: boolean }
> = {
  ready: { label: 'Ready', icon: Sparkles, color: 'text-emerald-400' },
  submitted: { label: 'Sending...', icon: Brain, color: 'text-amber-400', pulse: true },
  streaming: { label: 'Analyzing data...', icon: Database, color: 'text-indigo-400', pulse: true },
  error: { label: 'Error', icon: Search, color: 'text-red-400' },
};

export function StatusPill({ status }: { status: ChatStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2 rounded-full glass-panel px-3 py-1.5 text-xs font-medium">
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              status === 'streaming' ? 'bg-indigo-400' : 'bg-amber-400'
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            status === 'ready' && 'bg-emerald-500',
            status === 'submitted' && 'bg-amber-400',
            status === 'streaming' && 'bg-indigo-400',
            status === 'error' && 'bg-red-400'
          )}
        />
      </span>
      <Icon className={cn('h-3.5 w-3.5', config.color)} />
      <span className="text-zinc-400">{config.label}</span>
    </div>
  );
}
