import { useEffect, useRef, useState } from 'react';
import { Sparkles, X, ArrowRight, ChevronLeft, Check, Clock, Zap, Minus, RefreshCw } from 'lucide-react';
import { parseAndRankItems, type AIParseResult, type TaskPriority, type ParsedRoutine } from './planner';
import type { Frequency } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  onAddItems: (
    tasks: Array<{ text: string; dueAt: number | null }>,
    routines: Array<{ title: string; frequency: Frequency; days: number[]; timeOfDay: string | null }>,
  ) => void;
}

type Phase = 'input' | 'thinking' | 'confirm' | 'success';

const THINKING_STEPS = [
  'Analizando tu texto…',
  'Detectando tareas y rutinas…',
  'Evaluando urgencia y prioridades…',
  'Organizando el orden óptimo…',
];

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; classes: string; icon: typeof Zap }> = {
  high:   { label: 'Urgente', classes: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900',       icon: Zap },
  medium: { label: 'Normal',  classes: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900', icon: Minus },
  low:    { label: 'Baja',    classes: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700',    icon: Clock },
};

const FREQ_LABELS: Record<Frequency, string> = {
  daily: 'Cada día', weekdays: 'Entre semana', weekends: 'Fines de semana',
  weekly: 'Cada semana', monthly: 'Cada mes', custom: 'Días personalizados',
};

function renderMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export function AIPanel({ open, onClose, onAddItems }: Props) {
  const [phase, setPhase] = useState<Phase>('input');
  const [inputText, setInputText] = useState('');
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState<AIParseResult | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) {
      setPhase('input');
      setInputText('');
      setStepIdx(0);
      setResult(null);
    } else {
      setTimeout(() => taRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    if (phase !== 'thinking') return;
    if (stepIdx < THINKING_STEPS.length - 1) {
      const id = setTimeout(() => setStepIdx((i) => i + 1), 700);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setResult(parseAndRankItems(inputText));
      setPhase('confirm');
    }, 700);
    return () => clearTimeout(id);
  }, [phase, stepIdx, inputText]);

  if (!open) return null;

  const lineCount = inputText.trim().split('\n').filter((l) => l.trim().length > 2).length;
  const canAnalyze = lineCount >= 1;

  const startAnalysis = () => {
    if (!canAnalyze) return;
    setStepIdx(0);
    setPhase('thinking');
  };

  const goBack = () => {
    setPhase('input');
    setResult(null);
    setTimeout(() => taRef.current?.focus(), 80);
  };

  const confirmInsert = () => {
    if (!result) return;
    onAddItems(
      result.tasks.map((t) => ({ text: t.text, dueAt: null })),
      result.routines.map((r) => ({ title: r.title, frequency: r.frequency, days: r.days, timeOfDay: r.timeOfDay })),
    );
    setPhase('success');
    setTimeout(() => onClose(), 2000);
  };

  const totalItems = (result?.tasks.length ?? 0) + (result?.routines.length ?? 0);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={phase === 'thinking' ? undefined : onClose} />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-white dark:bg-gray-950 shadow-2xl border-l border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Planificador IA</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">Tareas y rutinas automáticas</p>
            </div>
          </div>
          {phase !== 'thinking' && (
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* INPUT */}
          {phase === 'input' && (
            <div className="p-5 flex flex-col gap-5 h-full">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Escribe todo lo que tienes que hacer, <strong className="text-gray-800 dark:text-gray-200">una línea por elemento</strong>. La IA detectará qué son <strong className="text-gray-800 dark:text-gray-200">tareas puntuales</strong> y qué son <strong className="text-gray-800 dark:text-gray-200">rutinas recurrentes</strong>, y los organizará por prioridad.
              </p>

              <div className="flex flex-1 flex-col">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Tus tareas y rutinas
                </label>
                <textarea
                  ref={taRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Reunión con el cliente a las 10h\nRevisar el informe del trimestre\nHacer ejercicio cada mañana\nResponder correos pendientes\nMeditación diaria antes de dormir\nPresentación para el viernes`}
                  className="flex-1 min-h-[280px] resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all leading-relaxed"
                />
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-600">
                  {lineCount} elemento{lineCount !== 1 ? 's' : ''} detectado{lineCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          {/* THINKING */}
          {phase === 'thinking' && (
            <div className="flex flex-col items-center justify-center h-full py-20 px-6">
              <div className="relative mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-7 h-7 text-white animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-blue-400/20 animate-ping" />
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white mb-1 text-center">
                {THINKING_STEPS[stepIdx]}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Un momento…</p>
              <div className="flex gap-2">
                {THINKING_STEPS.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= stepIdx ? 'bg-blue-500 w-6' : 'bg-gray-200 dark:bg-gray-700 w-3'}`} />
                ))}
              </div>
            </div>
          )}

          {/* CONFIRM */}
          {phase === 'confirm' && result && (
            <div className="p-5 flex flex-col gap-5">
              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 p-4">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(result.summary) }} />
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
                        <div key={i} className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5">
                          <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{i + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug mb-1.5">{task.text}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.classes}`}>
                                <Icon className="w-3 h-3" />{cfg.label}
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
                    {result.routines.map((routine: ParsedRoutine, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5">
                        <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center">
                          <RefreshCw className="w-3 h-3 text-violet-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug mb-1.5">{routine.title}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900">
                              <RefreshCw className="w-3 h-3" />
                              {FREQ_LABELS[routine.frequency]}
                            </span>
                            {routine.timeOfDay && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">{routine.timeOfDay}</span>
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

          {/* SUCCESS */}
          {phase === 'success' && (
            <div className="flex flex-col items-center justify-center h-full py-20 px-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg mb-6">
                <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">¡Todo añadido!</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                {result?.tasks.length ? `${result.tasks.length} tarea${result.tasks.length !== 1 ? 's' : ''}` : ''}
                {result?.tasks.length && result?.routines.length ? ' y ' : ''}
                {result?.routines.length ? `${result.routines.length} rutina${result.routines.length !== 1 ? 's' : ''}` : ''}
                {' '}añadida{totalItems !== 1 ? 's' : ''} a tu lista.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 flex-shrink-0">
          {phase === 'input' && (
            <button onClick={startAnalysis} disabled={!canAnalyze}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900 text-white text-sm font-semibold transition-colors">
              <Sparkles className="w-4 h-4" />
              Analizar con IA
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {phase === 'confirm' && result && (
            <div className="flex gap-2">
              <button onClick={goBack}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Editar
              </button>
              <button onClick={confirmInsert}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors">
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
