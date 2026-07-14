import { useEffect, useState } from 'react';
import { Sparkles, X, Clock, ArrowRight, Zap } from 'lucide-react';
import type { Note } from './types';
import { planDay, type PlanResult } from './planner';

interface Props {
  open: boolean;
  notes: Note[];
  now: number;
  onClose: () => void;
}

const THINKING_STEPS = [
  'Analizando tus tareas…',
  'Evaluando urgencia y plazos…',
  'Estimando duraciones…',
  'Organizando bloques de tiempo…',
];

export function AIPanel({ open, notes, now, onClose }: Props) {
  const [phase, setPhase] = useState<'idle' | 'thinking' | 'done'>('idle');
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState<PlanResult | null>(null);

  useEffect(() => {
    if (!open) {
      setPhase('idle');
      setStepIdx(0);
      setResult(null);
      return;
    }
    setPhase('thinking');
    setStepIdx(0);
    setResult(null);
  }, [open, notes, now]);

  useEffect(() => {
    if (phase !== 'thinking') return;
    if (stepIdx < THINKING_STEPS.length - 1) {
      const id = setTimeout(() => setStepIdx((i) => i + 1), 650);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setResult(planDay(notes, now));
      setPhase('done');
    }, 650);
    return () => clearTimeout(id);
  }, [phase, stepIdx, notes, now]);

  if (!open) return null;

  const pendingCount = notes.filter((n) => !n.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-gray-900/30 backdrop-blur-[3px] dark:bg-black/50"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg animate-slide-up flex-col overflow-hidden rounded-t-3xl bg-white shadow-pop dark:bg-[#1c1c1e] sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Sparkles size={16} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900 dark:text-gray-50">Planificador IA</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {pendingCount} {pendingCount === 1 ? 'tarea pendiente' : 'tareas pendientes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-gray-200"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {phase === 'thinking' && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6 flex h-14 w-14 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Sparkles size={22} strokeWidth={2} className="animate-pulse" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{THINKING_STEPS[stepIdx]}</p>
              <div className="mt-3 flex gap-1.5">
                {THINKING_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i <= stepIdx ? 'w-6 bg-accent' : 'w-1.5 bg-gray-200 dark:bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {phase === 'done' && !result && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/[0.04]">
                <Zap size={24} strokeWidth={1.5} className="text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">¡Todo al día!</h3>
              <p className="mt-1.5 max-w-[260px] text-sm text-gray-400 dark:text-gray-500">
                No tienes tareas pendientes. Disfruta el descanso.
              </p>
            </div>
          )}

          {phase === 'done' && result && (
            <div className="animate-fade-in space-y-5">
              {/* Summary */}
              <div className="rounded-2xl border border-accent-border bg-accent-soft/50 p-4 dark:border-accent/20 dark:bg-accent/[0.06]">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
                  <Sparkles size={11} strokeWidth={2.5} />
                  Resumen
                </div>
                <p
                  className="text-[14px] leading-relaxed text-gray-700 dark:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: result.summary.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2.5">
                <StatCard label="Tareas" value={String(result.blocks.length)} icon={<Sparkles size={12} strokeWidth={2.5} />} />
                <StatCard
                  label="Tiempo"
                  value={`${Math.floor(result.totalMinutes / 60)}h ${String(result.totalMinutes % 60).padStart(2, '0')}m`}
                  icon={<Clock size={12} strokeWidth={2.5} />}
                />
                <StatCard
                  label="Libre"
                  value={result.freeMinutes > 60 ? `~${Math.round(result.freeMinutes / 60)}h` : `${result.freeMinutes}m`}
                  icon={<Zap size={12} strokeWidth={2.5} />}
                />
              </div>

              {/* Schedule */}
              <div>
                <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  <Clock size={11} strokeWidth={2.5} />
                  Horario sugerido
                </div>
                <div className="space-y-2">
                  {result.blocks.map((block, i) => (
                    <div
                      key={block.noteId}
                      className="group flex items-stretch gap-3 rounded-2xl border border-gray-100 bg-white p-3 transition-all hover:border-gray-200 hover:shadow-card dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/10"
                    >
                      {/* Time column */}
                      <div className="flex shrink-0 flex-col items-center pt-0.5">
                        <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                          {block.startLabel}
                        </span>
                        <span className="text-[11px] tabular-nums text-gray-300 dark:text-gray-600">
                          {block.endLabel}
                        </span>
                      </div>

                      {/* Connector */}
                      <div className="flex shrink-0 flex-col items-center">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
                          <span className="text-[10px] font-bold tabular-nums">{i + 1}</span>
                        </div>
                        {i < result.blocks.length - 1 && (
                          <div className="mt-1 w-px flex-1 bg-gray-100 dark:bg-white/[0.08]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 pb-1">
                        <p className="text-[14px] leading-snug text-gray-800 dark:text-gray-100">{block.text}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-white/[0.06] dark:text-gray-400">
                            {block.minutes} min
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {result.blocks.length > 0 && (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-gray-50 py-3 text-xs text-gray-400 dark:bg-white/[0.02] dark:text-gray-500">
                  <span className="font-medium">Inicio</span>
                  <ArrowRight size={12} strokeWidth={2} />
                  <span className="font-semibold tabular-nums text-gray-600 dark:text-gray-300">{result.blocks[0].startLabel}</span>
                  <ArrowRight size={12} strokeWidth={2} />
                  <span className="font-medium">Fin</span>
                  <ArrowRight size={12} strokeWidth={2} />
                  <span className="font-semibold tabular-nums text-gray-600 dark:text-gray-300">{result.blocks[result.blocks.length - 1].endLabel}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {phase === 'done' && result && (
          <div className="border-t border-gray-100 px-5 py-3.5 dark:border-white/[0.06]">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-600"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-3 py-2.5 text-center dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div className="mb-1 flex items-center justify-center gap-1 text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {icon}
        {label}
      </div>
      <div className="text-base font-bold tabular-nums text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  );
}
