import type { Frequency } from './types';

export type TaskPriority = 'high' | 'medium' | 'low';

export interface ParsedTask {
  text: string;
  priority: TaskPriority;
  minutes: number;
  reason: string;
}

export interface ParsedRoutine {
  title: string;
  frequency: Frequency;
  days: number[];
  timeOfDay: string | null;
  reason: string;
}

export interface AIParseResult {
  tasks: ParsedTask[];
  routines: ParsedRoutine[];
  summary: string;
}

const KEYWORDS: Record<string, number> = {
  reunión: 60, reunion: 60, call: 30, llamada: 30, presentar: 45, presentación: 45,
  revisar: 30, review: 30, revisión: 30, escribir: 45, redactar: 40, documento: 30,
  correo: 15, email: 15, responder: 15, gym: 60, comprar: 20, compra: 20,
  preparar: 40, planificar: 30, leer: 25, estudiar: 45, diseñar: 60, design: 60,
  programar: 60, code: 60, deploy: 20, bug: 30, fix: 20, arreglar: 25, organizar: 25,
  llamar: 15, agendar: 10, actualizar: 20, subir: 10, post: 20, publicar: 20,
  entrevista: 60, training: 45, capacitación: 45, configurar: 30, instalar: 20,
};

const HIGH_PRIORITY_WORDS = [
  'urgente', 'urgencia', 'importante', 'crítico', 'deadline', 'hoy', 'ahora',
  'inmediato', 'prioridad', 'entrega', 'reunión', 'reunion', 'presentación', 'presentar',
  'cliente', 'jefe', 'llamada', 'entrevista',
];

const LOW_PRIORITY_WORDS = [
  'comprar', 'compra', 'limpiar', 'ordenar', 'opcional', 'cuando pueda',
];

const ROUTINE_SIGNALS: string[] = [
  'cada día', 'todos los días', 'diariamente', 'a diario',
  'cada mañana', 'cada noche', 'por las mañanas', 'por las noches',
  'cada semana', 'semanalmente', 'cada lunes', 'cada martes', 'cada miércoles',
  'cada jueves', 'cada viernes', 'cada sábado', 'cada domingo',
  'entre semana', 'días laborables', 'fines de semana', 'fin de semana',
  'cada mes', 'mensualmente', 'rutina', 'hábito', 'hábito de',
  'antes de dormir', 'al despertar', 'al levantarme', 'al acostarme',
  'regularmente', 'ejercicio diario', 'meditación diaria',
  'de lunes a', 'de martes a', 'de miércoles a', 'de jueves a', 'de viernes a',
  'de sábado a', 'de domingo a',
];

const WEEKDAY_MAP: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miércoles: 3, jueves: 4, viernes: 5, sábado: 6,
};

function detectFrequency(text: string): { frequency: Frequency; days: number[]; timeOfDay: string | null } {
  const lower = text.toLowerCase();

  // Detect "de X a Y" day ranges (e.g. "de martes a domingo")
  const rangeMatch = lower.match(/de\s+(lunes|martes|miércoles|jueves|viernes|sábado|domingo)\s+a\s+(lunes|martes|miércoles|jueves|viernes|sábado|domingo)/);
  if (rangeMatch) {
    const startIdx = WEEKDAY_MAP[rangeMatch[1]];
    const endIdx = WEEKDAY_MAP[rangeMatch[2]];
    const rangeDays: number[] = [];
    if (startIdx <= endIdx) {
      for (let i = startIdx; i <= endIdx; i++) rangeDays.push(i);
    } else {
      // wraps around the week, e.g. viernes a martes
      for (let i = startIdx; i <= 6; i++) rangeDays.push(i);
      for (let i = 0; i <= endIdx; i++) rangeDays.push(i);
    }
    return { frequency: 'custom', days: rangeDays, timeOfDay: null };
  }

  if (lower.includes('fines de semana') || lower.includes('fin de semana') || lower.includes('cada sábado') || lower.includes('cada domingo')) {
    return { frequency: 'weekends', days: [0, 6], timeOfDay: null };
  }
  if (lower.includes('entre semana') || lower.includes('días laborables')) {
    return { frequency: 'weekdays', days: [1, 2, 3, 4, 5], timeOfDay: null };
  }
  if (lower.includes('cada mes') || lower.includes('mensualmente')) {
    return { frequency: 'monthly', days: [], timeOfDay: null };
  }
  if (lower.includes('cada semana') || lower.includes('semanalmente')) {
    const days: number[] = [];
    for (const [name, idx] of Object.entries(WEEKDAY_MAP)) {
      if (lower.includes(name)) days.push(idx);
    }
    return { frequency: 'weekly', days: days.length ? days : [1], timeOfDay: null };
  }

  // Detect specific weekly days
  const specificDays: number[] = [];
  for (const [name, idx] of Object.entries(WEEKDAY_MAP)) {
    if (lower.includes(`cada ${name}`)) specificDays.push(idx);
  }
  if (specificDays.length > 0) {
    return { frequency: 'weekly', days: specificDays, timeOfDay: null };
  }

  // Detect time of day hints
  let timeOfDay: string | null = null;
  if (lower.includes('mañana') || lower.includes('levant') || lower.includes('despertar') || lower.includes('desayuno')) {
    timeOfDay = '08:00';
  } else if (lower.includes('noche') || lower.includes('dormir') || lower.includes('acostar')) {
    timeOfDay = '22:00';
  } else if (lower.includes('mediodía') || lower.includes('almuerzo')) {
    timeOfDay = '13:00';
  }

  return { frequency: 'daily', days: [], timeOfDay };
}

function isRoutine(text: string): boolean {
  const lower = text.toLowerCase();
  return ROUTINE_SIGNALS.some((signal) => lower.includes(signal));
}

function estimateMinutes(text: string): number {
  const lower = text.toLowerCase();
  for (const [kw, mins] of Object.entries(KEYWORDS)) {
    if (lower.includes(kw)) return mins;
  }
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount <= 3) return 15;
  if (wordCount <= 8) return 25;
  return 35;
}

function scorePriority(text: string): TaskPriority {
  const lower = text.toLowerCase();
  for (const w of HIGH_PRIORITY_WORDS) {
    if (lower.includes(w)) return 'high';
  }
  for (const w of LOW_PRIORITY_WORDS) {
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
  daily: 'diaria', weekdays: 'entre semana', weekends: 'fines de semana',
  weekly: 'semanal', monthly: 'mensual', custom: 'días personalizados',
};

const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

export function parseAndRankItems(input: string): AIParseResult | null {
  const lines = input
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  if (lines.length === 0) return null;

  const tasks: ParsedTask[] = [];
  const routines: ParsedRoutine[] = [];

  for (const line of lines) {
    if (isRoutine(line)) {
      const { frequency, days, timeOfDay } = detectFrequency(line);
      routines.push({
        title: line,
        frequency,
        days,
        timeOfDay,
        reason: `Rutina ${FREQ_LABELS[frequency]} detectada`,
      });
    } else {
      const priority = scorePriority(line);
      const minutes = estimateMinutes(line);
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
  parts.push(`¿El orden y la clasificación te parecen correctos?`);

  return { tasks, routines, summary: parts.join(' ') };
}
