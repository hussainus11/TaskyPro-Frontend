"use client";

import { CheckIcon } from "lucide-react";
import { WORKSPACE_BACKGROUNDS } from "@/lib/themes";
import { useThemeConfig } from "@/components/active-theme";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function BackgroundSelector() {
  const { theme, setTheme } = useThemeConfig();

  return (
    <div className="flex flex-col gap-4">
      <Label>Workspace background:</Label>
      <div className="grid grid-cols-4 gap-2">
        {WORKSPACE_BACKGROUNDS.map((background) => {
          const selected = theme.background === background.value;
          return (
            <button
              key={background.value}
              type="button"
              title={background.name}
              aria-label={`${background.name} background`}
              aria-pressed={selected}
              onClick={() => setTheme({ ...theme, background: background.value })}
              className={cn(
                "focus-visible:ring-ring relative aspect-[4/3] overflow-hidden rounded-md border transition focus-visible:ring-2 focus-visible:outline-none",
                selected ? "border-primary ring-primary/40 ring-2" : "hover:border-foreground/40"
              )}
              style={background.css ? { background: background.css } : undefined}>
              {!background.css && (
                <span className="bg-muted text-muted-foreground flex size-full items-center justify-center text-[10px] font-medium">
                  None
                </span>
              )}
              {selected && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <CheckIcon className="size-4 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
