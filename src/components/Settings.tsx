import { type ReactNode, useState, useRef } from 'react';
import { X, Plus, RotateCcw, Download, Upload, AlertTriangle, Tag, Clock, RefreshCw } from 'lucide-react';
import type { AISettings } from '../types';
import { DEFAULT_AI_SETTINGS } from '../utils/defaultSettings';
import { exportData, importData } from '../utils/exportImport';

interface Props {
  open: boolean;
  onClose: () => void;
  settings: AISettings;
  onUpdateSettings: (settings: AISettings) => void;
}

function KeywordSection({
  title,
  icon,
  items,
  onRemove,
  inputValue,
  onInputChange,
  onAdd,
  placeholder,
  pillClass,
}: {
  title: string;
  icon: ReactNode;
  items: string[];
  onRemove: (item: string) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  placeholder: string;
  pillClass: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((item) => (
          <span
            key={item}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${pillClass}`}
          >
            {item}
            <button
              onClick={() => onRemove(item)}
              className="hover:text-red-500 transition-colors"
              aria-label={`Eliminar ${item}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onAdd();
          }}
        />
        <button
          onClick={onAdd}
          className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          aria-label={`Añadir a ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function Settings({ open, onClose, settings, onUpdateSettings }: Props) {
  const [newHighWord, setNewHighWord] = useState('');
  const [newLowWord, setNewLowWord] = useState('');
  const [newSignal, setNewSignal] = useState('');
  const [newDurationWord, setNewDurationWord] = useState('');
  const [newDurationMinutes, setNewDurationMinutes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const addHighPriority = () => {
    const word = newHighWord.trim().toLowerCase();
    if (word && !settings.highPriorityKeywords.includes(word)) {
      onUpdateSettings({ ...settings, highPriorityKeywords: [...settings.highPriorityKeywords, word] });
      setNewHighWord('');
    }
  };

  const removeHighPriority = (word: string) => {
    onUpdateSettings({
      ...settings,
      highPriorityKeywords: settings.highPriorityKeywords.filter((w) => w !== word),
    });
  };

  const addLowPriority = () => {
    const word = newLowWord.trim().toLowerCase();
    if (word && !settings.lowPriorityKeywords.includes(word)) {
      onUpdateSettings({ ...settings, lowPriorityKeywords: [...settings.lowPriorityKeywords, word] });
      setNewLowWord('');
    }
  };

  const removeLowPriority = (word: string) => {
    onUpdateSettings({
      ...settings,
      lowPriorityKeywords: settings.lowPriorityKeywords.filter((w) => w !== word),
    });
  };

  const addSignal = () => {
    const signal = newSignal.trim().toLowerCase();
    if (signal && !settings.routineSignals.includes(signal)) {
      onUpdateSettings({ ...settings, routineSignals: [...settings.routineSignals, signal] });
      setNewSignal('');
    }
  };

  const removeSignal = (signal: string) => {
    onUpdateSettings({
      ...settings,
      routineSignals: settings.routineSignals.filter((s) => s !== signal),
    });
  };

  const addDuration = () => {
    const word = newDurationWord.trim().toLowerCase();
    const mins = parseInt(newDurationMinutes);
    if (word && !isNaN(mins) && mins > 0) {
      onUpdateSettings({
        ...settings,
        durationKeywords: { ...settings.durationKeywords, [word]: mins },
      });
      setNewDurationWord('');
      setNewDurationMinutes('');
    }
  };

  const removeDuration = (word: string) => {
    const newKeywords = { ...settings.durationKeywords };
    delete newKeywords[word];
    onUpdateSettings({ ...settings, durationKeywords: newKeywords });
  };

  const restoreDefaults = () => {
    onUpdateSettings(DEFAULT_AI_SETTINGS);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importData(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Ajustes del Planificador IA</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar ajustes"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* High priority keywords */}
          <KeywordSection
            title="Palabras de prioridad alta"
            icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
            items={settings.highPriorityKeywords}
            onRemove={removeHighPriority}
            inputValue={newHighWord}
            onInputChange={setNewHighWord}
            onAdd={addHighPriority}
            placeholder="Ej: crítico, deadline..."
            pillClass="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400"
          />

          {/* Low priority keywords */}
          <KeywordSection
            title="Palabras de prioridad baja"
            icon={<Tag className="w-4 h-4 text-green-500" />}
            items={settings.lowPriorityKeywords}
            onRemove={removeLowPriority}
            inputValue={newLowWord}
            onInputChange={setNewLowWord}
            onAdd={addLowPriority}
            placeholder="Ej: opcional, hobby..."
            pillClass="bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400"
          />

          {/* Duration keywords */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Duración estimada por palabra
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(settings.durationKeywords).map(([word, mins]) => (
                <span
                  key={word}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                >
                  {word}: {mins}min
                  <button
                    onClick={() => removeDuration(word)}
                    className="hover:text-red-500 transition-colors"
                    aria-label={`Eliminar ${word}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newDurationWord}
                onChange={(e) => setNewDurationWord(e.target.value)}
                placeholder="Palabra"
                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addDuration();
                }}
              />
              <input
                type="number"
                value={newDurationMinutes}
                onChange={(e) => setNewDurationMinutes(e.target.value)}
                placeholder="Min"
                min="1"
                className="w-20 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addDuration();
                }}
              />
              <button
                onClick={addDuration}
                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                aria-label="Añadir duración"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Routine signals */}
          <KeywordSection
            title="Señales de rutina"
            icon={<RefreshCw className="w-4 h-4 text-violet-500" />}
            items={settings.routineSignals}
            onRemove={removeSignal}
            inputValue={newSignal}
            onInputChange={setNewSignal}
            onAdd={addSignal}
            placeholder="Ej: cada semana, al despertar..."
            pillClass="bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400"
          />

          {/* Restore defaults */}
          <button
            onClick={restoreDefaults}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full justify-center"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar valores por defecto
          </button>

          {/* Export / Import */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Datos</h3>
            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar datos
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Importar datos
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
