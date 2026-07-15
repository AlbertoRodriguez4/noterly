import { useEffect, useMemo, useState } from 'react';
import { Plus, Moon, Sun, Sparkles, CheckSquare, RefreshCw, Loader2, List } from 'lucide-react';
import type { Filter, Task, Routine, Frequency } from './types';
import { supabase } from './supabase';
import { useDarkMode } from './useDarkMode';
import { useNow } from './useNow';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { FilterChips } from './FilterChips';
import { EmptyState } from './EmptyState';
import { RoutineCard } from './RoutineCard';
import { RoutineModal } from './RoutineModal';
import { AIPanel } from './AIPanel';

type View = 'tasks' | 'routines' | 'all';

function dbToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    text: row.text as string,
    completed: row.completed as boolean,
    dueAt: row.due_at ? new Date(row.due_at as string).getTime() : null,
    createdAt: new Date(row.created_at as string).getTime(),
    updatedAt: new Date(row.updated_at as string).getTime(),
  };
}

function dbToRoutine(row: Record<string, unknown>): Routine {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    frequency: row.frequency as Frequency,
    days: (row.days as number[]) ?? [],
    timeOfDay: (row.time_of_day as string | null) ?? null,
    streak: (row.streak as number) ?? 0,
    lastDoneAt: row.last_done_at ? new Date(row.last_done_at as string).getTime() : null,
    createdAt: new Date(row.created_at as string).getTime(),
    updatedAt: new Date(row.updated_at as string).getTime(),
  };
}

