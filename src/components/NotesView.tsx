import { Plus, StickyNote, Pencil, Trash2 } from 'lucide-react';
import type { Note } from '../types';

interface Props {
  notes: Note[];
  onAdd: () => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

const COLOR_CLASSES: Record<string, string> = {
  yellow: 'bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100',
  blue: 'bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
  green: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100',
  rose: 'bg-rose-100 dark:bg-rose-900/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100',
  purple: 'bg-violet-100 dark:bg-violet-900/40 border-violet-200 dark:border-violet-800 text-violet-900 dark:text-violet-100',
};

export function NotesView({ notes, onAdd, onEdit, onDelete }: Props) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <StickyNote className="w-7 h-7 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">Sin notas</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mb-6">
          Usa este espacio para apuntar ideas rápidas o recordatorios.
        </p>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva nota
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-fade-in">
      {notes.map((note) => (
        <div
          key={note.id}
          className={`group relative rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col min-h-[120px] ${
            COLOR_CLASSES[note.color] || COLOR_CLASSES['yellow']
          }`}
        >
          <h4 className="font-semibold text-sm mb-1.5 leading-snug break-words pr-6">
            {note.title}
          </h4>
          {note.content && (
            <p className="text-xs opacity-80 whitespace-pre-wrap flex-1 break-words">
              {note.content}
            </p>
          )}

          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={() => onEdit(note)}
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              aria-label="Editar nota"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(note.id)}
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-red-500 transition-colors"
              aria-label="Eliminar nota"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
