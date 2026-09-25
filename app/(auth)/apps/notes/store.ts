import { create } from "zustand";
import { toast } from "sonner";
import { notesApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import type { Note, NoteChecklistItem, NoteLabel, NotesView } from "@/app/(auth)/apps/notes/types";

interface NewNoteInput {
  title: string;
  content: string | null;
  image: string | null;
  labelIds: number[];
}

interface NotesStore {
  notes: Note[];
  labels: NoteLabel[];
  loading: boolean;
  view: NotesView;
  activeLabelId: number | null;
  searchQuery: string;

  load: () => Promise<void>;
  setView: (view: NotesView) => void;
  setActiveLabel: (labelId: number | null) => void;
  setSearchQuery: (query: string) => void;

  createNote: (input: NewNoteInput) => Promise<boolean>;
  toggleArchive: (note: Note) => Promise<void>;
  deleteNote: (note: Note) => Promise<void>;
  toggleChecklistItem: (note: Note, index: number) => Promise<void>;

  createLabel: (title: string, color: string) => Promise<boolean>;
  updateLabel: (id: number, title: string) => Promise<boolean>;
  deleteLabel: (id: number) => Promise<void>;
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  labels: [],
  loading: true,
  view: "notes",
  activeLabelId: null,
  searchQuery: "",

  load: async () => {
    const user = getCurrentUser();
    if (!user) {
      set({ notes: [], labels: [], loading: false });
      return;
    }
    try {
      const [notes, labels] = await Promise.all([
        notesApi.getNotes(user.id),
        notesApi.getNoteLabels(user.id)
      ]);
      set({
        notes: Array.isArray(notes) ? notes : [],
        labels: Array.isArray(labels) ? labels : []
      });
    } catch (error) {
      toast.error("Failed to load notes", { description: errorMessage(error) });
    } finally {
      set({ loading: false });
    }
  },

  setView: (view) => set({ view }),
  setActiveLabel: (activeLabelId) => set({ activeLabelId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  createNote: async ({ title, content, image, labelIds }) => {
    const user = getCurrentUser();
    if (!user) {
      toast.error("Please log in to create notes");
      return false;
    }
    try {
      await notesApi.createNote({
        title,
        content,
        image,
        labelIds,
        type: image ? "image" : "text",
        userId: user.id,
        isArchived: false
      });
      toast.success("Note created");
      await get().load();
      return true;
    } catch (error) {
      toast.error("Failed to create note", { description: errorMessage(error) });
      return false;
    }
  },

  toggleArchive: async (note) => {
    try {
      await notesApi.updateNote(note.id, { isArchived: !note.isArchived });
      toast.success(note.isArchived ? "Note restored" : "Note archived");
      await get().load();
    } catch (error) {
      toast.error("Failed to update note", { description: errorMessage(error) });
    }
  },

  deleteNote: async (note) => {
    try {
      await notesApi.deleteNote(note.id);
      set((state) => ({ notes: state.notes.filter((n) => n.id !== note.id) }));
      toast.success("Note deleted");
      await get().load();
    } catch (error) {
      toast.error("Failed to delete note", { description: errorMessage(error) });
    }
  },

  toggleChecklistItem: async (note, index) => {
    const checklistItems: NoteChecklistItem[] = note.checklistItems.map((item, i) => ({
      text: item.text,
      checked: i === index ? !item.checked : item.checked
    }));
    // Optimistic update; the server replaces the whole checklist on update.
    set((state) => ({
      notes: state.notes.map((n) => (n.id === note.id ? { ...n, checklistItems } : n))
    }));
    try {
      await notesApi.updateNote(note.id, { checklistItems });
    } catch (error) {
      toast.error("Failed to update checklist", { description: errorMessage(error) });
      await get().load();
    }
  },

  createLabel: async (title, color) => {
    const user = getCurrentUser();
    if (!user) return false;
    try {
      await notesApi.createNoteLabel({ title, color, userId: user.id });
      await get().load();
      return true;
    } catch (error) {
      toast.error("Failed to create label", { description: errorMessage(error) });
      return false;
    }
  },

  updateLabel: async (id, title) => {
    try {
      await notesApi.updateNoteLabel(id, { title });
      await get().load();
      return true;
    } catch (error) {
      toast.error("Failed to update label", { description: errorMessage(error) });
      return false;
    }
  },

  deleteLabel: async (id) => {
    try {
      await notesApi.deleteNoteLabel(id);
      if (get().activeLabelId === id) set({ activeLabelId: null });
      await get().load();
    } catch (error) {
      toast.error("Failed to delete label", { description: errorMessage(error) });
    }
  }
}));
