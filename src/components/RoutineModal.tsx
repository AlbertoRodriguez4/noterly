import { useEffect, useRef, useState } from 'react';
import { X, Clock } from 'lucide-react';
import type { Routine, Frequency } from '../types';

interface Props {
  open: boolean;
  initial: Routine | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string | null;
    frequency: Frequency;
    days: number[];
    timeOfDay: string | null;
  }) => void;
}

const FREQUENCIES: { key: Frequency; label: string; description: string }[] = [
  { key: 'daily', label: 'Cada día', description: 'Todos los días' },
  { key: 'weekdays', label: 'Entre semana', description: 'Lunes a viernes' },
  { key: 'weekends', label: 'Fines de semana', description: 'Sábado y domingo' },
  { key: 'weekly', label: 'Cada semana', description: 'Elige los días' },
  { key: 'custom', label: 'Días personalizados', description: 'Elige cualquier combinación' },
  { key: 'monthly', label: 'Cada mes', description: 'Una vez al mes' },
];

const WEEKDAYS = [
  { idx: 1, label: 'L' },
  { idx: 2, label: 'M' },
  { idx: 3, label: 'X' },
  { idx: 4, label: 'J' },
  { idx: 5, label: 'V' },
  { idx: 6, label: 'S' },
  { idx: 0, label: 'D' },
];

export function RoutineModal({ open, initial, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [days, setDays] = useState<number[]>([1]);
  const [timeOfDay, setTimeOfDay] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setDescription(initial?.description ?? '');
      setFrequency(initial?.frequency ?? 'daily');
      setDays(initial?.days ?? [1]);
      setTimeOfDay(initial?.timeOfDay ?? '');
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

  const toggleDay = (idx: number) => {
    setDays((prev) =>
      prev.includes(idx) ? (prev.length > 1 ? prev.filter((d) => d !== idx) : prev) : [...prev, idx].sort(),
    );
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      title: title.trim(),
      description: description.trim() || null,
      frequency,
      days: frequency === 'weekly' || frequency === 'custom' ? days : [],
      timeOfDay: timeOfDay || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[90vh] flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {initial ? 'Editar rutina' : 'Nueva rutina'}
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
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">Nombre</label>
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Meditación matutina"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notas adicionales…"
              rows={2}
              className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Frecuencia</label>
            <div className="grid grid-cols-1 gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFrequency(f.key)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                    frequency === f.key
                      ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      frequency === f.key
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {f.label}
                  </span>
                  <span
                    className={`text-xs ${
                      frequency === f.key
                        ? 'text-blue-500 dark:text-blue-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {f.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {(frequency === 'weekly' || frequency === 'custom') && (
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                Días de la semana
              </label>
              <div className="flex gap-2">
                {WEEKDAYS.map(({ idx, label }) => (
                  <button
                    key={idx}
                    onClick={() => toggleDay(idx)}
                    className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all ${
                      days.includes(idx)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Hora preferida (opcional)
            </label>
            <input
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
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
            {initial ? 'Guardar cambios' : 'Crear rutina'}
          </button>
        </div>
      </div>
    </div>
  );
}
