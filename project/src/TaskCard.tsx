import { Check, Pencil, Trash2, Clock, AlertCircle } from 'lucide-react';
import type { Task } from './types';
import { formatDue, isOverdue } from './date';

interface Props {
  task: Task;
  now: number;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, now, onToggle, onEdit, onDelete }: Props) {
  const overdue = task.dueAt !== null && !task.completed && isOverdue(task.dueAt, now);

  return (
    <div
      className={`
        group relative flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200
        ${task.completed
          ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5'
        }
      `}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={`
          mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
          ${task.completed
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950'
          }
        `}
        aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
      >
        {task.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-relaxed ${
            task.completed
              ? 'line-through text-gray-400 dark:text-gray-600'
              : 'text-gray-800 dark:text-gray-100'
          }`}
        >
          {task.text}
        </p>

        {task.dueAt !== null && (
          <div
            className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
              overdue ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {overdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            <span>{formatDue(task.dueAt, now)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Editar"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          aria-label="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
