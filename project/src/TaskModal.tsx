import { useEffect, useRef, useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import type { Task } from './types';
import { toLocalInput, fromLocalInput, formatDue } from './date';

interface Props {
  open: boolean;
  initial: Task | null;
  onClose: () => void;
  onSave: (text: string, dueAt: number | null) => void;
}

export function TaskModal({ open, initial, onClose, onSave }: Props) {
  const [text, setText] = useState('');
  const [dueAt, setDueAt] = useState<number | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setText(initial?.text ?? '');
      setDueAt(initial?.dueAt ?? null);
      setTimeout(() => {
        taRef.current?.focus();
        taRef.current?.setSelectionRange(taRef.current.value.length, taRef.current.value.length);
      }, 60);
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSave = text.trim().length > 0;

  const quickSet = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    d.setHours(9, 0, 0, 0);
    setDueAt(d.getTime());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {initial ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="¿Qué tienes que hacer?"
            rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { if (canSave) onSave(text.trim(), dueAt); } }}
          />

          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Fecha límite</span>
            </div>
            <div className="flex gap-2 mb-2.5">
              {['Hoy', 'Mañana', 'En 7 días'].map((label, i) => (
                <button key={label} onClick={() => quickSet(i === 0 ? 0 : i === 1 ? 1 : 7)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="datetime-local" value={dueAt ? toLocalInput(dueAt) : ''}
                onChange={(e) => setDueAt(e.target.value ? fromLocalInput(e.target.value) : null)}
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
              {dueAt && (
                <button onClick={() => setDueAt(null)} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {dueAt && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                <Clock className="w-3 h-3" />
                {formatDue(dueAt, Date.now())}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancelar
          </button>
          <button onClick={() => { if (canSave) onSave(text.trim(), dueAt); }} disabled={!canSave}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-sm font-medium text-white transition-colors">
            {initial ? 'Guardar cambios' : 'Crear tarea'}
          </button>
        </div>
      </div>
    </div>
  );
}
