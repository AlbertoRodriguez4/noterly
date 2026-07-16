import { useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';
import type { Note, NoteColor } from '../types';

interface Props {
  open: boolean;
  initial: Note | null;
  onClose: () => void;
  onSave: (data: { title: string; content: string | null; color: NoteColor }) => void;
}

const COLORS: { value: NoteColor; bgClass: string; borderClass: string }[] = [
  { value: 'yellow', bgClass: 'bg-amber-100 dark:bg-amber-900/40', borderClass: 'border-amber-300 dark:border-amber-700' },
  { value: 'blue', bgClass: 'bg-blue-100 dark:bg-blue-900/40', borderClass: 'border-blue-300 dark:border-blue-700' },
  { value: 'green', bgClass: 'bg-emerald-100 dark:bg-emerald-900/40', borderClass: 'border-emerald-300 dark:border-emerald-700' },
  { value: 'rose', bgClass: 'bg-rose-100 dark:bg-rose-900/40', borderClass: 'border-rose-300 dark:border-rose-700' },
  { value: 'purple', bgClass: 'bg-violet-100 dark:bg-violet-900/40', borderClass: 'border-violet-300 dark:border-violet-700' },
];

export function NoteModal({ open, initial, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<NoteColor>('yellow');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setContent(initial?.content ?? '');
      setColor(initial?.color ?? 'yellow');
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSave = title.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      title: title.trim(),
      content: content.trim() || null,
      color,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[90vh] flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {initial ? 'Editar nota' : 'Nueva nota'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Título</label>
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Idea brillante..."
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
              Contenido (opcional)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detalles..."
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${c.bgClass} ${
                    color === c.value ? c.borderClass : 'border-transparent hover:border-gray-300'
                  }`}
                  aria-label={`Color ${c.value}`}
                >
                  {color === c.value && <Check className="w-4 h-4 text-gray-900 dark:text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5 flex-shrink-0 border-t border-gray-100 dark:border-gray-800 pt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-sm font-medium text-white transition-colors"
          >
            {initial ? 'Guardar cambios' : 'Crear nota'}
          </button>
        </div>
      </div>
    </div>
  );
}
