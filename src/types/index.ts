export type Filter = 'pending' | 'completed' | 'all';
export type Frequency = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'monthly' | 'custom';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate: string | null;
  estimatedMinutes: number;
  createdAt: string;
}

export interface Routine {
  id: string;
  title: string;
  description: string | null;
  frequency: Frequency;
  days: number[];
  timeOfDay: string | null;
  streak: number;
  lastCompleted: string | null;
  completedDates: string[];
  createdAt: string;
}

export interface AISettings {
  highPriorityKeywords: string[];
  lowPriorityKeywords: string[];
  durationKeywords: Record<string, number>;
  routineSignals: string[];
}

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
