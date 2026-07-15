export type Filter = 'pending' | 'completed' | 'all';
export type Frequency = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'monthly' | 'custom';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface Routine {
  id: string;
  title: string;
  description: string | null;
  frequency: Frequency;
  days: number[];
  timeOfDay: string | null;
  streak: number;
  lastDoneAt: number | null;
  createdAt: number;
  updatedAt: number;
}
