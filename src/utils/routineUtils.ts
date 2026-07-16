import type { Routine } from '../types';

export function shouldShowToday(routine: Routine): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay();

  switch (routine.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'weekly':
    case 'custom':
      return routine.days.includes(dayOfWeek);
    case 'monthly': {
      const createdDay = new Date(routine.createdAt).getDate();
      return today.getDate() === createdDay;
    }
    default:
      return false;
  }
}

export function isDoneToday(routine: Routine): boolean {
  const todayStr = new Date().toISOString().split('T')[0];
  return routine.completedDates.includes(todayStr);
}

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
