import { Check, Pencil, Trash2, Clock, AlertCircle, ArrowUp, Minus, ArrowDown } from 'lucide-react';
import type { Task, TaskPriority } from '../types';
import { formatDue, isOverdue } from '../utils/date';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; icon: typeof ArrowUp; classes: string }> = {
  high: {
    label: 'Urgente',
    icon: ArrowUp,
    classes: 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900',
  },
  medium: {
    label: 'Normal',
    icon: Minus,
    classes: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900',
  },
  low: {
    label: 'Baja',
    icon: ArrowDown,
    classes: 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900',
  },
};

export function TaskCard({ task, onToggle, onEdit, onDelete }: Props) {
  const overdue = task.dueDate !== null && !task.completed && isOverdue(task.dueDate);
  const cfg = PRIORITY_CONFIG[task.priority];
  const PriorityIcon = cfg.icon;

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

        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.classes}`}>
            <PriorityIcon className="w-3 h-3" />
            {cfg.label}
          </span>

          {task.estimatedMinutes > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Clock className="w-3 h-3" />
              ~{task.estimatedMinutes} min
            </span>
          )}

          {task.startTime && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
              {task.startTime}{task.endTime ? ` - ${task.endTime}` : ''}
            </span>
          )}

          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium ${
                overdue ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {overdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {formatDue(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Editar tarea"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          aria-label="Eliminar tarea"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
