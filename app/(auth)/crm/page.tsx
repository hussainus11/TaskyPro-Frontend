"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal, Maximize2, Minimize2, Settings2 } from "lucide-react";
import CustomDateRangePicker from "@/components/custom-date-range-picker";
import { Button } from "@/components/ui/button";
import {
  LeadBySourceCard,
  SalesPipeline,
  LeadsCard,
  TargetCard,
  TotalCustomersCard,
  TotalDeals,
  TotalRevenueCard,
  RecentTasks,
} from "@/app/(auth)/crm/components";
import { entityDataApi, customerApi, orderApi, settingsApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type CardId =
  | "target"
  | "customers"
  | "deals"
  | "revenue"
  | "lead-source"
  | "recent-tasks"
  | "pipeline"
  | "leads";

type CardState = { id: CardId; minimized: boolean; order: number };

type DashboardPrefs = {
  stats: CardState[];
  charts: CardState[];
  table: CardState[];
};

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_PREFS: DashboardPrefs = {
  stats: [
    { id: "target", minimized: false, order: 0 },
    { id: "customers", minimized: false, order: 1 },
    { id: "deals", minimized: false, order: 2 },
    { id: "revenue", minimized: false, order: 3 },
  ],
  charts: [
    { id: "lead-source", minimized: false, order: 0 },
    { id: "recent-tasks", minimized: false, order: 1 },
    { id: "pipeline", minimized: false, order: 2 },
  ],
  table: [{ id: "leads", minimized: false, order: 0 }],
};

const CARD_LABELS: Record<CardId, string> = {
  target: "Target",
  customers: "Total Customers",
  deals: "Total Deals",
  revenue: "Total Revenue",
  "lead-source": "Lead By Source",
  "recent-tasks": "Recent Tasks",
  pipeline: "Sales Pipeline",
  leads: "Leads",
};

function mergePrefs(saved: Partial<DashboardPrefs>): DashboardPrefs {
  const merge = (
    defaults: CardState[],
    saved: CardState[] | undefined
  ): CardState[] => {
    if (!saved || saved.length === 0) return defaults;
    // Preserve all default cards; apply saved minimized/order overrides
    const savedMap = Object.fromEntries(saved.map((c) => [c.id, c]));
    const merged = defaults.map((d) =>
      savedMap[d.id]
        ? { ...d, minimized: savedMap[d.id].minimized, order: savedMap[d.id].order }
        : d
    );
    return [...merged].sort((a, b) => a.order - b.order);
  };
  return {
    stats: merge(DEFAULT_PREFS.stats, saved.stats),
    charts: merge(DEFAULT_PREFS.charts, saved.charts),
    table: merge(DEFAULT_PREFS.table, saved.table),
  };
}

// ─── Sortable card wrapper ────────────────────────────────────────────────────

function SortableCard({
  id,
  minimized,
  customizing,
  onToggleMinimize,
  children,
}: {
  id: CardId;
  minimized: boolean;
  customizing: boolean;
  onToggleMinimize: () => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !customizing });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  if (minimized) {
    return (
      <div ref={setNodeRef} style={style}>
        <div className="border rounded-lg px-4 py-3 flex items-center gap-2 bg-card">
          {customizing && (
            <GripHorizontal
              {...attributes}
              {...listeners}
              className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
            />
          )}
          <span className="text-sm font-semibold flex-1">{CARD_LABELS[id]}</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 shrink-0"
            onClick={onToggleMinimize}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group/card">
      {children}
      {/* Controls overlay — drag handle + minimize, shown on hover or while customizing */}
      <div
        className={`absolute top-3 right-3 flex items-center gap-1 z-10 transition-opacity ${
          customizing ? "opacity-100" : "opacity-0 group-hover/card:opacity-100"
        }`}
      >
        {customizing && (
          <div
            {...attributes}
            {...listeners}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent cursor-grab active:cursor-grabbing"
          >
            <GripHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={onToggleMinimize}
        >
          <Minimize2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    customers: [] as any[],
    leads: [] as any[],
    deals: [] as any[],
    orders: [] as any[],
    tasks: [] as any[],
  });
  const [prefs, setPrefs] = useState<DashboardPrefs>(DEFAULT_PREFS);
  const [customizing, setCustomizing] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Load dashboard data ──────────────────────────────────────────────────
  useEffect(() => {
    fetchDashboardData();
    loadPrefs();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (!user) return;
      const params = {
        companyId: user.companyId || undefined,
        branchId: user.branchId || undefined,
      };
      const [customers, leads, deals, orders] = await Promise.all([
        customerApi.getCustomers(params).catch(() => []),
        entityDataApi.getEntityDataByType("LEAD", params).catch(() => []),
        entityDataApi.getEntityDataByType("DEAL", params).catch(() => []),
        orderApi.getOrders({ limit: 50 }).catch(() => []),
      ]);
      setDashboardData({
        customers: customers || [],
        leads: leads || [],
        deals: deals || [],
        orders: orders || [],
        tasks: [],
      });
    } catch (error: any) {
      toast.error("Failed to fetch dashboard data", {
        description: error.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Load layout prefs ────────────────────────────────────────────────────
  const loadPrefs = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;
      const settings = await settingsApi.getUserSettings(user.id);
      const saved = settings?.tablePreferences?.crm_dashboard;
      if (saved) setPrefs(mergePrefs(saved));
    } catch {
      // silently fall back to defaults
    }
  };

  // ── Persist prefs (debounced 600ms) ─────────────────────────────────────
  const persistPrefs = useCallback((next: DashboardPrefs) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const user = getCurrentUser();
        if (!user) return;
        await settingsApi.updateTablePreferences(user.id, "crm_dashboard", next as any);
      } catch {
        // non-blocking
      }
    }, 600);
  }, []);

  // ── Toggle minimize ───────────────────────────────────────────────────────
  const toggleMinimize = useCallback(
    (group: keyof DashboardPrefs, id: CardId) => {
      setPrefs((prev) => {
        const next = {
          ...prev,
          [group]: prev[group].map((c) =>
            c.id === id ? { ...c, minimized: !c.minimized } : c
          ),
        };
        persistPrefs(next);
        return next;
      });
    },
    [persistPrefs]
  );

  // ── Drag end ─────────────────────────────────────────────────────────────
  const handleDragEnd =
    (group: keyof DashboardPrefs) => (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      setPrefs((prev) => {
        const items = prev[group];
        const oldIdx = items.findIndex((c) => c.id === active.id);
        const newIdx = items.findIndex((c) => c.id === over.id);
        if (oldIdx === -1 || newIdx === -1) return prev;
        const reordered = arrayMove(items, oldIdx, newIdx).map((c, i) => ({
          ...c,
          order: i,
        }));
        const next = { ...prev, [group]: reordered };
        persistPrefs(next);
        return next;
      });
    };

  // ── Render a card by id ───────────────────────────────────────────────────
  const renderCardContent = (id: CardId) => {
    const d = dashboardData;
    switch (id) {
      case "target":
        return <TargetCard deals={d.deals} loading={loading} />;
      case "customers":
        return <TotalCustomersCard customers={d.customers} loading={loading} />;
      case "deals":
        return <TotalDeals deals={d.deals} loading={loading} />;
      case "revenue":
        return <TotalRevenueCard deals={d.deals} orders={d.orders} loading={loading} />;
      case "lead-source":
        return <LeadBySourceCard leads={d.leads} loading={loading} />;
      case "recent-tasks":
        return <RecentTasks tasks={d.tasks} loading={loading} />;
      case "pipeline":
        return <SalesPipeline deals={d.deals} loading={loading} />;
      case "leads":
        return <LeadsCard leads={d.leads} loading={loading} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">CRM Dashboard</h1>
        <div className="flex items-center space-x-2">
          <CustomDateRangePicker />
          <Button
            variant={customizing ? "default" : "outline"}
            size="sm"
            onClick={() => setCustomizing((v) => !v)}
          >
            <Settings2 className="mr-2 h-4 w-4" />
            {customizing ? "Done" : "Customize"}
          </Button>
          <Button>Download</Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* ── Stat cards row ── */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd("stats")}
        >
          <SortableContext
            items={prefs.stats.map((c) => c.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {prefs.stats.map((card) => (
                <SortableCard
                  key={card.id}
                  id={card.id}
                  minimized={card.minimized}
                  customizing={customizing}
                  onToggleMinimize={() => toggleMinimize("stats", card.id)}
                >
                  {renderCardContent(card.id)}
                </SortableCard>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* ── Chart cards row ── */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd("charts")}
        >
          <SortableContext
            items={prefs.charts.map((c) => c.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-4 xl:grid-cols-3">
              {prefs.charts.map((card) => (
                <SortableCard
                  key={card.id}
                  id={card.id}
                  minimized={card.minimized}
                  customizing={customizing}
                  onToggleMinimize={() => toggleMinimize("charts", card.id)}
                >
                  {renderCardContent(card.id)}
                </SortableCard>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* ── Table row ── */}
        {prefs.table.map((card) => (
          <SortableCard
            key={card.id}
            id={card.id}
            minimized={card.minimized}
            customizing={false}
            onToggleMinimize={() => toggleMinimize("table", card.id)}
          >
            {renderCardContent(card.id)}
          </SortableCard>
        ))}
      </div>
    </div>
  );
}
