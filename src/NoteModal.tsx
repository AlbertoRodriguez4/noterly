import { useEffect, useRef, useState } from 'react';
import { X, Calendar, Clock, Bell } from 'lucide-react';
import type { Note } from './types';
import { toLocalInput, fromLocalInput, formatDue } from './date';

interface Props {
  open: boolean;
  initial: Note | null;
  onClose: () => void;
  onSave: (text: string, dueAt: number | null) => void;
}

export function NoteModal({ open, initial, onClose, onSave }: Props) {
  const [text, setText] = useState('');
  const [dueAt, setDueAt] = useState<number | null>(null);
  const [textFocused, setTextFocused] = useState(false);
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSave = text.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave(text.trim(), dueAt);
  };

  const clearDate = () => setDueAt(null);

  const quickSet = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    d.setHours(9, 0, 0, 0);
    setDueAt(d.getTime());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-gray-900/30 backdrop-blur-[3px] dark:bg-black/50"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg animate-slide-up rounded-t-3xl bg-white p-5 shadow-pop dark:bg-[#1c1c1e] sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-gray-900 dark:text-gray-50">
            {initial ? 'Editar nota' : 'Nueva nota'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-gray-200"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setTextFocused(true)}
          onBlur={() => setTextFocused(false)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSave();
          }}
          placeholder="¿Qué tienes en mente?"
          rows={3}
          className={`w-full resize-none rounded-2xl border bg-gray-50 px-4 py-3 text-[15px] leading-relaxed text-gray-800 outline-none transition-all dark:bg-white/[0.04] dark:text-gray-100 ${
            textFocused
              ? 'border-accent ring-4 ring-accent/10'
              : 'border-gray-200 dark:border-white/[0.08]'
          }`}
        />

        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            <Bell size={12} strokeWidth={2} />
            Notificación
          </div>

          {dueAt === null ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => quickSet(0)}
                className="rounded-full border border-gray-200 px-3.5 py-1.5 text-sm font-medium text-gray-600 transition-all hover:border-accent hover:text-accent dark:border-white/10 dark:text-gray-300 dark:hover:border-accent dark:hover:text-accent"
              >
                Hoy 9:00
              </button>
              <button
                onClick={() => quickSet(1)}
                className="rounded-full border border-gray-200 px-3.5 py-1.5 text-sm font-medium text-gray-600 transition-all hover:border-accent hover:text-accent dark:border-white/10 dark:text-gray-300 dark:hover:border-accent dark:hover:text-accent"
              >
                Mañana 9:00
              </button>
              <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-sm font-medium text-gray-600 transition-all hover:border-accent hover:text-accent dark:border-white/10 dark:text-gray-300 dark:hover:border-accent dark:hover:text-accent">
                <Calendar size={13} strokeWidth={2} />
                Elegir fecha
                <input
                  type="datetime-local"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.value) setDueAt(fromLocalInput(e.target.value));
                  }}
                />
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 rounded-2xl bg-accent-soft px-3.5 py-2.5 dark:bg-accent/10">
              <div className="flex items-center gap-2 text-sm font-medium text-accent">
                <Clock size={14} strokeWidth={2} />
                <span>{formatDue(dueAt, Date.now())}</span>
              </div>
              <div className="flex items-center gap-1">
                <label className="cursor-pointer rounded-lg px-2 py-1 text-xs font-medium text-accent/70 transition-colors hover:bg-accent/10 hover:text-accent">
                  Cambiar
                  <input
                    type="datetime-local"
                    className="sr-only"
                    value={toLocalInput(dueAt)}
                    onChange={(e) => {
                      if (e.target.value) setDueAt(fromLocalInput(e.target.value));
                    }}
                  />
                </label>
                <button
                  onClick={clearDate}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-accent/70 transition-colors hover:bg-accent/10 hover:text-accent"
                >
                  Quitar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-[1.5] rounded-xl bg-accent py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {initial ? 'Guardar' : 'Añadir'}
          </button>
        </div>
      </div>
    </div>
  );
}
