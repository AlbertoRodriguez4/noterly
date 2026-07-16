import { Plus } from 'lucide-react';
import type { Filter } from '../types';

interface Props {
  filter: Filter;
  onAdd: () => void;
}

const COPY: Record<Filter, { title: string; subtitle: string; emoji: string }> = {
  pending: {
    title: '¡Todo al día!',
    subtitle: 'No tienes tareas pendientes. Disfruta el descanso.',
    emoji: '✓',
  },
  completed: {
    title: 'Aún no has completado nada',
    subtitle: 'Las tareas que marques como hechas aparecerán aquí.',
    emoji: '◷',
  },
  all: {
    title: 'Tu lista está vacía',
    subtitle: 'Crea tu primera tarea para empezar a organizar tu día.',
    emoji: '+',
  },
};

export function EmptyState({ filter, onAdd }: Props) {
  const copy = COPY[filter];
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <span className="text-2xl">{copy.emoji}</span>
      </div>
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">{copy.title}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mb-6">{copy.subtitle}</p>
      {filter === 'all' && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva tarea
        </button>
      )}
    </div>
  );
}
