import { useState, useMemo } from 'react';
import {
  Plus, CheckSquare, RefreshCw, List, Sparkles, Sun, Moon,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDarkMode } from './hooks/useDarkMode';
import { shouldShowToday, getTodayStr, getYesterdayStr } from './utils/routineUtils';
import { formatLongDate } from './utils/date';
import { DEFAULT_AI_SETTINGS } from './utils/defaultSettings';
import type { Task, Routine, Filter, Frequency, AISettings, ParsedTask, ParsedRoutine, TaskPriority } from './types';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { RoutineCard } from './components/RoutineCard';
import { RoutineModal } from './components/RoutineModal';
import { FilterChips } from './components/FilterChips';
import { EmptyState } from './components/EmptyState';
import { AIPlanner } from './components/AIPlanner';
import { Settings } from './components/Settings';

type View = 'tasks' | 'today' | 'all';

export default function App() {
  // ─── Persisted state ───
  const [tasks, setTasks] = useLocalStorage<Task[]>('noterly-tasks', []);
  const [routines, setRoutines] = useLocalStorage<Routine[]>('noterly-routines', []);
  const [aiSettings, setAISettings] = useLocalStorage<AISettings>('noterly-ai-settings', DEFAULT_AI_SETTINGS);

  // ─── UI state ───
  const [view, setView] = useState<View>('tasks');
  const [filter, setFilter] = useState<Filter>('pending');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [aiPlannerOpen, setAIPlannerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  // ─── Theme ───
  const { dark, toggle } = useDarkMode();

  // ─── Computed ───
  const counts = useMemo(
    () => ({
      pending: tasks.filter((t) => !t.completed).length,
      completed: tasks.filter((t) => t.completed).length,
      all: tasks.length,
    }),
    [tasks],
  );

  const visibleTasks = useMemo(() => {
    let filtered = tasks;
    if (filter === 'pending') filtered = tasks.filter((t) => !t.completed);
    if (filter === 'completed') filtered = tasks.filter((t) => t.completed);

    return [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [tasks, filter]);

  const todaysRoutines = useMemo(() => routines.filter(shouldShowToday), [routines]);

  // ─── Task CRUD ───
  const handleSaveTask = (data: { text: string; priority: TaskPriority; dueDate: string | null }) => {
    if (editingTask) {
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? { ...t, ...data } : t)));
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        text: data.text,
        completed: false,
        priority: data.priority,
        dueDate: data.dueDate,
        estimatedMinutes: 0,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // ─── Routine CRUD ───
  const handleSaveRoutine = (data: {
    title: string;
    description: string | null;
    frequency: Frequency;
    days: number[];
    timeOfDay: string | null;
  }) => {
    if (editingRoutine) {
      setRoutines((prev) => prev.map((r) => (r.id === editingRoutine.id ? { ...r, ...data } : r)));
    } else {
      const newRoutine: Routine = {
        id: crypto.randomUUID(),
        ...data,
        streak: 0,
        lastCompleted: null,
        completedDates: [],
        createdAt: new Date().toISOString(),
      };
      setRoutines((prev) => [newRoutine, ...prev]);
    }
    setRoutineModalOpen(false);
    setEditingRoutine(null);
  };

  const markRoutineDone = (routine: Routine) => {
    const today = getTodayStr();
    if (routine.completedDates.includes(today)) return;

    const yesterday = getYesterdayStr();
    const newStreak = routine.lastCompleted === yesterday || routine.lastCompleted === today
      ? routine.streak + 1
      : 1;

    setRoutines((prev) =>
      prev.map((r) =>
        r.id === routine.id
          ? {
              ...r,
              completedDates: [...r.completedDates, today],
              lastCompleted: today,
              streak: newStreak,
            }
          : r,
      ),
    );
  };

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  // ─── AI Planner ───
  const handleAddItems = (parsedTasks: ParsedTask[], parsedRoutines: ParsedRoutine[]) => {
    const newTasks: Task[] = parsedTasks.map((pt) => ({
      id: crypto.randomUUID(),
      text: pt.text,
      completed: false,
      priority: pt.priority,
      dueDate: null,
      estimatedMinutes: pt.minutes,
      createdAt: new Date().toISOString(),
    }));

    const newRoutines: Routine[] = parsedRoutines.map((pr) => ({
      id: crypto.randomUUID(),
      title: pr.title,
      description: null,
      frequency: pr.frequency,
      days: pr.days,
      timeOfDay: pr.timeOfDay,
      streak: 0,
      lastCompleted: null,
      completedDates: [],
      createdAt: new Date().toISOString(),
    }));

    if (newTasks.length > 0) setTasks((prev) => [...newTasks, ...prev]);
    if (newRoutines.length > 0) setRoutines((prev) => [...newRoutines, ...prev]);
  };

  // ─── Header subtitle ───
  const subtitle = (() => {
    if (view === 'tasks') {
      return counts.pending === 0
        ? 'Todo al día'
        : `${counts.pending} pendiente${counts.pending !== 1 ? 's' : ''}`;
    }
    if (view === 'today') {
      return `${todaysRoutines.length} rutina${todaysRoutines.length !== 1 ? 's' : ''} para hoy`;
    }
    return `${routines.length} rutina${routines.length !== 1 ? 's' : ''} creada${routines.length !== 1 ? 's' : ''}`;
  })();

  return (
    <div className="min-h-screen">
      <div className="max-w-xl mx-auto px-4 pb-24">
        {/* ─── Header ─── */}
        <header className="sticky top-0 z-20 pt-6 pb-4 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-xl">
          <p className="text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-1">
            {formatLongDate(new Date())}
          </p>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {view === 'tasks' ? 'Tareas' : view === 'today' ? 'Rutinas de hoy' : 'Todas las rutinas'}
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Ajustes"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAIPlannerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm"
                aria-label="Abrir planificador IA"
              >
                <Sparkles className="w-3.5 h-3.5" />
                IA
              </button>
              <button
                onClick={toggle}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mb-4">
            {(
              [
                { key: 'tasks' as const, label: 'Tareas', icon: CheckSquare },
                { key: 'today' as const, label: 'Hoy', icon: RefreshCw },
                { key: 'all' as const, label: 'Todas', icon: List },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  view === tab.key
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {view === 'tasks' && <FilterChips filter={filter} setFilter={setFilter} counts={counts} />}
        </header>

        {/* ─── Main content ─── */}
        <main className="pt-4">
          {view === 'tasks' ? (
            visibleTasks.length === 0 ? (
              <EmptyState filter={filter} onAdd={() => setTaskModalOpen(true)} />
            ) : (
              <div className="flex flex-col gap-2.5">
                {visibleTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setTaskModalOpen(true);
                    }}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            )
          ) : view === 'today' ? (
            todaysRoutines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <RefreshCw className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Nada que hacer hoy
                </h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mb-6">
                  No tienes rutinas programadas para hoy. Crea una nueva o revisa otro día.
                </p>
                <button
                  onClick={() => setRoutineModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nueva rutina
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {todaysRoutines.map((routine) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    onMarkDone={markRoutineDone}
                    onEdit={(r) => {
                      setEditingRoutine(r);
                      setRoutineModalOpen(true);
                    }}
                    onDelete={deleteRoutine}
                  />
                ))}
              </div>
            )
          ) : routines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <List className="w-7 h-7 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Sin rutinas creadas
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mb-6">
                Aún no has creado ninguna rutina. Crea la primera para empezar a organizar tus hábitos.
              </p>
              <button
                onClick={() => setRoutineModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nueva rutina
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {routines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onMarkDone={markRoutineDone}
                  onEdit={(r) => {
                    setEditingRoutine(r);
                    setRoutineModalOpen(true);
                  }}
                  onDelete={deleteRoutine}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ─── FAB ─── */}
      <button
        onClick={() => (view === 'tasks' ? setTaskModalOpen(true) : setRoutineModalOpen(true))}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all duration-200 z-30"
        aria-label={view === 'tasks' ? 'Nueva tarea' : 'Nueva rutina'}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* ─── Modals ─── */}
      <TaskModal
        open={taskModalOpen}
        initial={editingTask}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />

      <RoutineModal
        open={routineModalOpen}
        initial={editingRoutine}
        onClose={() => {
          setRoutineModalOpen(false);
          setEditingRoutine(null);
        }}
        onSave={handleSaveRoutine}
      />

      <AIPlanner
        open={aiPlannerOpen}
        onClose={() => setAIPlannerOpen(false)}
        onAddItems={handleAddItems}
        settings={aiSettings}
      />

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={aiSettings}
        onUpdateSettings={setAISettings}
      />
    </div>
  );
}
