const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatDue(dueDate: string): string {
  const due = new Date(dueDate + 'T00:00:00');
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(due) - startOfDay(now)) / 86_400_000);

  if (dayDiff === 0) return 'Hoy';
  if (dayDiff === 1) return 'Mañana';
  if (dayDiff === -1) return 'Ayer';
  if (dayDiff > 1 && dayDiff < 7) {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return days[due.getDay()].charAt(0).toUpperCase() + days[due.getDay()].slice(1);
  }
  if (dayDiff < -1) return `Hace ${Math.abs(dayDiff)} días`;
  return `${due.getDate()} ${MONTHS[due.getMonth()]}`;
}

export function isOverdue(dueDate: string): boolean {
  const due = new Date(dueDate + 'T23:59:59');
  return due.getTime() < Date.now();
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
