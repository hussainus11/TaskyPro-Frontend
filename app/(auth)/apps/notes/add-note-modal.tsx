"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageIcon, Tag, PenSquare, Check } from "lucide-react";
import { MinimalTiptapEditor } from "@/components/ui/custom/minimal-tiptap";
import { Content } from "@tiptap/react";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { NoteLabel } from "@/app/(auth)/apps/notes/types";
import { Badge } from "@/components/ui/badge";
import { useNotesStore } from "@/app/(auth)/apps/notes/store";
import { toast } from "sonner";

export function AddNoteModal() {
  const noteLabels = useNotesStore((state) => state.labels);
  const createNote = useNotesStore((state) => state.createNote);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [value, setValue] = React.useState<Content>("");
  const [selectedTags, setSelectedTags] = React.useState<NoteLabel[]>([]);
  const [title, setTitle] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsSubmitting(true);

    let content: string | null = null;
    if (typeof value === "string") {
      content = value;
    } else if (value && typeof value === "object" && "html" in value) {
      content = String((value as { html: unknown }).html);
    }

    const created = await createNote({
      title: title.trim(),
      content: content || null,
      image: imagePreview,
      labelIds: selectedTags.map((tag) => tag.id)
    });

    setIsSubmitting(false);
    if (created) {
      setTitle("");
      setValue("");
      setImagePreview(null);
      setSelectedTags([]);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <PenSquare />
          <span className="hidden md:block">Add Note</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen max-w-(--breakpoint-sm) overflow-y-scroll p-0 lg:overflow-y-auto">
        {imagePreview && (
          <figure>
            <Image
              src={imagePreview}
              width={200}
              height={200}
              alt="Note image preview"
              className="aspect-video w-full rounded-tl-md rounded-tr-md object-cover"
              unoptimized
            />
          </figure>
        )}
        <VisuallyHidden>
          <DialogTitle>Add Note</DialogTitle>
        </VisuallyHidden>

        <form onSubmit={handleSubmit} className={cn({ "p-6": !imagePreview, "p-6 pt-0": imagePreview })}>
          <div className="space-y-6">
            <Input
              placeholder="Title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-4 rounded-none border-0 px-0 text-xl focus-visible:ring-0"
              required
            />

            <MinimalTiptapEditor
              value={value}
              onChange={setValue}
              className="w-full"
              editorContentClassName="p-5"
              output="html"
              placeholder="Enter note description..."
              autofocus={true}
              editable={true}
              editorClassName="focus:outline-hidden"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Input
                        id="picture"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <Button type="button" variant="ghost" size="icon">
                        <label htmlFor="picture" className="cursor-pointer">
                          <ImageIcon className="size-4" />
                        </label>
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Add image</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Tag className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search tags..." className="h-9" />
                            <CommandList>
                              <CommandEmpty>No labels found.</CommandEmpty>
                              <CommandGroup className="p-2">
                                {noteLabels.map((label) => (
                                    <CommandItem
                                      key={label.id}
                                      className="flex items-center py-2"
                                      onSelect={() => {
                                        setSelectedTags((current) =>
                                          current.some((item) => item.id === label.id)
                                            ? current.filter((item) => item.id !== label.id)
                                            : [...current, label]
                                        );
                                      }}>
                                      <div className="flex grow items-center gap-2">
                                        <span
                                          className={cn(
                                            "block size-3 rounded-full",
                                            label.color
                                          )}></span>
                                        <span className="text-sm leading-none">{label.title}</span>
                                        {selectedTags.some((item) => item.id === label.id) ? (
                                          <Check className="text-primary ms-auto size-3" />
                                        ) : null}
                                      </div>
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Add tag</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Add Note"}
            </Button>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {selectedTags.map((tag, key) => (
              <Badge key={key} variant="outline">
                {tag.title}
              </Badge>
            ))}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
