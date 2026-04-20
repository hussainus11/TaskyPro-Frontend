"use client";

import { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
  Type,
  Image as ImageIcon,
  Link,
  Code,
  Quote,
  Palette,
  Highlighter,
  FileText,
  Columns,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Ruler,
  Eye,
  EyeOff,
  MessageSquare,
  CheckCircle,
  FileCheck,
  Search,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RibbonTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface OfficeRibbonProps {
  editor: Editor;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function OfficeRibbon({ editor, activeTab = "home", onTabChange }: OfficeRibbonProps) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showRuler, setShowRuler] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  
  // Dialog states
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [textColorDialogOpen, setTextColorDialogOpen] = useState(false);
  const [highlightColorDialogOpen, setHighlightColorDialogOpen] = useState(false);
  const [pageColorDialogOpen, setPageColorDialogOpen] = useState(false);
  const [indentDialogOpen, setIndentDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [wordCountDialogOpen, setWordCountDialogOpen] = useState(false);
  
  // Dialog input values
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [highlightColor, setHighlightColor] = useState("#ffff00");
  const [pageColor, setPageColor] = useState("#ffffff");
  const [indentValue, setIndentValue] = useState("20");
  const [commentText, setCommentText] = useState("");

  const tabs: RibbonTab[] = [
    { id: "home", label: "Home" },
    { id: "insert", label: "Insert" },
    { id: "design", label: "Design" },
    { id: "layout", label: "Layout" },
    { id: "review", label: "Review" },
    { id: "view", label: "View" },
  ];

  const renderHomeTab = () => (
    <div className="flex items-center gap-1 px-2">
      {/* Clipboard */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Clipboard</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => navigator.clipboard.readText().then((text) => editor.commands.insertContent(text))}
            title="Paste"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z" />
            </svg>
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Font */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Font</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", editor.isActive("bold") && "bg-accent")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", editor.isActive("italic") && "bg-accent")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", editor.isActive("underline") && "bg-accent")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", editor.isActive("strike") && "bg-accent")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Paragraph */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Paragraph</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", editor.isActive({ textAlign: "left" }) && "bg-accent")}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", editor.isActive({ textAlign: "center" }) && "bg-accent")}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", editor.isActive({ textAlign: "right" }) && "bg-accent")}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", editor.isActive("bulletList") && "bg-accent")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", editor.isActive("orderedList") && "bg-accent")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Editing */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Editing</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderInsertTab = () => (
    <div className="flex items-center gap-1 px-2">
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Insert</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setImageUrl("");
              setImageDialogOpen(true);
            }}
            title="Insert Image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setLinkUrl("");
              setLinkDialogOpen(true);
            }}
            title="Insert Link"
          >
            <Link className="h-4 w-4" />
          </Button>
          {editor.extensionManager.extensions.find(ext => ext.name === 'codeBlock') && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                try {
                  editor.chain().focus().toggleCodeBlock().run();
                } catch (e) {
                  console.warn("Code block command not available");
                }
              }}
              title="Code Block"
            >
              <Code className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDesignTab = () => (
    <div className="flex items-center gap-1 px-2">
      {/* Themes */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Themes</div>
        <div className="flex gap-1">
          <Select
            onValueChange={(value) => {
              // Apply theme (this would need theme implementation)
              console.log("Theme:", value);
            }}
          >
            <SelectTrigger className="h-7 w-32 text-xs">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="modern">Modern</SelectItem>
              <SelectItem value="classic">Classic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Colors */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Colors</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 relative", editor.isActive("textStyle") && "bg-accent")}
            onClick={() => {
              const currentColor = editor.getAttributes("textStyle").color || "#000000";
              setTextColor(currentColor);
              setTextColorDialogOpen(true);
            }}
            title="Text Color"
          >
            <Type className="h-4 w-4" />
            {editor.getAttributes("textStyle").color && (
              <div
                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1.5 w-3 border border-foreground/20 rounded-sm"
                style={{ backgroundColor: editor.getAttributes("textStyle").color }}
              />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 relative", editor.isActive("highlight") && "bg-accent")}
            onClick={() => {
              const currentColor = editor.getAttributes("highlight").color || "#ffff00";
              setHighlightColor(currentColor);
              setHighlightColorDialogOpen(true);
            }}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
            {editor.getAttributes("highlight").color && (
              <div
                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1.5 w-3 border border-foreground/20 rounded-sm"
                style={{ backgroundColor: editor.getAttributes("highlight").color }}
              />
            )}
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Page Background */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Page Background</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setPageColor("#ffffff");
              setPageColorDialogOpen(true);
            }}
            title="Page Color"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="flex items-center gap-1 px-2">
      {/* Page Setup */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Page Setup</div>
        <div className="flex gap-1">
          <Select
            onValueChange={(value) => {
              console.log("Orientation:", value);
            }}
          >
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue placeholder="Orientation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => {
              console.log("Size:", value);
            }}
          >
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="letter">Letter</SelectItem>
              <SelectItem value="a4">A4</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
              <SelectItem value="tabloid">Tabloid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Paragraph */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Paragraph</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setIndentValue("20");
              setIndentDialogOpen(true);
            }}
            title="Increase Indent"
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Arrange */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Arrange</div>
        <div className="flex gap-1">
          <Select
            onValueChange={(value) => {
              console.log("Columns:", value);
            }}
          >
            <SelectTrigger className="h-7 w-24 text-xs">
              <SelectValue placeholder="Columns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">One</SelectItem>
              <SelectItem value="2">Two</SelectItem>
              <SelectItem value="3">Three</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderReviewTab = () => (
    <div className="flex items-center gap-1 px-2">
      {/* Proofing */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Proofing</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              toast.info("Spell check feature coming soon");
            }}
            title="Spelling & Grammar"
          >
            <FileCheck className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setWordCountDialogOpen(true);
            }}
            title="Word Count"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Comments */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Comments</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setCommentText("");
              setCommentDialogOpen(true);
            }}
            title="New Comment"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Changes */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Changes</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              toast.info("Track changes feature coming soon");
            }}
            title="Track Changes"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderViewTab = () => (
    <div className="flex items-center gap-1 px-2">
      {/* Views */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Views</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", fullscreen && "bg-accent")}
            onClick={() => {
              setFullscreen(!fullscreen);
              if (!fullscreen) {
                document.documentElement.requestFullscreen?.();
              } else {
                document.exitFullscreen?.();
              }
            }}
            title="Fullscreen"
          >
            {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Zoom */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Zoom</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const newZoom = Math.max(50, zoomLevel - 10);
              setZoomLevel(newZoom);
              // Apply zoom (would need custom implementation)
            }}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="flex items-center px-2 text-xs font-medium min-w-[60px] justify-center">
            {zoomLevel}%
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              const newZoom = Math.min(200, zoomLevel + 10);
              setZoomLevel(newZoom);
              // Apply zoom (would need custom implementation)
            }}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator orientation="vertical" className="h-12" />

      {/* Show */}
      <div className="flex flex-col items-center gap-1 px-2 py-1">
        <div className="text-[10px] font-medium text-muted-foreground">Show</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", showRuler && "bg-accent")}
            onClick={() => setShowRuler(!showRuler)}
            title="Ruler"
          >
            <Ruler className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="border-b bg-[#f3f3f3] dark:bg-[#1e1e1e]">
      {/* Tab Bar */}
      <div className="flex border-b bg-white dark:bg-[#2d2d2d]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-b-2 border-blue-600 text-blue-600 bg-[#f3f3f3] dark:bg-[#1e1e1e]"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ribbon Content */}
      <div className="min-h-[100px] bg-[#f3f3f3] dark:bg-[#1e1e1e]">
        {activeTab === "home" && renderHomeTab()}
        {activeTab === "insert" && renderInsertTab()}
        {activeTab === "design" && renderDesignTab()}
        {activeTab === "layout" && renderLayoutTab()}
        {activeTab === "review" && renderReviewTab()}
        {activeTab === "view" && renderViewTab()}
      </div>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>Enter the URL of the image you want to insert</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (imageUrl) {
                  editor.chain().focus().setImage({ src: imageUrl }).run();
                  setImageDialogOpen(false);
                  setImageUrl("");
                }
              }}
            >
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
            <DialogDescription>Enter the URL for the link</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">Link URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (linkUrl) {
                  editor.chain().focus().setLink({ href: linkUrl }).run();
                  setLinkDialogOpen(false);
                  setLinkUrl("");
                }
              }}
            >
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Text Color Dialog */}
      <Dialog open={textColorDialogOpen} onOpenChange={setTextColorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Text Color</DialogTitle>
            <DialogDescription>Choose a color for the text</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="text-color">Color (Hex)</Label>
              <div className="flex gap-2">
                <Input
                  id="text-color"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer"
                />
                <Input
                  value={textColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === "") {
                      setTextColor(value);
                    }
                  }}
                  placeholder="#000000"
                  maxLength={7}
                />
              </div>
              <div className="flex gap-2 pt-2">
                {/* Quick color presets */}
                {["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="h-8 w-8 rounded border-2 border-border hover:border-primary transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => setTextColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                toast.success("Text color removed");
                setTextColorDialogOpen(false);
              }}
            >
              Remove Color
            </Button>
            <Button variant="outline" onClick={() => setTextColorDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                try {
                  if (textColor && /^#[0-9A-Fa-f]{6}$/.test(textColor)) {
                    editor.chain().focus().setColor(textColor).run();
                    toast.success("Text color applied");
                  } else {
                    toast.error("Please enter a valid hex color (e.g., #000000)");
                    return;
                  }
                } catch (e) {
                  toast.error("Text color feature not available");
                }
                setTextColorDialogOpen(false);
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Highlight Color Dialog */}
      <Dialog open={highlightColorDialogOpen} onOpenChange={setHighlightColorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Highlight Color</DialogTitle>
            <DialogDescription>Choose a highlight color</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="highlight-color">Color (Hex)</Label>
              <div className="flex gap-2">
                <Input
                  id="highlight-color"
                  type="color"
                  value={highlightColor}
                  onChange={(e) => setHighlightColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer"
                />
                <Input
                  value={highlightColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === "") {
                      setHighlightColor(value);
                    }
                  }}
                  placeholder="#ffff00"
                  maxLength={7}
                />
              </div>
              <div className="flex gap-2 pt-2">
                {/* Quick highlight color presets */}
                {["#FFFF00", "#00FF00", "#00FFFF", "#FF00FF", "#FF0000", "#0000FF", "#FFA500"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="h-8 w-8 rounded border-2 border-border hover:border-primary transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => setHighlightColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                toast.success("Highlight removed");
                setHighlightColorDialogOpen(false);
              }}
            >
              Remove Highlight
            </Button>
            <Button variant="outline" onClick={() => setHighlightColorDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                try {
                  if (highlightColor && /^#[0-9A-Fa-f]{6}$/.test(highlightColor)) {
                    if (editor.isActive("highlight")) {
                      editor.chain().focus().unsetHighlight().run();
                    }
                    editor.chain().focus().toggleHighlight({ color: highlightColor }).run();
                    toast.success("Highlight color applied");
                  } else {
                    toast.error("Please enter a valid hex color (e.g., #ffff00)");
                    return;
                  }
                } catch (e) {
                  toast.error("Highlight feature not available");
                }
                setHighlightColorDialogOpen(false);
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page Color Dialog */}
      <Dialog open={pageColorDialogOpen} onOpenChange={setPageColorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Page Color</DialogTitle>
            <DialogDescription>Choose a background color for the page</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="page-color">Color (Hex)</Label>
              <div className="flex gap-2">
                <Input
                  id="page-color"
                  type="color"
                  value={pageColor}
                  onChange={(e) => setPageColor(e.target.value)}
                  className="h-10 w-20"
                />
                <Input
                  value={pageColor}
                  onChange={(e) => setPageColor(e.target.value)}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPageColorDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Apply page background color
                const editorElement = document.querySelector('.office-document-editor');
                if (editorElement) {
                  (editorElement as HTMLElement).style.backgroundColor = pageColor;
                }
                setPageColorDialogOpen(false);
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Indent Dialog */}
      <Dialog open={indentDialogOpen} onOpenChange={setIndentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Indentation</DialogTitle>
            <DialogDescription>Set the paragraph indentation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="indent">Indent (px)</Label>
              <Input
                id="indent"
                type="number"
                value={indentValue}
                onChange={(e) => setIndentValue(e.target.value)}
                placeholder="20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIndentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Apply indent (would need custom implementation)
                console.log("Indent:", indentValue);
                toast.success(`Indent set to ${indentValue}px`);
                setIndentDialogOpen(false);
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Comment</DialogTitle>
            <DialogDescription>Add a comment to the document</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Input
                id="comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter your comment..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (commentText) {
                  // Add comment (would need custom implementation)
                  console.log("Comment:", commentText);
                  toast.success("Comment added");
                  setCommentDialogOpen(false);
                  setCommentText("");
                }
              }}
            >
              Add Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Word Count Dialog */}
      <Dialog open={wordCountDialogOpen} onOpenChange={setWordCountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Word Count</DialogTitle>
            <DialogDescription>Document statistics</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              {(() => {
                const text = editor.getText();
                const words = text.trim().split(/\s+/).filter(word => word.length > 0);
                const characters = text.length;
                const charactersNoSpaces = text.replace(/\s/g, '').length;
                const paragraphs = text.split(/\n\n/).filter(p => p.trim().length > 0).length;
                
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Words:</span>
                      <span className="text-sm">{words.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Characters:</span>
                      <span className="text-sm">{characters}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Characters (no spaces):</span>
                      <span className="text-sm">{charactersNoSpaces}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Paragraphs:</span>
                      <span className="text-sm">{paragraphs}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setWordCountDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


















































