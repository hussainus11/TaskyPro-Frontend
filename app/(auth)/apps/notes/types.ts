export type NoteLabel = {
  id: number;
  title: string;
  color: string;
  _count?: { notes: number };
};

export type NoteChecklistItem = {
  id?: number;
  text: string;
  checked: boolean;
};

export type Note = {
  id: number;
  title: string;
  content?: string | null;
  type: "text" | "checklist" | "image";
  isArchived: boolean;
  image?: string | null;
  labels: NoteLabel[];
  checklistItems: NoteChecklistItem[];
};

export type NotesView = "notes" | "archive";
