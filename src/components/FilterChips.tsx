import type { Filter } from '../types';

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
            className={`
              flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              ${active
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400'
              }
            `}
          >
            {f.label}
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center ${
                active
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
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
