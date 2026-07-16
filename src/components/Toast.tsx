import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface Props {
  message: string;
  onUndo: () => void;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onUndo, onClose, duration = 5000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-xl shadow-gray-900/20 dark:shadow-white/10 animate-slide-up">
      <span className="text-sm font-medium">{message}</span>
      <div className="w-px h-4 bg-gray-700 dark:bg-gray-200" />
      <button
        onClick={() => {
          onUndo();
          onClose();
        }}
        className="flex items-center gap-1.5 text-sm font-semibold text-blue-400 dark:text-blue-600 hover:text-blue-300 dark:hover:text-blue-700 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Deshacer
      </button>
    </div>
  );
}
