import type { Note } from './types';

export interface ScheduleBlock {
  noteId: string;
  text: string;
  start: number;
  end: number;
  startLabel: string;
  endLabel: string;
  minutes: number;
}

export interface PlanResult {
  summary: string;
  blocks: ScheduleBlock[];
  totalMinutes: number;
  freeMinutes: number;
  workStart: number;
  workEnd: number;
}

const KEYWORDS: Record<string, number> = {
  reunión: 60, reunion: 60, call: 30, llamada: 30, presentar: 45, presentación: 45,
  revisar: 30, review: 30, revisión: 30, escribir: 45, redactar: 40, documento: 30,
  correo: 15, email: 15, responder: 15, ejercicio: 30, gym: 60, comprar: 20, compra: 20,
  preparar: 40, planificar: 30, leer: 25, estudiar: 45, diseñar: 60, design: 60,
  programar: 60, code: 60, deploy: 20, bug: 30, fix: 20, arreglar: 25, organizar: 25,
  llamar: 15, agendar: 10, actualizar: 20, subir: 10, post: 20, publicar: 20,
  entrevista: 60, training: 45, capacitación: 45, configurar: 30, instalar: 20,
};

const LONG_TASKS = ['presentar', 'presentación', 'diseñar', 'design', 'programar', 'code', 'entrevista', 'reunión', 'reunion'];
const SHORT_TASKS = ['correo', 'email', 'responder', 'llamar', 'comprar', 'compra', 'subir', 'post', 'publicar', 'agendar'];

function estimateMinutes(text: string): number {
  const lower = text.toLowerCase();
  for (const kw of LONG_TASKS) {
    if (lower.includes(kw)) return Math.max(45, KEYWORDS[kw] ?? 60);
  }
  for (const [kw, mins] of Object.entries(KEYWORDS)) {
    if (lower.includes(kw)) return mins;
  }
  for (const kw of SHORT_TASKS) {
    if (lower.includes(kw)) return Math.min(15, KEYWORDS[kw] ?? 15);
  }
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount <= 3) return 15;
  if (wordCount <= 8) return 25;
  return 35;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function label(ts: number): string {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function dayLabel(ts: number): string {
  const d = new Date(ts);
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function planDay(notes: Note[], now: number): PlanResult | null {
  const pending = notes.filter((n) => !n.completed);
  if (pending.length === 0) return null;

  const todayStart = startOfDay(now);
  const isToday = (ts: number | null) => ts !== null && startOfDay(ts) === todayStart;

  const scored = pending.map((n) => {
    let score = 0;
    if (n.dueAt !== null) {
      const hoursUntil = (n.dueAt - now) / 3_600_000;
      if (hoursUntil < 0) score += 100;
      else if (hoursUntil < 3) score += 80;
      else if (hoursUntil < 12) score += 60;
      else if (hoursUntil < 24) score += 40;
      else score += 20;
    }
    const ageHours = (now - n.createdAt) / 3_600_000;
    score += Math.min(ageHours * 0.5, 15);
    return { note: n, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const workStart = new Date(todayStart);
  const currentHour = new Date(now).getHours();
  workStart.setHours(Math.max(currentHour, 9), 0, 0, 0);
  if (currentHour >= 20) workStart.setHours(9, 0, 0, 0);
  const workEnd = new Date(todayStart);
  workEnd.setHours(19, 0, 0, 0);

  const blocks: ScheduleBlock[] = [];
  let cursor = workStart.getTime();
  const workEndMs = workEnd.getTime();
  let scheduled = 0;

  for (const { note } of scored) {
    if (cursor >= workEndMs) break;
    const minutes = estimateMinutes(note.text);
    const end = Math.min(cursor + minutes * 60_000, workEndMs);
    const actualMinutes = Math.round((end - cursor) / 60_000);
    if (actualMinutes < 5) break;
    blocks.push({
      noteId: note.id,
      text: note.text,
      start: cursor,
      end,
      startLabel: label(cursor),
      endLabel: label(end),
      minutes: actualMinutes,
    });
    cursor = end + 10 * 60_000; // 10-min break
    scheduled++;
  }

  const totalMinutes = blocks.reduce((sum, b) => sum + b.minutes, 0);
  const freeMinutes = Math.max(0, Math.round((workEndMs - workStart.getTime()) / 60_000) - totalMinutes - (blocks.length > 0 ? (blocks.length - 1) * 10 : 0));

  const overdue = pending.filter((n) => n.dueAt !== null && n.dueAt < now);
  const todayTasks = pending.filter((n) => isToday(n.dueAt));
  const noDateTasks = pending.filter((n) => n.dueAt === null);

  const parts: string[] = [];

  parts.push(
    pending.length === 1
      ? `Tienes **1 tarea** pendiente para hoy ${dayLabel(now)}.`
      : `Tienes **${pending.length} tareas** pendientes para hoy ${dayLabel(now)}.`,
  );

  if (overdue.length > 0) {
    parts.push(
      overdue.length === 1
        ? `⚠️ Hay **1 tarea atrasada** que debería atenderse primero.`
        : `⚠️ Hay **${overdue.length} tareas atrasadas** que deberían atenderse primero.`,
    );
  }

  if (todayTasks.length > 0 && todayTasks.length !== pending.length) {
    parts.push(`${todayTasks.length} tienen fecha para hoy.`);
  }

  if (noDateTasks.length > 0) {
    parts.push(`${noDateTasks.length} no tienen fecha asignada.`);
  }

  if (blocks.length < pending.length) {
    const leftOut = pending.length - blocks.length;
    parts.push(
      `He organizado **${blocks.length}** en bloques de tiempo de **${pad(Math.floor(totalMinutes / 60))}h ${pad(totalMinutes % 60)}min**. Quedan ${leftOut} fuera del horario laboral (9:00–19:00); podrás retomarlas mañana.`,
    );
  } else {
    parts.push(
      `He organizado las **${blocks.length} tareas** en bloques que suman **${pad(Math.floor(totalMinutes / 60))}h ${pad(totalMinutes % 60)}min** de trabajo enfocado, con pausas de 10 min entre cada una.`,
    );
  }

  if (freeMinutes > 60) {
    parts.push(`Te quedan **~${Math.round(freeMinutes / 60)}h libres** para imprevistos o descanso.`);
  } else if (freeMinutes > 0) {
    parts.push(`Te quedan **${freeMinutes} min libres** para imprevistos.`);
  } else {
    parts.push(`Tu jornada está bastante ajustada — conviene priorizar y dejar lo menos urgente para mañana.`);
  }

  if (blocks.length > 0) {
    parts.push(`Empieza a las **${blocks[0].startLabel}** con la tarea más urgente y avanza en orden.`);
  }

  return {
    summary: parts.join(' '),
    blocks,
    totalMinutes,
    freeMinutes,
    workStart: workStart.getTime(),
    workEnd: workEndMs,
  };
}
