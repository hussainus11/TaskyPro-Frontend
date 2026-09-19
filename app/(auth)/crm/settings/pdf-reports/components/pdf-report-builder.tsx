"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { pdfReportApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Plus, Trash2, GripVertical, Eye, Save,
  Type, Table, Image, AlignLeft, Minus, FormInput
} from "lucide-react";
import ReportPreview, { ReportElement } from "./report-preview";

const ENTITY_TYPES = ["LEAD", "DEAL", "CONTACT", "INVOICE", "ESTIMATE", "DOCUMENT"];
const PAGE_SIZES = ["A4", "Letter"];

const ELEMENT_PALETTE = [
  { type: "label" as const, label: "Label", icon: Type },
  { type: "text" as const, label: "Text Block", icon: AlignLeft },
  { type: "input" as const, label: "Input Field", icon: FormInput },
  { type: "table" as const, label: "Table", icon: Table },
  { type: "image" as const, label: "Image", icon: Image },
  { type: "separator" as const, label: "Separator", icon: Minus },
];

function createDefaultElement(type: ReportElement["type"], order: number): ReportElement {
  const configs: Record<string, any> = {
    label: { text: "Label text", fontSize: 14, fontWeight: "bold", align: "left", bindingKey: "" },
    text: { content: "Text content", fontSize: 11, align: "left" },
    input: { label: "Field Label", placeholder: "Enter value...", bindingKey: "" },
    separator: {},
    image: { src: "" },
    table: {
      columns: [
        { key: "name", label: "Name", align: "left" },
        { key: "value", label: "Value", align: "left" },
      ],
      rows: [],
      header: true,
      borders: true,
      zebra: false,
      rowHeight: 30,
    },
  };

  return {
    id: crypto.randomUUID(),
    type,
    position: { x: 0, y: 0, width: 100, height: 40 },
    config: configs[type] ?? {},
    order,
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ConfigField({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string; value: any; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 h-8 text-sm"
      />
    </div>
  );
}

function ConfigSelect({
  label, value, options, onChange,
}: {
  label: string; value: string; options: { v: string; l: string }[]; onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1 h-8 text-sm w-full"><SelectValue /></SelectTrigger>
        <SelectContent className="w-full">
          {options.map((o) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function TableConfig({ config, onChange }: { config: any; onChange: (patch: Record<string, any>) => void }) {
  const columns: any[] = config.columns || [];

  const addColumn = () =>
    onChange({ columns: [...columns, { key: `col${columns.length + 1}`, label: `Column ${columns.length + 1}`, align: "left" }] });
  const removeColumn = (i: number) => onChange({ columns: columns.filter((_: any, idx: number) => idx !== i) });
  const updateColumn = (i: number, patch: any) =>
    onChange({ columns: columns.map((c: any, idx: number) => (idx === i ? { ...c, ...patch } : c)) });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Columns</Label>
        <Button variant="outline" size="sm" className="h-6 text-xs" onClick={addColumn}>
          <Plus className="h-3 w-3 mr-1" />Add
        </Button>
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {columns.map((col: any, i: number) => (
          <div key={i} className="flex gap-1 items-center">
            <Input value={col.key} onChange={(e) => updateColumn(i, { key: e.target.value })} placeholder="key" className="h-7 text-xs" />
            <Input value={col.label} onChange={(e) => updateColumn(i, { label: e.target.value })} placeholder="Label" className="h-7 text-xs" />
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive hover:text-destructive" onClick={() => removeColumn(i)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      <Separator />
      <div className="space-y-2">
        {([
          ["Show Header", "header", true],
          ["Borders", "borders", true],
          ["Zebra Stripes", "zebra", false],
        ] as [string, string, boolean][]).map(([lbl, key, def]) => (
          <div key={key} className="flex items-center justify-between">
            <Label className="text-xs">{lbl}</Label>
            <Switch checked={config[key] ?? def} onCheckedChange={(v) => onChange({ [key]: v })} />
          </div>
        ))}
        <ConfigField label="Row Height (px)" type="number" value={config.rowHeight || 30} onChange={(v) => onChange({ rowHeight: Number(v) })} />
      </div>
    </div>
  );
}

function ElementConfig({ element, onChange }: { element: ReportElement; onChange: (patch: Record<string, any>) => void }) {
  const c = element.config;
  const alignOptions = [{ v: "left", l: "Left" }, { v: "center", l: "Center" }, { v: "right", l: "Right" }];

  return (
    <Card>
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm capitalize">{element.type} Configuration</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {element.type === "label" && <>
          <ConfigField label="Text" value={c.text || ""} onChange={(v) => onChange({ text: v })} />
          <ConfigField label="Binding Key" value={c.bindingKey || ""} onChange={(v) => onChange({ bindingKey: v })} placeholder="{field_name}" />
          <ConfigField label="Font Size (px)" type="number" value={c.fontSize || 14} onChange={(v) => onChange({ fontSize: Number(v) })} />
          <ConfigSelect label="Font Weight" value={c.fontWeight || "normal"} options={[{ v: "normal", l: "Normal" }, { v: "bold", l: "Bold" }]} onChange={(v) => onChange({ fontWeight: v })} />
          <ConfigSelect label="Align" value={c.align || "left"} options={alignOptions} onChange={(v) => onChange({ align: v })} />
        </>}

        {element.type === "text" && <>
          <div>
            <Label className="text-xs">Content</Label>
            <Textarea value={c.content || ""} onChange={(e) => onChange({ content: e.target.value })} className="mt-1 text-sm min-h-[80px]" />
          </div>
          <ConfigField label="Font Size (px)" type="number" value={c.fontSize || 11} onChange={(v) => onChange({ fontSize: Number(v) })} />
          <ConfigSelect label="Align" value={c.align || "left"} options={alignOptions} onChange={(v) => onChange({ align: v })} />
        </>}

        {element.type === "input" && <>
          <ConfigField label="Label" value={c.label || ""} onChange={(v) => onChange({ label: v })} />
          <ConfigField label="Placeholder" value={c.placeholder || ""} onChange={(v) => onChange({ placeholder: v })} />
          <ConfigField label="Binding Key" value={c.bindingKey || ""} onChange={(v) => onChange({ bindingKey: v })} placeholder="{field_name}" />
        </>}

        {element.type === "image" && <>
          <ConfigField label="Image URL / Binding Key" value={c.src || ""} onChange={(v) => onChange({ src: v })} />
        </>}

        {element.type === "separator" && (
          <p className="text-xs text-muted-foreground">Separator has no configurable properties.</p>
        )}

        {element.type === "table" && (
          <TableConfig config={c} onChange={onChange} />
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PdfReportBuilder({ reportId }: { reportId?: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!reportId);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [entityType, setEntityType] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [pageSize, setPageSize] = useState("A4");

  const [elements, setElements] = useState<ReportElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedElement = elements.find((e) => e.id === selectedId) ?? null;

  useEffect(() => {
    if (reportId) loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await pdfReportApi.getPdfReportById(reportId!);
      setName(data.name || "");
      setDescription(data.description || "");
      setEntityType(data.entityType || "");
      setIsActive(data.isActive ?? true);
      setPageSize(data.pageSettings?.size || "A4");
      setElements(Array.isArray(data.layout) ? data.layout : []);
    } catch {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const addElement = (type: ReportElement["type"]) => {
    const el = createDefaultElement(type, elements.length);
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  };

  const removeElement = (id: string) => {
    setElements((prev) => prev.filter((e) => e.id !== id).map((e, i) => ({ ...e, order: i })));
    if (selectedId === id) setSelectedId(null);
  };

  const moveElement = (id: string, dir: -1 | 1) => {
    setElements((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr.map((e, i) => ({ ...e, order: i }));
    });
  };

  const updateConfig = (id: string, patch: Record<string, any>) => {
    setElements((prev) =>
      prev.map((e) => (e.id === id ? { ...e, config: { ...e.config, ...patch } } : e))
    );
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Report name is required"); return; }
    try {
      setSaving(true);
      const user = getCurrentUser();
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        entityType: entityType || undefined,
        layout: elements,
        pageSettings: { size: pageSize },
        isActive,
        companyId: user?.companyId ?? undefined,
        branchId: user?.branchId ?? undefined,
      };
      if (reportId) {
        await pdfReportApi.updatePdfReport(reportId, payload);
        toast.success("Report updated successfully");
      } else {
        await pdfReportApi.createPdfReport(payload);
        toast.success("Report created successfully");
        router.push("/crm/settings/pdf-reports");
      }
    } catch (error: any) {
      toast.error(error?.error || "Failed to save report");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading report...</div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Preview: {name || "Untitled Report"}</h2>
        </div>
        <ReportPreview elements={elements} pageSettings={{ size: pageSize }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/crm/settings/pdf-reports")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{reportId ? "Edit Report" : "Create Report"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />Preview
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving…" : "Save Report"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left column: settings + palette */}
        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm">Report Settings</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <div>
                <Label className="text-xs">Name <span className="text-destructive">*</span></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Report name" className="mt-1 h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" className="mt-1 text-sm min-h-[60px]" />
              </div>
              <div>
                <Label className="text-xs">Entity Type</Label>
                <Select value={entityType || "__none__"} onValueChange={(v) => setEntityType(v === "__none__" ? "" : v)}>
                  <SelectTrigger className="mt-1 h-8 text-sm w-full"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="__none__">None</SelectItem>
                    {ENTITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Page Size</Label>
                <Select value={pageSize} onValueChange={setPageSize}>
                  <SelectTrigger className="mt-1 h-8 text-sm w-full"><SelectValue /></SelectTrigger>
                  <SelectContent className="w-full">
                    {PAGE_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between pt-1">
                <Label className="text-xs">Active</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm">Add Elements</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 grid grid-cols-2 gap-2">
              {ELEMENT_PALETTE.map(({ type, label, icon: Icon }) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 flex flex-col gap-1 text-xs"
                  onClick={() => addElement(type)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Center column: ordered element list */}
        <div className="col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">
              Elements <span className="text-muted-foreground">({elements.length})</span>
            </h2>
          </div>

          {elements.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-10 text-center text-muted-foreground text-sm">
              No elements yet.<br />Add elements from the left panel.
            </div>
          ) : (
            <div className="space-y-2">
              {elements.map((el, idx) => (
                <div
                  key={el.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors select-none ${
                    selectedId === el.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-muted-foreground/40"
                  }`}
                  onClick={() => setSelectedId(el.id === selectedId ? null : el.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Badge variant="outline" className="text-xs capitalize shrink-0">{el.type}</Badge>
                      <span className="text-sm text-muted-foreground truncate">
                        {el.config.text || el.config.label || el.config.content || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => moveElement(el.id, -1)}>↑</Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === elements.length - 1} onClick={() => moveElement(el.id, 1)}>↓</Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => removeElement(el.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: config panel */}
        <div className="col-span-4">
          {selectedElement ? (
            <ElementConfig
              element={selectedElement}
              onChange={(patch) => updateConfig(selectedElement.id, patch)}
            />
          ) : (
            <div className="border-2 border-dashed rounded-lg p-10 text-center text-muted-foreground text-sm">
              Select an element to configure it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
