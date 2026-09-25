"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import NoteSidebar from "@/app/(auth)/apps/notes/note-sidebar";
import NoteContent from "@/app/(auth)/apps/notes/note-content";
import { useNotesStore } from "@/app/(auth)/apps/notes/store";

export default function NotesApp() {
  const load = useNotesStore((state) => state.load);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <PageHeader title="Notes" description="Capture ideas, checklists and reminders." />
      <div className="flex items-start lg:space-x-4">
        <NoteSidebar />
        <NoteContent />
      </div>
    </div>
  );
}
