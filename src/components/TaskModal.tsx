import { useEffect, useRef, useState } from 'react';
import { X, Calendar } from 'lucide-react';
import type { Task, TaskPriority } from '../types';

interface Props {
  open: boolean;
  initial: Task | null;
  onClose: () => void;
  onSave: (data: { text: string; priority: TaskPriority; dueDate: string | null }) => void;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'high', label: 'Urgente' },
  { value: 'medium', label: 'Normal' },
  { value: 'low', label: 'Baja' },
];

export function TaskModal({ open, initial, onClose, onSave }: Props) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setText(initial?.text ?? '');
      setPriority(initial?.priority ?? 'medium');
      setDueDate(initial?.dueDate ?? '');
      setTimeout(() => {
        taRef.current?.focus();
        taRef.current?.setSelectionRange(taRef.current.value.length, taRef.current.value.length);
      }, 60);
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

  const canSave = text.trim().length > 0;

  const handleSubmit = () => {
    if (canSave) onSave({ text: text.trim(), priority, dueDate: dueDate || null });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {initial ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
              Descripción
            </label>
            <textarea
              ref={taRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="¿Qué tienes que hacer?"
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSave) handleSubmit();
              }}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
              Prioridad
            </label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((p) => {
                const active = priority === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? p.value === 'high'
                          ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800'
                          : p.value === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-800'
                            : 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-800'
                        : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Fecha límite (opcional)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
              {dueDate && (
                <button
                  onClick={() => setDueDate('')}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  aria-label="Quitar fecha"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSave}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-sm font-medium text-white transition-colors"
          >
            {initial ? 'Guardar cambios' : 'Crear tarea'}
          </button>
        </div>
      </div>
    </div>
  );
}
