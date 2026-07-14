export type Filter = 'pending' | 'completed' | 'all';

export interface Note {
  id: string;
  text: string;
  completed: boolean;
  dueAt: number | null;
  createdAt: number;
  updatedAt: number;
}
