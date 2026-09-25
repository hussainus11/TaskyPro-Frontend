"use client";

import { PageHeader } from "@/components/layout/page-header";
import NoteSidebar from "@/app/(auth)/apps/notes/note-sidebar";
import NoteContent from "@/app/(auth)/apps/notes/note-content";

export default function NotesApp() {
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
