import { CheckCircle2, ClipboardList, Inbox } from 'lucide-react';
import type { Filter } from './types';

interface Props {
  filter: Filter;
  setFilter: (f: Filter) => void;
  counts: { pending: number; completed: number; all: number };
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'pending', label: 'Pendientes' },
  { key: 'completed', label: 'Completadas' },
  { key: 'all', label: 'Todas' },
];

export function FilterChips({ filter, setFilter, counts }: Props) {
  return (
    <div className="flex gap-2">
      {FILTERS.map((f) => {
        const active = filter === f.key;
        const count = counts[f.key];
        return (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
              active
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-white text-gray-500 ring-1 ring-gray-200 hover:text-gray-800 dark:bg-white/[0.04] dark:text-gray-400 dark:ring-white/10 dark:hover:text-gray-100'
            }`}
          >
            {f.key === 'pending' && <ClipboardList size={13} strokeWidth={2} />}
            {f.key === 'completed' && <CheckCircle2 size={13} strokeWidth={2} />}
            {f.key === 'all' && <Inbox size={13} strokeWidth={2} />}
            {f.label}
            <span
              className={`rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                active
                  ? 'bg-white/20 text-white dark:bg-gray-900/15 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-400 dark:bg-white/10 dark:text-gray-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