export default function App() {
  const { dark, toggle } = useDarkMode();
  const now = useNow();

  const [view, setView] = useState<View>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<Filter>('pending');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: tasksData }, { data: routinesData }] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('routines').select('*').order('created_at', { ascending: false }),
      ]);
      if (tasksData) setTasks(tasksData.map(dbToTask));
      if (routinesData) setRoutines(routinesData.map(dbToRoutine));
      setLoading(false);
    }
    load();
  }, []);

  // Tasks
  const counts = useMemo(() => ({
    pending: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
    all: tasks.length,
  }), [tasks]);

  const sortedTasks = useMemo(() => {
    const list = [...tasks];
    list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.dueAt && b.dueAt) return a.dueAt - b.dueAt;
      if (a.dueAt) return -1;
      if (b.dueAt) return 1;
      return b.createdAt - a.createdAt;
    });
    return list;
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (filter === 'pending') return sortedTasks.filter((t) => !t.completed);
    if (filter === 'completed') return sortedTasks.filter((t) => t.completed);
    return sortedTasks;
  }, [sortedTasks, filter]);

  const todayDow = new Date(now).getDay();

  const todaysRoutines = useMemo(() => {
    return routines.filter((r) => {
      if (r.frequency === 'daily') return true;
      if (r.frequency === 'weekdays') return todayDow >= 1 && todayDow <= 5;
      if (r.frequency === 'weekends') return todayDow === 0 || todayDow === 6;
      if (r.frequency === 'weekly' || r.frequency === 'custom') return r.days.includes(todayDow);
      if (r.frequency === 'monthly') return new Date(now).getDate() === 1;
      return false;
    });
  }, [routines, todayDow, now]);

  const handleSaveTask = async (text: string, dueAt: number | null) => {
    if (editingTask) {
      const updated = { text, due_at: dueAt ? new Date(dueAt).toISOString() : null, updated_at: new Date().toISOString() };
      const { data } = await supabase.from('tasks').update(updated).eq('id', editingTask.id).select().maybeSingle();
      if (data) setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? dbToTask(data) : t)));
    } else {
      const insert = { text, due_at: dueAt ? new Date(dueAt).toISOString() : null };
      const { data } = await supabase.from('tasks').insert(insert).select().maybeSingle();
      if (data) setTasks((prev) => [dbToTask(data), ...prev]);
    }
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updated = { completed: !task.completed, updated_at: new Date().toISOString() };
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    await supabase.from('tasks').update(updated).eq('id', id);
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  };

  // Routines
  const handleSaveRoutine = async (
    data: Omit<Routine, 'id' | 'streak' | 'lastDoneAt' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingRoutine) {
      const updated = {
        title: data.title, description: data.description, frequency: data.frequency,
        days: data.days, time_of_day: data.timeOfDay, updated_at: new Date().toISOString(),
      };
      const { data: row } = await supabase.from('routines').update(updated).eq('id', editingRoutine.id).select().maybeSingle();
      if (row) setRoutines((prev) => prev.map((r) => (r.id === editingRoutine.id ? dbToRoutine(row) : r)));
    } else {
      const insert = {
        title: data.title, description: data.description, frequency: data.frequency,
        days: data.days, time_of_day: data.timeOfDay,
      };
      const { data: row } = await supabase.from('routines').insert(insert).select().maybeSingle();
      if (row) setRoutines((prev) => [dbToRoutine(row), ...prev]);
    }
    setRoutineModalOpen(false);
    setEditingRoutine(null);
  };

  const markRoutineDone = async (routine: Routine) => {
    const today = new Date();
    const lastDone = routine.lastDoneAt ? new Date(routine.lastDoneAt) : null;
    const wasYesterday = lastDone
      ? new Date(lastDone.getTime() + 86_400_000).toDateString() === today.toDateString()
      : false;
    const newStreak = wasYesterday ? routine.streak + 1 : 1;
    const updated = { streak: newStreak, last_done_at: today.toISOString(), updated_at: today.toISOString() };
    setRoutines((prev) => prev.map((r) => r.id === routine.id ? { ...r, streak: newStreak, lastDoneAt: today.getTime() } : r));
    await supabase.from('routines').update(updated).eq('id', routine.id);
  };

  const deleteRoutine = async (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    await supabase.from('routines').delete().eq('id', id);
  };

  // AI bulk insert
  const handleAddItems = async (
    newTasks: Array<{ text: string; dueAt: number | null }>,
    newRoutines: Array<{ title: string; frequency: Frequency; days: number[]; timeOfDay: string | null }>,
  ) => {
    if (newTasks.length > 0) {
      const inserts = newTasks.map((t) => ({ text: t.text, due_at: t.dueAt ? new Date(t.dueAt).toISOString() : null }));
      const { data } = await supabase.from('tasks').insert(inserts).select();
      if (data) setTasks((prev) => [...data.map(dbToTask), ...prev]);
    }
    if (newRoutines.length > 0) {
      const inserts = newRoutines.map((r) => ({
        title: r.title, frequency: r.frequency, days: r.days, time_of_day: r.timeOfDay,
      }));
      const { data } = await supabase.from('routines').insert(inserts).select();
      if (data) setRoutines((prev) => [...data.map(dbToRoutine), ...prev]);
    }
    if (newTasks.length > 0) setView('tasks');
    else if (newRoutines.length > 0) setView('routines');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-xl mx-auto px-4 pb-32">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-md pt-8 pb-4">
          <p className="text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-1">
            {new Date(now).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {view === 'tasks' ? 'Tareas' : view === 'routines' ? 'Rutinas de hoy' : 'Todas las rutinas'}
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {view === 'tasks'
                  ? counts.pending === 0 ? 'Todo al día' : `${counts.pending} pendiente${counts.pending !== 1 ? 's' : ''}`
                  : view === 'routines'
                  ? `${todaysRoutines.length} rutina${todaysRoutines.length !== 1 ? 's' : ''} para hoy`
                  : `${routines.length} rutina${routines.length !== 1 ? 's' : ''} creada${routines.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAiOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                IA
              </button>
              <button
                onClick={toggle}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 mb-4">
            {(['tasks', 'routines', 'all'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  view === v
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {v === 'tasks' ? <CheckSquare className="w-4 h-4" /> : v === 'routines' ? <RefreshCw className="w-4 h-4" /> : <List className="w-4 h-4" />}
                {v === 'tasks' ? 'Tareas' : v === 'routines' ? 'Hoy' : 'Todas'}
              </button>
            ))}
          </div>

          {view === 'tasks' && (
            <FilterChips filter={filter} setFilter={setFilter} counts={counts} />
          )}
        </header>

        {/* Main content */}
        <main className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : view === 'tasks' ? (
            visibleTasks.length === 0 ? (
              <EmptyState filter={filter} onAdd={() => setTaskModalOpen(true)} />
            ) : (
              <div className="flex flex-col gap-2.5">
                {visibleTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    now={now}
                    onToggle={toggleTask}
                    onEdit={(t) => { setEditingTask(t); setTaskModalOpen(true); }}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            )
          ) : view === 'routines' ? (
            todaysRoutines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <RefreshCw className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">Nada que hacer hoy</h3>
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
                    onEdit={(r) => { setEditingRoutine(r); setRoutineModalOpen(true); }}
                    onDelete={deleteRoutine}
                  />
                ))}
              </div>
            )
          ) : (
            routines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <List className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">Sin rutinas creadas</h3>
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
                    onEdit={(r) => { setEditingRoutine(r); setRoutineModalOpen(true); }}
                    onDelete={deleteRoutine}
                  />
                ))}
              </div>
            )
          )}
        </main>
      </div>

      {/* FAB */}
      <button
        onClick={() => view === 'tasks' ? setTaskModalOpen(true) : setRoutineModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all duration-200 z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      <TaskModal
        open={taskModalOpen}
        initial={editingTask}
        onClose={() => { setTaskModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
      />

      <RoutineModal
        open={routineModalOpen}
        initial={editingRoutine}
        onClose={() => { setRoutineModalOpen(false); setEditingRoutine(null); }}
        onSave={handleSaveRoutine}
      />

      <AIPanel
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onAddItems={handleAddItems}
      />
    </div>
  );
}
