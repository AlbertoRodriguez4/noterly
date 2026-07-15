import { Check, Pencil, Trash2, Clock, AlertCircle } from 'lucide-react';
import type { Note } from './types';
import { formatDue, isOverdue } from './date';

interface Props {
  note: Note;
  now: number;
  onToggle: (id: string) => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, now, onToggle, onEdit, onDelete }: Props) {
  const overdue = note.dueAt !== null && !note.completed && isOverdue(note.dueAt, now);

  return (
    <div
      className={`
        group relative flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200
        ${note.completed
          ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60'
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5'
        }
      `}
    >
      <button
        onClick={() => onToggle(note.id)}
        className={`
          mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
          ${note.completed
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950'
          }
        `}
        aria-label={note.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
      >
        {note.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-relaxed ${
            note.completed
              ? 'line-through text-gray-400 dark:text-gray-600'
              : 'text-gray-800 dark:text-gray-100'
          }`}
        >
          {note.text}
        </p>

        {note.dueAt !== null && (
          <div
            className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
              overdue
                ? 'text-red-500'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {overdue ? (
              <AlertCircle className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            <span>{formatDue(note.dueAt, now)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => onEdit(note)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Editar"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(note.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          aria-label="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
