"use client";

import React, { useState } from "react";
import { Trash2, Edit2, Check, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotesStore } from "@/app/(auth)/apps/notes/store";
import { PlusIcon } from "@radix-ui/react-icons";

interface Props {
  children: React.ReactNode;
}

const availableColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-indigo-500"
];

export function EditLabelsModal({ children }: Props) {
  const { labels, createLabel, updateLabel, deleteLabel } = useNotesStore();
  const [editingLabelId, setEditingLabelId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("bg-red-500");

  const saveEdit = async (id: number) => {
    const title = editingTitle.trim();
    if (!title) return;
    if (await updateLabel(id, title)) setEditingLabelId(null);
  };

  const addLabel = async () => {
    const title = newLabelName.trim();
    if (!title) return;
    if (await createLabel(title, newLabelColor)) setNewLabelName("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-screen max-w-96 overflow-y-scroll lg:overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Labels</DialogTitle>
        </DialogHeader>

        <div>
          <div className="space-y-1">
            {labels.length === 0 && (
              <p className="text-muted-foreground py-2 text-sm">No labels yet. Add one below.</p>
            )}
            {labels.map((label) => (
              <div key={label.id} className="flex items-center justify-between rounded-md py-1">
                {editingLabelId === label.id ? (
                  <div className="flex flex-1 items-center">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(label.id)}
                      className="me-2 h-8"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" onClick={() => saveEdit(label.id)}>
                      <Check />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditingLabelId(null)}>
                      <X />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className={`size-3 shrink-0 rounded-full ${label.color}`} />
                      <span>{label.title}</span>
                      <span className="text-muted-foreground text-xs">
                        {label._count?.notes ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingLabelId(label.id);
                          setEditingTitle(label.title);
                        }}>
                        <Edit2 />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteLabel(label.id)}>
                        <Trash2 className="text-destructive" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="border-t pt-6">
            <h4 className="mb-2 text-sm font-medium">Add New Label</h4>
            <div className="relative flex items-center gap-2">
              <div className="absolute start-3 shrink-0">
                <div className={`size-3 rounded-full ${newLabelColor}`} />
              </div>
              <Input
                placeholder="New label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLabel()}
                className="flex-1 ps-9"
              />
              <Button size="icon" disabled={!newLabelName.trim()} onClick={addLabel}>
                <PlusIcon />
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Label className="text-muted-foreground block text-xs">Select color</Label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    className={`size-5 rounded-full ${color} ${
                      newLabelColor === color ? "ring-primary ring-2 ring-offset-2" : ""
                    }`}
                    onClick={() => setNewLabelColor(color)}
                    type="button"
                    aria-label={`Use ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
