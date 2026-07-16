import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, Check, ChevronLeft, RefreshCw, ArrowUp, Minus, ArrowDown, Loader2, Edit3, Trash2, PlusCircle } from 'lucide-react';
import type { AISettings, AIParseResult, TaskPriority, Frequency, Task, Routine } from '../types';
import { parseAndRankItems } from '../utils/aiPlanner';

interface Props {
  open: boolean;
  onClose: () => void;
  onApplyAIActions: (result: AIParseResult) => void;
  settings: AISettings;
  currentTasks: Task[];
  currentRoutines: Routine[];
}

const THINKING_STEPS = [
  'Leyendo tus entradas…',
  'Analizando tareas y rutinas actuales…',
  'Generando modificaciones y clasificaciones…',
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

export function AIPlanner({ open, onClose, onApplyAIActions, settings, currentTasks, currentRoutines }: Props) {
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

  const startAnalysis = async () => {
    setPhase('thinking');
    setStepIdx(0);

    const stepInterval = setInterval(() => {
      setStepIdx((prev) => (prev < THINKING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    const parsed = await parseAndRankItems(input, settings, currentTasks, currentRoutines);

    clearInterval(stepInterval);
    setStepIdx(THINKING_STEPS.length - 1);

    if (parsed) {
      setResult(parsed);
      setPhase('confirm');
    } else {
      alert('Hubo un error al contactar con la IA. Inténtalo de nuevo.');
      setPhase('input');
    }
  };

  const goBack = () => {
    setPhase('input');
    setResult(null);
  };

  const confirmInsert = () => {
    if (result) {
      onApplyAIActions(result);
      setPhase('success');
      setTimeout(() => onClose(), 1500);
    }
  };

  const totalItems = result ? (
    result.tasksToAdd.length + result.tasksToEdit.length + result.tasksToDelete.length +
    result.routinesToAdd.length + result.routinesToEdit.length + result.routinesToDelete.length
  ) : 0;

  if (!open) return null;

  const renderSectionHeader = (title: string, Icon: any, colorClass: string, count: number) => {
    if (count === 0) return null;
    return (
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2 mt-4 first:mt-0">
        <span className={`w-5 h-5 rounded-md ${colorClass} flex items-center justify-center`}>
          <Icon className="w-3 h-3" />
        </span>
        {title} ({count})
      </h3>
    );
  };

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
              <p className="text-xs text-gray-400 dark:text-gray-500">Gestión inteligente de tareas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {phase === 'input' && (
            <div className="p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Pide lo que necesites. Puedes crear tareas, editar rutinas existentes o pedir que se borren elementos.
              </p>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  'Añade comprar café urgente\\nCambia mi rutina de meditación a las tardes\\nBorra la tarea de llamar al cliente'
                }
                rows={10}
                className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
          )}

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

              {/* Tareas a Añadir */}
              {renderSectionHeader('Nuevas Tareas', PlusCircle, 'bg-blue-100 dark:bg-blue-950 text-blue-500', result.tasksToAdd.length)}
              <div className="flex flex-col gap-2">
                {result.tasksToAdd.map((task, i) => {
                  const cfg = PRIORITY_CONFIG[task.priority];
                  const Icon = cfg.icon;
                  return (
                    <div key={`add-t-${i}`} className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5">
                      <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-500 flex items-center justify-center"><PlusCircle className="w-3 h-3" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug mb-1.5">{task.text}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.classes}`}>
                            <Icon className="w-3 h-3" /> {cfg.label}
                          </span>
                          <span className="text-xs text-gray-400">~{task.minutes} min</span>
                          {task.startTime && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                              {task.startTime}{task.endTime ? ` - ${task.endTime}` : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{task.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tareas a Editar */}
              {renderSectionHeader('Tareas Modificadas', Edit3, 'bg-yellow-100 dark:bg-yellow-950 text-yellow-600', result.tasksToEdit.length)}
              <div className="flex flex-col gap-2">
                {result.tasksToEdit.map((edit, i) => {
                  const original = currentTasks.find(t => t.id === edit.id);
                  return (
                    <div key={`edit-t-${i}`} className="flex items-start gap-3 rounded-xl border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-900/10 p-3.5">
                      <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 flex items-center justify-center"><Edit3 className="w-3 h-3" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug mb-1.5">
                          <span className="line-through text-gray-400 mr-2">{original?.text}</span>
                          {edit.text || original?.text}
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">{edit.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tareas a Borrar */}
              {renderSectionHeader('Tareas a Borrar', Trash2, 'bg-red-100 dark:bg-red-950 text-red-500', result.tasksToDelete.length)}
              <div className="flex flex-col gap-2">
                {result.tasksToDelete.map((id, i) => {
                  const original = currentTasks.find(t => t.id === id);
                  return (
                    <div key={`del-t-${i}`} className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-3.5 opacity-75">
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-red-600 dark:text-red-400 line-through">{original?.text || 'Tarea desconocida'}</p>
                    </div>
                  );
                })}
              </div>

              {/* Rutinas a Añadir */}
              {renderSectionHeader('Nuevas Rutinas', PlusCircle, 'bg-violet-100 dark:bg-violet-950 text-violet-500', result.routinesToAdd.length)}
              <div className="flex flex-col gap-2">
                {result.routinesToAdd.map((routine, i) => (
                  <div key={`add-r-${i}`} className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5">
                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-violet-50 dark:bg-violet-900/50 text-violet-500 flex items-center justify-center"><RefreshCw className="w-3 h-3" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug mb-1.5">{routine.title}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 border border-violet-200 dark:border-violet-900">
                          {FREQ_LABELS[routine.frequency]}
                        </span>
                        {routine.startTime && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                            {routine.startTime}{routine.endTime ? ` - ${routine.endTime}` : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{routine.reason}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rutinas a Editar */}
              {renderSectionHeader('Rutinas Modificadas', Edit3, 'bg-yellow-100 dark:bg-yellow-950 text-yellow-600', result.routinesToEdit.length)}
              <div className="flex flex-col gap-2">
                {result.routinesToEdit.map((edit, i) => {
                  const original = currentRoutines.find(r => r.id === edit.id);
                  return (
                    <div key={`edit-r-${i}`} className="flex items-start gap-3 rounded-xl border border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-900/10 p-3.5">
                      <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 flex items-center justify-center"><Edit3 className="w-3 h-3" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-100 leading-snug mb-1.5">
                          {edit.title || original?.title}
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">{edit.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rutinas a Borrar */}
              {renderSectionHeader('Rutinas a Borrar', Trash2, 'bg-red-100 dark:bg-red-950 text-red-500', result.routinesToDelete.length)}
              <div className="flex flex-col gap-2">
                {result.routinesToDelete.map((id, i) => {
                  const original = currentRoutines.find(r => r.id === id);
                  return (
                    <div key={`del-r-${i}`} className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-3.5 opacity-75">
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-red-600 dark:text-red-400 line-through">{original?.title || 'Rutina desconocida'}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUCCESS PHASE */}
          {phase === 'success' && (
            <div className="flex flex-col items-center justify-center h-full py-20 px-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg mb-6">
                <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">¡Completado!</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                Se han procesado {totalItems} elemento{totalItems !== 1 ? 's' : ''}.
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
              Ejecutar IA
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
                Aplicar {totalItems} cambio{totalItems !== 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
