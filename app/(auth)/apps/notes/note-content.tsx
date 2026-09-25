import { cn } from "@/lib/utils";
import { FileSearchIcon, LayoutGridIcon, ListIcon, MenuIcon, NotebookPenIcon, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { AddNoteModal } from "@/app/(auth)/apps/notes/add-note-modal";
import NoteListItem from "@/app/(auth)/apps/notes/note-list-item";
import { NoteMobileSidebar } from "@/app/(auth)/apps/notes/note-sidebar";
import { useNotesStore } from "@/app/(auth)/apps/notes/store";

export default function NoteContent() {
  const [viewMode, setViewMode] = useState<"masonry" | "list">("masonry");
  const { notes, loading, view, activeLabelId, searchQuery, setSearchQuery, setActiveLabel } =
    useNotesStore();

  const query = searchQuery.trim().toLowerCase();
  const visibleNotes = notes.filter((note) => {
    if (note.isArchived !== (view === "archive")) return false;
    if (activeLabelId !== null && !note.labels.some((label) => label.id === activeLabelId)) {
      return false;
    }
    return !query || note.title.toLowerCase().includes(query);
  });
  const isFiltering = query.length > 0 || activeLabelId !== null;

  return (
    <div className="flex-1">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative flex max-w-md flex-1 space-x-3 xl:space-x-0">
          <NoteMobileSidebar>
            <Button variant="outline" size="icon" className="flex shrink-0 xl:hidden">
              <MenuIcon />
            </Button>
          </NoteMobileSidebar>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              className="w-full pl-10"
              placeholder="Search notes"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex">
          <div className="hidden overflow-hidden rounded-md border xl:flex">
            <Button
              variant={viewMode === "masonry" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("masonry")}>
              <LayoutGridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("list")}>
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="block xl:hidden">
            <AddNoteModal />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-md" />
          ))}
        </div>
      ) : visibleNotes.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {isFiltering ? <FileSearchIcon /> : <NotebookPenIcon />}
            </EmptyMedia>
            <EmptyTitle>
              {isFiltering
                ? "No matching notes"
                : view === "archive"
                  ? "Nothing archived"
                  : "No notes yet"}
            </EmptyTitle>
            <EmptyDescription>
              {isFiltering
                ? "Try a different search or label."
                : view === "archive"
                  ? "Archived notes will show up here."
                  : "Create your first note with the Add Note button."}
            </EmptyDescription>
          </EmptyHeader>
          {isFiltering && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setActiveLabel(null);
              }}>
              Clear filters
            </Button>
          )}
        </Empty>
      ) : (
        <div
          data-view-mode={viewMode}
          className={cn("group", {
            "box-border columns-1 gap-4 [column-fill:_balance] group-data-[theme-content-layout=centered]/layout:columns-3 group-data-[theme-content-layout=full]/layout:columns-1 sm:group-data-[theme-content-layout=full]:columns-2 md:group-data-[theme-content-layout=full]/layout:columns-3 lg:columns-2 xl:group-data-[theme-content-layout=full]/layout:columns-4":
              viewMode === "masonry"
          })}>
          {visibleNotes.map((note) => (
            <NoteListItem key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
