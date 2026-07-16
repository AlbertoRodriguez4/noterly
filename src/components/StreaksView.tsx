import { Flame, CheckCircle2, Target, TrendingUp, RefreshCw, CheckSquare } from 'lucide-react';
import type { Task, Routine } from '../types';
import { getTodayStr, isDoneToday } from '../utils/routineUtils';

interface Props {
  tasks: Task[];
  routines: Routine[];
}

export function StreaksView({ tasks, routines }: Props) {
  const todayStr = getTodayStr();

  // ─── Estadísticas de Tareas ───
  const tasksCompletedToday = tasks.filter((t) => t.completed && t.dueDate === todayStr).length;
  // Si no hay dueDate asumo que también suma si la completó hoy. 
  // Para simplificar, contaremos tareas completadas sin importar cuándo, o podríamos filtrar por completadas recientemente si tuviéramos ese dato.
  // Pero al no tener completedAt en las tareas, solo puedo ver cuáles están 'completed'.
  // Vamos a considerar "Tareas completadas" como globales para las estadísticas globales.
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  // ─── Estadísticas de Rutinas ───
  const routinesDoneToday = routines.filter((r) => isDoneToday(r)).length;
  const totalRoutinesToday = routines.filter((r) => {
    // Es simplificación, usamos todos para no re-calcular shouldShowToday aquí si no lo importamos.
    // Lo ideal es tener un array todaysRoutines por prop o filtrado
    return true; 
  }).length; // Ojo, pasaremos todaysRoutines como prop o lo calcularemos mejor en App.tsx.

  // Calculamos mejor pasándole todaysRoutines para la gráfica de hoy.
  // Vamos a recalcular todaysRoutines localmente para ser consistentes.
  const isToday = (r: Routine) => {
    const d = new Date();
    const day = d.getDay();
    if (r.frequency === 'daily') return true;
    if (r.frequency === 'weekdays' && day >= 1 && day <= 5) return true;
    if (r.frequency === 'weekends' && (day === 0 || day === 6)) return true;
    if ((r.frequency === 'weekly' || r.frequency === 'custom') && r.days.includes(day)) return true;
    if (r.frequency === 'monthly' && d.getDate() === 1) return true;
    return false;
  };
  const todaysRoutines = routines.filter(isToday);
  const todaysRoutinesCount = todaysRoutines.length;
  const todaysRoutinesDone = todaysRoutines.filter(isDoneToday).length;

  // ─── Puntos Totales Hoy ───
  // Para las tareas completadas hoy, como no guardamos la fecha de completado,
  // simplemente sumaremos 1 por cada rutina completada hoy. Si quieres tareas, es difícil sin `completedAt`.
  // Asumiremos que Puntos de Hoy = Rutinas completadas hoy.
  const pointsToday = todaysRoutinesDone;

  // ─── Mejor Racha ───
  const bestStreak = routines.reduce((max, r) => Math.max(max, r.streak), 0);

  // ─── Tasa de éxito global ───
  const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Resumen Principal */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20">
          <div className="flex items-center gap-2 mb-3 opacity-90">
            <Flame className="w-5 h-5" />
            <h3 className="text-sm font-medium">Mejor Racha</h3>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold">{bestStreak}</span>
            <span className="text-sm opacity-80">días</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center gap-2 mb-3 opacity-90">
            <Target className="w-5 h-5" />
            <h3 className="text-sm font-medium">Puntos de hoy</h3>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-bold">{pointsToday}</span>
            <span className="text-sm opacity-80">pts</span>
          </div>
        </div>
      </div>

      {/* Estadísticas Secundarias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Rutinas Hoy */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Rutinas de hoy</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {todaysRoutinesDone} <span className="text-sm font-medium text-gray-400">/ {todaysRoutinesCount}</span>
            </p>
          </div>
        </div>

        {/* Tareas Globales */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Tareas completadas</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {completedTasks} <span className="text-sm font-medium text-gray-400">/ {totalTasks}</span>
            </p>
          </div>
        </div>

        {/* Tasa de éxito */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 sm:col-span-2">
          <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-end mb-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Tasa de éxito (Tareas)</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{successRate}%</p>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-violet-500 transition-all duration-500 rounded-full"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Rachas Activas */}
      {routines.filter((r) => r.streak > 0).length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Rachas activas</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {routines
              .filter((r) => r.streak > 0)
              .sort((a, b) => b.streak - a.streak)
              .map((routine) => (
                <div key={routine.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-orange-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {routine.title}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-orange-500">
                    {routine.streak} {routine.streak === 1 ? 'día' : 'días'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
