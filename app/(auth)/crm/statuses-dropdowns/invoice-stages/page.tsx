"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Pencil, X, ArrowRight, Palette, Plus, XCircle } from "lucide-react";
import { invoiceStagesApi } from "@/lib/api";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

interface Stage {
  id: number;
  name: string;
  color: string;
  order: number;
  type: 'initial' | 'additional' | 'success' | 'failed';
  companyId?: number | null;
  branchId?: number | null;
}

const colorMap: Record<string, string> = {
  "bg-blue-500": "#3b82f6",
  "bg-orange-500": "#f97316",
  "bg-red-500": "#ef4444",
  "bg-pink-500": "#ec4899",
  "bg-orange-600": "#ea580c"
};

const presetColors = [
  "#3b82f6", "#f97316", "#ef4444", "#ec4899", "#10b981",
  "#8b5cf6", "#f59e0b", "#06b6d4", "#84cc16", "#f43f5e",
  "#6366f1", "#14b8a6"
];

const defaultInitialStage: Stage = {
  id: 0, name: "Initial Stage", color: colorMap["bg-blue-500"], order: 1, type: 'initial'
};

const defaultSuccessStage: Stage = {
  id: 0, name: "Paid", color: "#10b981", order: 10, type: 'success'
};

function ColorPicker({ color, onColorChange }: { color: string; onColorChange: (color: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button onClick={(e) => { e.stopPropagation(); setOpen(true); }} className="p-1 hover:bg-white/20 rounded transition-colors">
          <Palette className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Custom Color</label>
            <input type="color" value={color} onChange={(e) => { onColorChange(e.target.value); setOpen(false); }} className="w-full h-10 rounded cursor-pointer" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Preset Colors</label>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((presetColor) => (
                <button key={presetColor} onClick={() => { onColorChange(presetColor); setOpen(false); }}
                  className={cn("w-8 h-8 rounded border-2 transition-all", color === presetColor ? "border-foreground scale-110" : "border-transparent hover:scale-105")}
                  style={{ backgroundColor: presetColor }} />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SortableStageItem({ stage, onEdit, onDelete, onColorChange, onNameChange, isEditing }: {
  stage: Stage; onEdit: (id: number) => void; onDelete: (id: number) => void;
  onColorChange: (id: number, color: string) => void; onNameChange: (id: number, name: string) => void; isEditing: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stage.id.toString() });
  const [editName, setEditName] = useState(stage.name);
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const handleSave = () => {
    if (editName.trim()) onNameChange(stage.id, editName.trim());
    else setEditName(stage.name);
    onEdit(0);
  };
  const handleCancel = () => { setEditName(stage.name); onEdit(0); };

  useEffect(() => { if (isEditing) setEditName(stage.name); }, [isEditing, stage.name]);

  return (
    <div ref={setNodeRef} style={{ ...style, backgroundColor: stage.color }}
      className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium shadow-sm cursor-move", isDragging && "ring-2 ring-primary")}>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing"><GripVertical className="h-4 w-4" /></div>
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} onBlur={handleSave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
            className="h-7 text-sm text-foreground bg-white/90" autoFocus onClick={(e) => e.stopPropagation()} />
        </div>
      ) : (
        <span className="flex-1">{stage.order}. {stage.name}</span>
      )}
      <div className="flex items-center gap-1">
        <ColorPicker color={stage.color} onColorChange={(color) => onColorChange(stage.id, color)} />
        <button onClick={(e) => { e.stopPropagation(); onEdit(stage.id); }} className="p-1 hover:bg-white/20 rounded transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(stage.id); }} className="p-1 hover:bg-white/20 rounded transition-colors"><X className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

function InitialStageCard({ stage, onColorChange, onEdit, onNameChange }: {
  stage: Stage; onColorChange: (color: string) => void; onEdit: (id: number) => void; onNameChange: (name: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(stage.name);
  const handleSave = () => { onNameChange(editName); setIsEditing(false); };
  const handleCancel = () => { setEditName(stage.name); setIsEditing(false); };

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium shadow-sm" style={{ backgroundColor: stage.color }}>
      <ArrowRight className="h-4 w-4" />
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} onBlur={handleSave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
            className="h-7 text-sm text-foreground bg-white/90" autoFocus />
        </div>
      ) : (
        <span className="flex-1 cursor-pointer hover:underline" onClick={() => setIsEditing(true)}>{stage.order}. {stage.name}</span>
      )}
      <div className="flex items-center gap-1">
        <ColorPicker color={stage.color} onColorChange={onColorChange} />
        <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} className="p-1 hover:bg-white/20 rounded transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

function FinalStageCard({ stage, onColorChange, onEdit, onDelete, onNameChange, isEditing }: {
  stage: Stage; onColorChange: (color: string) => void; onEdit: (id: number) => void;
  onDelete: (id: number) => void; onNameChange: (id: number, name: string) => void; isEditing: boolean;
}) {
  const [editName, setEditName] = useState(stage.name);
  const handleSave = () => { if (editName.trim()) onNameChange(stage.id, editName.trim()); else setEditName(stage.name); onEdit(0); };
  const handleCancel = () => { setEditName(stage.name); onEdit(0); };
  useEffect(() => { if (isEditing) setEditName(stage.name); }, [isEditing, stage.name]);

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium shadow-sm" style={{ backgroundColor: stage.color }}>
      <ArrowRight className="h-4 w-4" />
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} onBlur={handleSave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
            className="h-7 text-sm text-foreground bg-white/90" autoFocus onClick={(e) => e.stopPropagation()} />
        </div>
      ) : (
        <span className="flex-1">{stage.order}. {stage.name}</span>
      )}
      <div className="flex items-center gap-1">
        <ColorPicker color={stage.color} onColorChange={onColorChange} />
        <button onClick={(e) => { e.stopPropagation(); onEdit(stage.id); }} className="p-1 hover:bg-white/20 rounded transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(stage.id); }} className="p-1 hover:bg-white/20 rounded transition-colors"><X className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

export default function InvoiceStagesPage() {
  const [initialStage, setInitialStage] = useState<Stage | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [successStage, setSuccessStage] = useState<Stage | null>(null);
  const [failedStagesList, setFailedStagesList] = useState<Stage[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const loadStages = async () => {
      try {
        setLoading(true);
        const data = await invoiceStagesApi.getInvoiceStages();
        const initial = data.find((s: Stage) => s.type === 'initial');
        const additional = data.filter((s: Stage) => s.type === 'additional').sort((a: Stage, b: Stage) => a.order - b.order);
        const success = data.filter((s: Stage) => s.type === 'success').sort((a: Stage, b: Stage) => a.order - b.order);
        const failed = data.filter((s: Stage) => s.type === 'failed').sort((a: Stage, b: Stage) => a.order - b.order);

        if (initial) {
          setInitialStage(initial);
        } else {
          try {
            const newStage = await invoiceStagesApi.createInvoiceStage({ name: "Initial Stage", color: colorMap["bg-blue-500"], order: 1, type: 'initial' });
            setInitialStage(newStage);
          } catch {
            setInitialStage(defaultInitialStage);
          }
        }

        if (success.length > 0) {
          setSuccessStage(success[0]);
        } else {
          try {
            const newStage = await invoiceStagesApi.createInvoiceStage({ name: "Paid", color: "#10b981", order: 10, type: 'success' });
            setSuccessStage(newStage);
          } catch {
            setSuccessStage(defaultSuccessStage);
          }
        }

        setStages(additional);
        setFailedStagesList(failed);
      } catch (error: any) {
        console.error('Failed to load stages:', error);
        toast.error('Failed to load invoice stages');
        setInitialStage(defaultInitialStage);
      } finally {
        setLoading(false);
      }
    };
    loadStages();
  }, []);

  const handleDragStart = (event: DragStartEvent) => setActiveId(parseInt(event.active.id as string));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) { setActiveId(null); return; }
    const activeIdNum = parseInt(active.id as string);
    const overId = over.id as string;

    if (overId === 'failed-area') {
      const stageToMove = stages.find((s) => s.id === activeIdNum);
      if (stageToMove) {
        const newOrder = 10 + failedStagesList.length + 1;
        try {
          await invoiceStagesApi.updateInvoiceStage(activeIdNum, { type: 'failed', order: newOrder });
          setStages(stages.filter((s) => s.id !== activeIdNum).map((s, i) => ({ ...s, order: i + 2 })));
          setFailedStagesList([...failedStagesList, { ...stageToMove, type: 'failed', order: newOrder }]);
          toast.success('Stage moved to Failed');
        } catch (error: any) {
          toast.error('Failed to move stage');
        }
      }
    } else {
      if (active.id === over.id) { setActiveId(null); return; }
      const oldIndex = stages.findIndex((s) => s.id === activeIdNum);
      const newIndex = stages.findIndex((s) => s.id === parseInt(overId));
      if (oldIndex !== -1 && newIndex !== -1) {
        const updatedStages = arrayMove(stages, oldIndex, newIndex).map((s, i) => ({ ...s, order: i + 2 }));
        setStages(updatedStages);
        try {
          await invoiceStagesApi.reorderInvoiceStages(updatedStages.map((s) => ({ id: s.id, order: s.order })));
        } catch {
          toast.error('Failed to save stage order');
        }
      }
    }
    setActiveId(null);
  };

  const handleEdit = (id: number) => setIsEditing(id === isEditing ? null : id);

  const handleNameChange = async (id: number, name: string) => {
    try {
      await invoiceStagesApi.updateInvoiceStage(id, { name });
      if (initialStage && id === initialStage.id) setInitialStage({ ...initialStage, name });
      else if (successStage && id === successStage.id) setSuccessStage({ ...successStage, name });
      else if (stages.find(s => s.id === id)) setStages(stages.map((s) => s.id === id ? { ...s, name } : s));
      else setFailedStagesList(failedStagesList.map((s) => s.id === id ? { ...s, name } : s));
      toast.success('Stage name updated');
    } catch (error: any) {
      toast.error('Failed to update stage name');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this stage?")) {
      try {
        await invoiceStagesApi.deleteInvoiceStage(id);
        setStages(stages.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 2 })));
        toast.success('Stage deleted successfully');
      } catch {
        toast.error('Failed to delete stage');
      }
    }
  };

  const handleColorChange = async (id: number, color: string) => {
    try {
      await invoiceStagesApi.updateInvoiceStage(id, { color });
      if (initialStage && id === initialStage.id) setInitialStage({ ...initialStage, color });
      else if (successStage && id === successStage.id) setSuccessStage({ ...successStage, color });
      else setStages(stages.map((s) => s.id === id ? { ...s, color } : s));
    } catch {
      toast.error('Failed to update stage color');
    }
  };

  const handleInitialStageColorChange = async (color: string) => {
    if (!initialStage) return;
    try { await invoiceStagesApi.updateInvoiceStage(initialStage.id, { color }); setInitialStage({ ...initialStage, color }); }
    catch { toast.error('Failed to update stage color'); }
  };

  const handleInitialStageNameChange = async (name: string) => {
    if (!initialStage) return;
    try { await invoiceStagesApi.updateInvoiceStage(initialStage.id, { name }); setInitialStage({ ...initialStage, name }); toast.success('Stage name updated'); }
    catch { toast.error('Failed to update stage name'); }
  };

  const handleSuccessStageColorChange = async (color: string) => {
    if (!successStage) return;
    try { await invoiceStagesApi.updateInvoiceStage(successStage.id, { color }); setSuccessStage({ ...successStage, color }); }
    catch { toast.error('Failed to update stage color'); }
  };

  const handleSuccessStageNameChange = async (name: string) => {
    if (!successStage) return;
    try { await invoiceStagesApi.updateInvoiceStage(successStage.id, { name }); setSuccessStage({ ...successStage, name }); toast.success('Stage name updated'); }
    catch { toast.error('Failed to update stage name'); }
  };

  const handleAddStage = async () => {
    try {
      const newStage = await invoiceStagesApi.createInvoiceStage({ name: "New Stage", color: presetColors[0], order: stages.length + 2, type: 'additional' });
      setStages([...stages, newStage]);
      setIsEditing(newStage.id);
      toast.success('Stage added successfully');
    } catch { toast.error('Failed to create stage'); }
  };

  const handleFailedColorChange = async (id: number, color: string) => {
    try { await invoiceStagesApi.updateInvoiceStage(id, { color }); setFailedStagesList(failedStagesList.map((s) => s.id === id ? { ...s, color } : s)); }
    catch { toast.error('Failed to update stage color'); }
  };

  const handleAddFailedStage = async () => {
    try {
      const newStage = await invoiceStagesApi.createInvoiceStage({ name: "New Failed Stage", color: "#60a5fa", order: 10 + failedStagesList.length + 1, type: 'failed' });
      setFailedStagesList([...failedStagesList, newStage]);
      setIsEditing(newStage.id);
      toast.success('Failed stage added');
    } catch { toast.error('Failed to create failed stage'); }
  };

  const handleDeleteFailedStage = async (id: number) => {
    if (confirm("Are you sure you want to delete this stage?")) {
      try { await invoiceStagesApi.deleteInvoiceStage(id); setFailedStagesList(failedStagesList.filter((s) => s.id !== id)); toast.success('Stage deleted successfully'); }
      catch { toast.error('Failed to delete stage'); }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const allStages = [...(initialStage ? [initialStage] : []), ...stages, ...(successStage ? [successStage] : []), ...failedStagesList];
      await invoiceStagesApi.reorderInvoiceStages(allStages.map((s) => ({ id: s.id, order: s.order })));
      toast.success('Stages saved successfully!');
    } catch { toast.error('Failed to save stages'); } finally { setSaving(false); }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      const data = await invoiceStagesApi.getInvoiceStages();
      const initial = data.find((s: Stage) => s.type === 'initial') || defaultInitialStage;
      const additional = data.filter((s: Stage) => s.type === 'additional').sort((a: Stage, b: Stage) => a.order - b.order);
      const success = data.filter((s: Stage) => s.type === 'success').sort((a: Stage, b: Stage) => a.order - b.order);
      const failed = data.filter((s: Stage) => s.type === 'failed').sort((a: Stage, b: Stage) => a.order - b.order);
      setInitialStage(initial);
      setStages(additional);
      setSuccessStage(success.length > 0 ? success[0] : defaultSuccessStage);
      setFailedStagesList(failed);
      toast.success('Changes cancelled');
    } catch { toast.error('Failed to reload stages'); } finally { setLoading(false); }
  };

  function DroppableArea({ id, children }: { id: string; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return <div ref={setNodeRef} className={cn("transition-colors", isOver && "bg-muted/50 rounded-lg")}>{children}</div>;
  }

  const activeStage = activeId ? stages.find((s) => s.id === activeId) : null;

  if (loading || !initialStage) {
    return <div className="flex items-center justify-center p-8"><p className="text-muted-foreground">Loading stages...</p></div>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Initial Stage</h4>
            <InitialStageCard stage={initialStage} onColorChange={handleInitialStageColorChange} onEdit={handleEdit} onNameChange={handleInitialStageNameChange} />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Additional stages</h4>
            <SortableContext items={stages.map((s) => s.id.toString())} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5">
                {stages.map((stage) => (
                  <SortableStageItem key={stage.id} stage={stage} onEdit={handleEdit} onDelete={handleDelete}
                    onColorChange={handleColorChange} onNameChange={handleNameChange} isEditing={isEditing === stage.id} />
                ))}
              </div>
            </SortableContext>
            <Button variant="outline" onClick={handleAddStage} className="w-full mt-2 border-dashed">
              <Plus className="h-4 w-4 mr-2" />Add Stage
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h4 className="text-sm font-semibold text-foreground">FINAL</h4>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Success Stage — single fixed stage */}
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-green-600">SUCCESS</h5>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="text-xs font-medium text-muted-foreground">Success stage</div>
                  {successStage && (
                    <InitialStageCard stage={successStage} onColorChange={handleSuccessStageColorChange}
                      onEdit={handleEdit} onNameChange={handleSuccessStageNameChange} />
                  )}
                </div>
              </div>

              {/* Failed Stages */}
              <DroppableArea id="failed-area">
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-red-600">FAILED</h5>
                  <div className="border rounded-lg p-4 space-y-3 min-h-[200px] flex flex-col">
                    <div className="text-xs font-medium text-muted-foreground">Failed stages</div>
                    <div className="flex-1 space-y-1.5">
                      {failedStagesList.map((stage) => (
                        <FinalStageCard key={stage.id} stage={stage} onColorChange={(color) => handleFailedColorChange(stage.id, color)}
                          onEdit={handleEdit} onDelete={handleDeleteFailedStage} onNameChange={handleNameChange} isEditing={isEditing === stage.id} />
                      ))}
                    </div>
                    <button onClick={handleAddFailedStage} className="text-sm text-foreground hover:text-primary transition-colors text-left">+ ADD STAGE</button>
                    <div className="flex justify-center pt-2"><XCircle className="h-8 w-8 text-muted-foreground" /></div>
                  </div>
                </div>
              </DroppableArea>
            </div>
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeStage ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium shadow-lg opacity-90" style={{ backgroundColor: activeStage.color }}>
            <GripVertical className="h-4 w-4" /><span>{activeStage.order}. {activeStage.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
