export type Filter = 'pending' | 'completed' | 'all';
export type Frequency = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'monthly' | 'custom';
export type TaskPriority = 'high' | 'medium' | 'low';
export type NoteColor = 'blue' | 'yellow' | 'green' | 'rose' | 'purple';

export interface Note {
  id: string;
  title: string;
  content: string | null;
  color: NoteColor;
  createdAt: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate: string | null;
  estimatedMinutes: number;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
}

export interface Routine {
  id: string;
  title: string;
  description: string | null;
  frequency: Frequency;
  days: number[];
  startTime: string | null;
  endTime: string | null;
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
  startTime: string | null;
  endTime: string | null;
  reason: string;
}

export interface ParsedRoutine {
  title: string;
  frequency: Frequency;
  days: number[];
  startTime: string | null;
  endTime: string | null;
  reason: string;
}

export interface TaskEdit {
  id: string;
  text?: string;
  priority?: TaskPriority;
  minutes?: number;
  startTime?: string | null;
  endTime?: string | null;
  reason: string;
}

export interface RoutineEdit {
  id: string;
  title?: string;
  frequency?: Frequency;
  days?: number[];
  startTime?: string | null;
  endTime?: string | null;
  reason: string;
}

export interface AIParseResult {
  tasksToAdd: ParsedTask[];
  tasksToEdit: TaskEdit[];
  tasksToDelete: string[];
  routinesToAdd: ParsedRoutine[];
  routinesToEdit: RoutineEdit[];
  routinesToDelete: string[];
  summary: string;
}
