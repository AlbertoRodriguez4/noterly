import { useState, useEffect } from 'react';
import { CheckSquare, RefreshCw, Flame, StickyNote, Sparkles, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: CheckSquare,
    title: 'Gestión de Tareas',
    description: 'Crea tareas con fecha límite, tiempo estimado y prioridades. Si te equivocas, usa el sistema de deshacer instantáneo.',
    colorClass: 'text-blue-500 bg-blue-100 dark:bg-blue-900/40',
  },
  {
    icon: RefreshCw,
    title: 'Rutinas Inteligentes',
    description: 'Establece hábitos recurrentes (diarios, fines de semana, días específicos). La app calculará qué te toca hacer cada día.',
    colorClass: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/40',
  },
  {
    icon: Flame,
    title: 'Rachas y Estadísticas',
    description: 'Mantén la motivación visualizando tu progreso. Suma puntos diarios, mejora tu tasa de éxito y bate tu récord de días consecutivos.',
    colorClass: 'text-orange-500 bg-orange-100 dark:bg-orange-900/40',
  },
  {
    icon: StickyNote,
    title: 'Notas Rápidas',
    description: 'Un tablón visual y colorido para apuntar ideas, recordatorios o cualquier cosa que no encaje como una tarea estructurada.',
    colorClass: 'text-amber-500 bg-amber-100 dark:bg-amber-900/40',
  },
  {
    icon: Sparkles,
    title: 'Asistente de IA',
    description: '¿No sabes cómo organizarte? Escribe qué quieres lograr y la Inteligencia Artificial desglosará tu objetivo en tareas y rutinas.',
    colorClass: 'text-violet-500 bg-violet-100 dark:bg-violet-900/40',
  },
];

export function Onboarding({ open, onClose }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col">
        {/* Header */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 text-center flex-1 flex flex-col items-center min-h-[260px] justify-center">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${step.colorClass}`}>
            <Icon className="w-10 h-10" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {step.title}
          </h2>
          
          <p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed max-w-[280px] mx-auto">
            {step.description}
          </p>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'w-6 bg-blue-600'
                    : 'w-2 bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 transition-colors ${
                currentStep === 0 
                  ? 'opacity-0 invisible' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
            >
              {currentStep === STEPS.length - 1 ? '¡Empezar!' : 'Siguiente'}
              {currentStep < STEPS.length - 1 && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <button 
              onClick={onClose}
              className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Saltar introducción
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
