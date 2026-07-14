import { useMemo, useState } from 'react';
import { Plus, Moon, Sun, CheckCircle2, Sparkles } from 'lucide-react';
import type { Filter, Note } from './types';
import { useLocalStorage } from './useLocalStorage';
import { useDarkMode } from './useDarkMode';
import { useNow } from './useNow';
import { NoteCard } from './NoteCard';
import { NoteModal } from './NoteModal';
import { FilterChips } from './FilterChips';
import { EmptyState } from './EmptyState';
import { AIPanel } from './AIPanel';

const STORAGE_KEY = 'notas:v1';

const seed = (): Note[] => {
  const now = Date.now();
  const tomorrow = (hh = 9) => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(hh, 0, 0, 0);
    return d.getTime();
  };
  const today = (hh: number, mm = 0) => {
    const d = new Date();
    d.setHours(hh, mm, 0, 0);
    return d.getTime();
  };
  return [
    { id: 's1', text: 'Revisar el diseño de la landing page antes de la reunión', completed: false, dueAt: today(15, 30), createdAt: now, updatedAt: now },
    { id: 's2', text: 'Comprar café para la oficina', completed: false, dueAt: null, createdAt: now, updatedAt: now },
    { id: 's3', text: 'Responder el correo del cliente sobre la propuesta', completed: true, dueAt: null, createdAt: now, updatedAt: now },
    { id: 's4', text: 'Preparar la presentación para el viernes', completed: false, dueAt: tomorrow(10), createdAt: now, updatedAt: now },
    { id: 's5', text: 'Hacer ejercicio 30 min', completed: true, dueAt: today(7), createdAt: now, updatedAt: now },
  ];
};

export default function App() {
  const { dark, toggle } = useDarkMode();
  const now = useNow();
  const [notes, setNotes] = useLocalStorage<Note[]>(STORAGE_KEY, seed());
  const [filter, setFilter] = useState<Filter>('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const counts = useMemo(
    () => ({
      pending: notes.filter((n) => !n.completed).length,
      completed: notes.filter((n) => n.completed).length,
      all: notes.length,
    }),
    [notes],
  );

  const sorted = useMemo(() => {
    const list = [...notes];
    list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.dueAt && b.dueAt) return a.dueAt - b.dueAt;
      if (a.dueAt) return -1;
      if (b.dueAt) return 1;
      return b.createdAt - a.createdAt;
    });
    return list;
  }, [notes]);

  const visible = useMemo(() => {
    if (filter === 'pending') return sorted.filter((n) => !n.completed);
    if (filter === 'completed') return sorted.filter((n) => n.completed);
    return sorted;
  }, [sorted, filter]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (note: Note) => {
    setEditing(note);
    setModalOpen(true);
  };
  const handleSave = (text: string, dueAt: number | null) => {
    if (editing) {
      setNotes((prev) =>
        prev.map((n) => (n.id === editing.id ? { ...n, text, dueAt, updatedAt: Date.now() } : n)),
      );
    } else {
      const note: Note = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        dueAt,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setNotes((prev) => [note, ...prev]);
    }
    setModalOpen(false);
    setEditing(null);
  };
  const toggleNote = (id: string) =>
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, completed: !n.completed, updatedAt: Date.now() } : n)),
    );
  const deleteNote = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-[#0a0a0a] dark:text-gray-100">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 pb-28 sm:px-6">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notas</h1>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500">
              <CheckCircle2 size={13} strokeWidth={2} className="text-accent" />
              <span className="tabular-nums font-medium text-accent">{counts.pending}</span>
              {counts.pending === 1 ? 'tarea pendiente' : 'tareas pendientes'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent-soft px-3 py-2.5 text-sm font-semibold text-accent shadow-card transition-all hover:bg-accent/10 dark:border-accent/20 dark:bg-accent/10 dark:hover:bg-accent/15"
            >
              <Sparkles size={16} strokeWidth={2} />
              <span className="hidden sm:inline">Planificar</span>
            </button>
            <button
              onClick={toggle}
              aria-label="Cambiar tema"
              className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 shadow-card transition-all hover:text-gray-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-400 dark:hover:text-gray-100"
            >
              {dark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-5">
          <FilterChips filter={filter} setFilter={setFilter} counts={counts} />
        </div>

        {/* List */}
        <main className="flex-1 space-y-2.5">
          {visible.length === 0 ? (
            <EmptyState filter={filter} onAdd={openNew} />
          ) : (
            visible.map((note) => (
              <div key={note.id} className="animate-fade-in">
                <NoteCard note={note} now={now} onToggle={toggleNote} onEdit={openEdit} onDelete={deleteNote} />
              </div>
            ))
          )}
        </main>
      </div>

      {/* FAB */}
      <button
        onClick={openNew}
        aria-label="Añadir nota"
        className="fixed bottom-6 left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-accent text-white shadow-pop transition-all hover:bg-blue-600 hover:scale-105 active:scale-95 sm:left-auto sm:right-6 sm:translate-x-0"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <NoteModal
        open={modalOpen}
        initial={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />

      <AIPanel open={aiOpen} notes={notes} now={now} onClose={() => setAiOpen(false)} />
    </div>
  );
}
