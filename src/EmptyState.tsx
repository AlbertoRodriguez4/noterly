import { Sparkles } from 'lucide-react';
import type { Filter } from './types';

interface Props {
  filter: Filter;
  onAdd: () => void;
}

const COPY: Record<Filter, { title: string; subtitle: string }> = {
  pending: {
    title: 'Todo al día',
    subtitle: 'No tienes tareas pendientes. Disfruta el descanso.',
  },
  completed: {
    title: 'Aún no has completado nada',
    subtitle: 'Las notas que marques como hechas aparecerán aquí.',
  },
  all: {
    title: 'Tu lista está vacía',
    subtitle: 'Crea tu primera nota para empezar a organizar tu día.',
  },
};

export function EmptyState({ filter, onAdd }: Props) {
  const copy = COPY[filter];
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/[0.04]">
        <Sparkles size={28} strokeWidth={1.5} className="text-gray-300 dark:text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{copy.title}</h3>
      <p className="mt-1.5 max-w-[260px] text-sm leading-relaxed text-gray-400 dark:text-gray-500">
        {copy.subtitle}
      </p>
      {filter === 'all' && (
        <button
          onClick={onAdd}
          className="mt-6 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-600"
        >
          Crear primera nota
        </button>
      )}
    </div>
  );
}
