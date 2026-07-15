const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const pad = (n: number) => String(n).padStart(2, '0');

export function formatDue(ts: number, now: number): string {
  const due = new Date(ts);
  const d = new Date(now);
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(due) - startOfDay(d)) / 86_400_000);
  const time = `${pad(due.getHours())}:${pad(due.getMinutes())}`;
  if (dayDiff === 0) return `Hoy · ${time}`;
  if (dayDiff === 1) return `Mañana · ${time}`;
  if (dayDiff === -1) return `Ayer · ${time}`;
  if (dayDiff > 1 && dayDiff < 7) {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return `${days[due.getDay()].charAt(0).toUpperCase()}${days[due.getDay()].slice(1)} · ${time}`;
  }
  return `${due.getDate()} ${MONTHS[due.getMonth()]} · ${time}`;
}

export function isOverdue(ts: number, now: number) {
  return ts < now;
}

export function toLocalInput(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value: string): number {
  return new Date(value).getTime();
}
