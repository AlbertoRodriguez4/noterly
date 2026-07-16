import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, Check, ChevronLeft, RefreshCw, ArrowUp, Minus, ArrowDown, Loader2 } from 'lucide-react';
import type { AISettings, AIParseResult, ParsedTask, ParsedRoutine, TaskPriority, Frequency } from '../types';
import { parseAndRankItems } from '../utils/aiPlanner';

interface Props {
  open: boolean;
  onClose: () => void;
  onAddItems: (tasks: ParsedTask[], routines: ParsedRoutine[]) => void;
  settings: AISettings;
}

const THINKING_STEPS = [
  'Leyendo tus entradas…',
  'Clasificando tareas y rutinas…',
  'Estimando prioridades y tiempos…',
  'Preparando el resumen…',
];

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; icon: typeof ArrowUp; classes: string }> = {
  high: {
    label: 'Urgente',
    icon: ArrowUp,
    classes: 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900',
  },
  medium: {
    label: 'Normal',
    icon: Minus,
    classes: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900',
  },
  low: {
    label: 'Baja',
    icon: ArrowDown,
    classes: 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900',
  },
};

const FREQ_LABELS: Record<Frequency, string> = {
  daily: 'Cada día',
  weekdays: 'Entre semana',
  weekends: 'Fines de semana',
  weekly: 'Cada semana',
  monthly: 'Cada mes',
  custom: 'Días personalizados',
};

type Phase = 'input' | 'thinking' | 'confirm' | 'success';

function renderMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export function AIPlanner({ open, onClose, onAddItems, settings }: Props) {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [result, setResult] = useState<AIParseResult | null>(null);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setInput('');
        setPhase('input');
        setResult(null);
        setStepIdx(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const canAnalyze = input.trim().split('\n').filter((l) => l.trim().length > 2).length > 0;

  const startAnalysis = () => {
    setPhase('thinking');
    setStepIdx(0);

    const delays = [600, 1200, 1800, 2400];
    const timers: ReturnType<typeof setTimeout>[] = [];
    delays.forEach((delay, i) => {
      timers.push(
        setTimeout(() => {
          if (i < THINKING_STEPS.length - 1) {
            setStepIdx(i + 1);
          }
          if (i === delays.length - 1) {
            const parsed = parseAndRankItems(input, settings);
            setResult(parsed);
            setPhase('confirm');
          }
        }, delay),
      );
    });
  };

  const goBack = () => {
    setPhase('input');
    setResult(null);
  };

  const confirmInsert = () => {
    if (result) {
      onAddItems(result.tasks, result.routines);
      setPhase('success');
      setTimeout(() => onClose(), 1500);
    }
  };

  const totalItems = (result?.tasks.length ?? 0) + (result?.routines.length ?? 0);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Planificador IA</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">Texto libre → tareas y rutinas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar planificador"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* INPUT PHASE */}
          {phase === 'input' && (
            <div className="p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Escribe una tarea o rutina por línea. El planificador detectará automáticamente si es una tarea
                puntual o una rutina recurrente.
              </p>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  'Reunión con cliente urgente\nEstudiar TypeScript\nMeditar cada mañana\nEjercicio de lunes a viernes\nComprar café'
                }
                rows={10}
                className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
          )}

          {/* THINKING PHASE */}
          {phase === 'thinking' && (
            <div className="flex flex-col items-center justify-center h-full py-20 px-6">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-6" />
              <p className="text-base font-semibold text-gray-900 dark:text-white mb-1 text-center">
                {THINKING_STEPS[stepIdx]}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Un momento…</p>
              <div className="flex gap-2">
                {THINKING_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i <= stepIdx ? 'bg-blue-500 w-6' : 'bg-gray-200 dark:bg-gray-700 w-3'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* CONFIRM PHASE */}
          {phase === 'confirm' && result && (
            <div className="p-5 flex flex-col gap-5">
              {/* Summary */}
              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-4">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p
                    className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(result.summary) }}
                  />
                </div>
              </div>

              {/* Tasks section */}
              {result.tasks.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                      <Check className="w-3 h-3 text-blue-500" />
                    </span>
                    Tareas ({result.tasks.length})
                  </h3>
                  <div className="flex flex-col gap-2">
                    {result.tasks.map((task, i) => {
                      const cfg = PRIORITY_CONFIG[task.priority];
                      const Icon = cfg.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{i + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug mb-1.5">
                              {task.text}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.classes}`}
                              >
                                <Icon className="w-3 h-3" />
                                {cfg.label}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">~{task.minutes} min</span>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{task.reason}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Routines section */}
              {result.routines.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-violet-100 dark:bg-violet-950 flex items-center justify-center">
                      <RefreshCw className="w-3 h-3 text-violet-500" />
                    </span>
                    Rutinas ({result.routines.length})
                  </h3>
                  <div className="flex flex-col gap-2">
                    {result.routines.map((routine, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center">
                          <RefreshCw className="w-3 h-3 text-violet-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug mb-1.5">
                            {routine.title}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900">
                              <RefreshCw className="w-3 h-3" />
                              {FREQ_LABELS[routine.frequency]}
                            </span>
                            {routine.timeOfDay && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {routine.timeOfDay}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{routine.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUCCESS PHASE */}
          {phase === 'success' && (
            <div className="flex flex-col items-center justify-center h-full py-20 px-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg mb-6">
                <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">¡Todo añadido!</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                {result?.tasks.length ? `${result.tasks.length} tarea${result.tasks.length !== 1 ? 's' : ''}` : ''}
                {result?.tasks.length && result?.routines.length ? ' y ' : ''}
                {result?.routines.length
                  ? `${result.routines.length} rutina${result.routines.length !== 1 ? 's' : ''}`
                  : ''}{' '}
                añadida{totalItems !== 1 ? 's' : ''} a tu lista.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex-shrink-0">
          {phase === 'input' && (
            <button
              onClick={startAnalysis}
              disabled={!canAnalyze}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-white text-sm font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Analizar con IA
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {phase === 'confirm' && result && (
            <div className="flex gap-2">
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={confirmInsert}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
              >
                <Check className="w-4 h-4" />
                Insertar {totalItems} elemento{totalItems !== 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
