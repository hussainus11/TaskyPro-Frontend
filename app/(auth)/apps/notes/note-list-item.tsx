import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ArchiveIcon, ArchiveRestoreIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Note } from "@/app/(auth)/apps/notes/types";
import { useNotesStore } from "@/app/(auth)/apps/notes/store";

export default function NoteListItem({ note }: { note: Note }) {
  const { toggleArchive, deleteNote, toggleChecklistItem } = useNotesStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Card className="relative mb-4 block break-inside-avoid gap-0 overflow-hidden rounded-md transition-shadow group-data-[view-mode=list]:py-0 group-data-[view-mode=masonry]:pt-0 hover:shadow-lg md:group-data-[view-mode=list]:flex md:group-data-[view-mode=list]:flex-row">
      {note.type === "image" && note.image && (
        <figure className="top-0 h-full shrink-0 md:group-data-[view-mode=list]:w-62">
          <Image
            width={200}
            height={150}
            src={note.image}
            className="aspect-square h-full w-full object-cover group-data-[view-mode=list]:md:absolute md:group-data-[view-mode=list]:w-62"
            alt={note.title}
            unoptimized
          />
        </figure>
      )}
      <CardContent className="pt-6 group-data-[view-mode=list]:pb-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-semibold lg:text-lg">{note.title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-me-2 -mt-1 size-8 shrink-0">
                  <MoreVerticalIcon className="size-4" />
                  <span className="sr-only">Note actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleArchive(note)}>
                  {note.isArchived ? <ArchiveRestoreIcon /> : <ArchiveIcon />}
                  {note.isArchived ? "Restore" : "Archive"}
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => setConfirmDelete(true)}>
                  <Trash2Icon />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {note.type === "checklist" && note.checklistItems.length > 0 && (
            <ul className="peer space-y-4">
              {note.checklistItems.map((item, index) => (
                <li
                  key={item.id ?? index}
                  className={cn("flex items-center space-x-2", {
                    "text-muted-foreground line-through": item.checked
                  })}>
                  <Checkbox
                    id={`note_${note.id}_item_${index}`}
                    checked={item.checked}
                    onCheckedChange={() => toggleChecklistItem(note, index)}
                  />
                  <label
                    htmlFor={`note_${note.id}_item_${index}`}
                    className="text-sm leading-none font-medium">
                    {item.text}
                  </label>
                </li>
              ))}
            </ul>
          )}
          {note.type !== "checklist" && note.content && (
            <div
              className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          )}
          {note.labels.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {note.labels.map((label) => (
                <Badge key={label.id} variant="outline">
                  <span className={cn("me-1 size-2 shrink-0 rounded-full", label.color)}></span>
                  {label.title}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this note?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{note.title}&rdquo; will be permanently deleted. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteNote(note)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
