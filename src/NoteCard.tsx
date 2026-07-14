import { Check, Bell, Clock, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
  const [hover, setHover] = useState(false);
  const overdue = note.dueAt !== null && !note.completed && isOverdue(note.dueAt, now);

  return (
    <div
      className="group rounded-2xl border border-gray-100 bg-white p-4 shadow-card transition-all duration-200 hover:shadow-card-hover dark:border-white/[0.06] dark:bg-white/[0.03] sm:p-5"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-start gap-3.5">
        <button
          onClick={() => onToggle(note.id)}
          aria-label={note.completed ? 'Desmarcar' : 'Completar'}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
            note.completed
              ? 'animate-check-pop border-accent bg-accent text-white'
              : 'border-gray-300 bg-transparent hover:border-accent dark:border-white/25 dark:hover:border-accent'
          }`}
        >
          {note.completed && <Check size={13} strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`text-[15px] leading-[1.55] transition-all duration-300 ${
              note.completed
                ? 'text-gray-400 line-through dark:text-gray-500'
                : 'text-gray-800 dark:text-gray-100'
            }`}
          >
            {note.text}
          </p>

          {note.dueAt !== null && (
            <div className="mt-2.5 flex items-center gap-1.5">
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                  overdue
                    ? 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400'
                    : note.completed
                      ? 'bg-gray-50 text-gray-400 dark:bg-white/[0.03] dark:text-gray-500'
                      : 'bg-accent-soft text-accent dark:bg-accent/10 dark:text-accent'
                }`}
              >
                {overdue ? <Bell size={11} strokeWidth={2.25} /> : <Clock size={11} strokeWidth={2.25} />}
                {formatDue(note.dueAt, now)}
              </span>
            </div>
          )}
        </div>

        <div
          className={`flex shrink-0 items-center gap-0.5 transition-opacity duration-200 ${
            hover ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={() => onEdit(note)}
            aria-label="Editar"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-gray-200"
          >
            <Pencil size={15} strokeWidth={2} />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            aria-label="Eliminar"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <Trash2 size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
