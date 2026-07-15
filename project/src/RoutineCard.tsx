import { Check, Pencil, Trash2, Flame, RefreshCw, Briefcase, Sun, Calendar, CalendarDays, SlidersHorizontal } from 'lucide-react';
import type { Routine, Frequency } from './types';

interface Props {
  routine: Routine;
  onMarkDone: (routine: Routine) => void;
  onEdit: (routine: Routine) => void;
  onDelete: (id: string) => void;
}

const FREQ_CONFIG: Record<Frequency, { label: string; icon: typeof RefreshCw; classes: string }> = {
  daily:    { label: 'Cada día',         icon: RefreshCw,    classes: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900' },
  weekdays: { label: 'Entre semana',     icon: Briefcase,    classes: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900' },
  weekends: { label: 'Fines de semana',  icon: Sun,          classes: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900' },
  weekly:   { label: 'Cada semana',      icon: Calendar,     classes: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900' },
  monthly:  { label: 'Cada mes',         icon: CalendarDays, classes: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900' },
  custom:   { label: 'Días personalizados', icon: SlidersHorizontal, classes: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900' },
};

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function isDoneToday(lastDoneAt: number | null): boolean {
  if (!lastDoneAt) return false;
  return new Date(lastDoneAt).toDateString() === new Date().toDateString();
}

export function RoutineCard({ routine, onMarkDone, onEdit, onDelete }: Props) {
  const cfg = FREQ_CONFIG[routine.frequency];
  const Icon = cfg.icon;
  const doneToday = isDoneToday(routine.lastDoneAt);

  return (
    <div className={`
      group relative flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200
      bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5
    `}>
      <button
        onClick={() => !doneToday && onMarkDone(routine)}
        disabled={doneToday}
        className={`
          mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
          ${doneToday
            ? 'bg-emerald-500 border-emerald-500 cursor-default'
            : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950'
          }
        `}
        aria-label={doneToday ? 'Hecha hoy' : 'Marcar como hecha hoy'}
      >
        {doneToday && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug mb-1.5">
          {routine.title}
        </p>

        {routine.description && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 leading-relaxed">
            {routine.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.classes}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
          </span>

          {(routine.frequency === 'weekly' || routine.frequency === 'custom') && routine.days.length > 0 && (
            <div className="flex gap-1">
              {routine.days.map((d) => (
                <span key={d} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                  {DAY_NAMES[d]}
                </span>
              ))}
            </div>
          )}

          {routine.timeOfDay && (
            <span className="text-xs text-gray-400 dark:text-gray-500">{routine.timeOfDay}</span>
          )}

          {routine.streak > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500">
              <Flame className="w-3.5 h-3.5" />
              {routine.streak}
            </span>
          )}

          {doneToday && (
            <span className="text-xs font-medium text-emerald-500">Hecha hoy</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={() => onEdit(routine)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Editar"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(routine.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          aria-label="Eliminar"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
