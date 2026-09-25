import React from "react";
import { Archive, Edit3, PenSquare } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { AddNoteModal } from "./add-note-modal";
import { EditLabelsModal } from "./edit-labels-modal";
import { useNotesStore } from "./store";

export default function NoteSidebar() {
  return (
    <div className="sticky top-18 hidden space-y-4 xl:block">
      <AddNoteModal />
      <NoteSidebarContent />
    </div>
  );
}

export function NoteMobileSidebar({ children }: { children?: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="px-0">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Dialog</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>
        <NoteSidebarContent />
      </SheetContent>
    </Sheet>
  );
}

export function NoteSidebarContent() {
  const { labels, loading, view, activeLabelId, setView, setActiveLabel } = useNotesStore();

  return (
    <div className="flex flex-col rounded-md p-2 xl:w-64 xl:border">
      <div className="space-y-1">
        <Button
          variant={view === "notes" && activeLabelId === null ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => {
            setView("notes");
            setActiveLabel(null);
          }}>
          <PenSquare />
          Notes
        </Button>
        <Button
          variant={view === "archive" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => {
            setView("archive");
            setActiveLabel(null);
          }}>
          <Archive />
          Archive
        </Button>
        <EditLabelsModal>
          <Button variant="ghost" className="w-full justify-start">
            <Edit3 />
            Edit Labels
          </Button>
        </EditLabelsModal>
      </div>

      <Separator className="my-4" />

      <div className="flex-1">
        <div className="text-muted-foreground mb-3 px-2 text-sm font-medium">Labels</div>
        <nav>
          {loading ? (
            <div className="space-y-2 px-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          ) : labels.length === 0 ? (
            <p className="text-muted-foreground px-2 text-sm">No labels yet.</p>
          ) : (
            labels.map((label) => (
              <Button
                key={label.id}
                variant={activeLabelId === label.id ? "secondary" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => {
                  setView("notes");
                  setActiveLabel(activeLabelId === label.id ? null : label.id);
                }}>
                <span className={cn("me-1 size-2 rounded-full", label.color)} />
                {label.title}
              </Button>
            ))
          )}
        </nav>
      </div>
    </div>
  );
}
