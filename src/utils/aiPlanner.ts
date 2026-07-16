import type { AISettings, AIParseResult, ParsedTask, ParsedRoutine, Frequency, TaskPriority } from '../types';

const WEEKDAY_MAP: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miércoles: 3, jueves: 4, viernes: 5, sábado: 6,
};

function detectFrequency(text: string): { frequency: Frequency; days: number[]; timeOfDay: string | null } {
  const lower = text.toLowerCase();

  // Detect "de X a Y" day ranges (e.g. "de martes a domingo")
  const rangeMatch = lower.match(
    /de\s+(lunes|martes|miércoles|jueves|viernes|sábado|domingo)\s+a\s+(lunes|martes|miércoles|jueves|viernes|sábado|domingo)/,
  );
  if (rangeMatch) {
    const startIdx = WEEKDAY_MAP[rangeMatch[1]];
    const endIdx = WEEKDAY_MAP[rangeMatch[2]];
    const rangeDays: number[] = [];
    if (startIdx <= endIdx) {
      for (let i = startIdx; i <= endIdx; i++) rangeDays.push(i);
    } else {
      for (let i = startIdx; i <= 6; i++) rangeDays.push(i);
      for (let i = 0; i <= endIdx; i++) rangeDays.push(i);
    }
    return { frequency: 'custom', days: rangeDays, timeOfDay: detectTime(lower) };
  }

  if (lower.includes('fines de semana') || lower.includes('fin de semana')) {
    return { frequency: 'weekends', days: [0, 6], timeOfDay: detectTime(lower) };
  }
  if (lower.includes('entre semana') || lower.includes('días laborables')) {
    return { frequency: 'weekdays', days: [1, 2, 3, 4, 5], timeOfDay: detectTime(lower) };
  }
  if (lower.includes('cada mes') || lower.includes('mensualmente')) {
    return { frequency: 'monthly', days: [], timeOfDay: detectTime(lower) };
  }
  if (lower.includes('cada semana') || lower.includes('semanalmente')) {
    const days: number[] = [];
    for (const [name, idx] of Object.entries(WEEKDAY_MAP)) {
      if (lower.includes(name)) days.push(idx);
    }
    return { frequency: 'weekly', days: days.length ? days : [1], timeOfDay: detectTime(lower) };
  }

  // Detect specific weekly days like "cada lunes"
  const specificDays: number[] = [];
  for (const [name, idx] of Object.entries(WEEKDAY_MAP)) {
    if (lower.includes(`cada ${name}`)) specificDays.push(idx);
  }
  if (specificDays.length > 0) {
    return { frequency: 'weekly', days: specificDays, timeOfDay: detectTime(lower) };
  }

  return { frequency: 'daily', days: [], timeOfDay: detectTime(lower) };
}

function detectTime(lower: string): string | null {
  if (lower.includes('mañana') || lower.includes('levant') || lower.includes('despertar') || lower.includes('desayuno')) {
    return '08:00';
  }
  if (lower.includes('mediodía') || lower.includes('almuerzo')) {
    return '13:00';
  }
  if (lower.includes('tarde') || lower.includes('siesta')) {
    return '17:00';
  }
  if (lower.includes('noche') || lower.includes('dormir') || lower.includes('acostar') || lower.includes('cena')) {
    return '22:00';
  }
  return null;
}

function isRoutine(text: string, signals: string[]): boolean {
  const lower = text.toLowerCase();
  return signals.some((signal) => lower.includes(signal));
}

function estimateMinutes(text: string, durationKeywords: Record<string, number>): number {
  const lower = text.toLowerCase();
  for (const [kw, mins] of Object.entries(durationKeywords)) {
    if (lower.includes(kw)) return mins;
  }
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount <= 3) return 15;
  if (wordCount <= 8) return 25;
  return 35;
}

function scorePriority(text: string, highWords: string[], lowWords: string[]): TaskPriority {
  const lower = text.toLowerCase();
  for (const w of highWords) {
    if (lower.includes(w)) return 'high';
  }
  for (const w of lowWords) {
    if (lower.includes(w)) return 'low';
  }
  return 'medium';
}

function buildTaskReason(priority: TaskPriority, minutes: number, text: string): string {
  const lower = text.toLowerCase();
  if (priority === 'high') {
    if (lower.includes('reunión') || lower.includes('reunion')) return 'Reunión o compromiso — alta prioridad';
    if (lower.includes('cliente')) return 'Involucra al cliente — no puede esperar';
    if (lower.includes('entrevista')) return 'Cita importante con fecha fija';
    return 'Marcada como urgente o de alta importancia';
  }
  if (priority === 'low') {
    return 'Tarea secundaria que no bloquea otras';
  }
  if (minutes >= 45) return 'Tarea de fondo que requiere concentración';
  if (minutes <= 15) return 'Tarea rápida — buena para huecos entre bloques';
  return 'Prioridad estándar — se encaja en la jornada';
}

const FREQ_LABELS: Record<Frequency, string> = {
  daily: 'diaria',
  weekdays: 'entre semana',
  weekends: 'fines de semana',
  weekly: 'semanal',
  monthly: 'mensual',
  custom: 'días personalizados',
};

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

export function parseAndRankItems(input: string, settings: AISettings): AIParseResult | null {
  const lines = input
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  if (lines.length === 0) return null;

  const tasks: ParsedTask[] = [];
  const routines: ParsedRoutine[] = [];

  for (const line of lines) {
    if (isRoutine(line, settings.routineSignals)) {
      const { frequency, days, timeOfDay } = detectFrequency(line);
      routines.push({
        title: line,
        frequency,
        days,
        timeOfDay,
        reason: `Rutina ${FREQ_LABELS[frequency]} detectada`,
      });
    } else {
      const priority = scorePriority(line, settings.highPriorityKeywords, settings.lowPriorityKeywords);
      const minutes = estimateMinutes(line, settings.durationKeywords);
      tasks.push({ text: line, priority, minutes, reason: buildTaskReason(priority, minutes, line) });
    }
  }

  tasks.sort((a, b) => {
    const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    return diff !== 0 ? diff : b.minutes - a.minutes;
  });

  const totalTasks = tasks.length;
  const totalRoutines = routines.length;
  const totalMin = tasks.reduce((s, t) => s + t.minutes, 0);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}min` : ''}`.trim() : `${mins}min`;

  const parts: string[] = [];
  if (totalTasks > 0 && totalRoutines > 0) {
    parts.push(`He identificado **${totalTasks} tarea${totalTasks !== 1 ? 's' : ''}** y **${totalRoutines} rutina${totalRoutines !== 1 ? 's' : ''}**.`);
  } else if (totalTasks > 0) {
    parts.push(`He identificado **${totalTasks} tarea${totalTasks !== 1 ? 's' : ''}** y las he ordenado por urgencia.`);
  } else {
    parts.push(`He identificado **${totalRoutines} rutina${totalRoutines !== 1 ? 's' : ''}** recurrentes.`);
  }
  if (totalTasks > 0) parts.push(`Tiempo estimado en tareas: **${timeStr}**.`);
  parts.push('¿El orden y la clasificación te parecen correctos?');

  return { tasks, routines, summary: parts.join(' ') };
}
