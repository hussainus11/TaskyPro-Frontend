"use client";

import React, { useEffect, useState } from "react";
import { CommandIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  defaultNavItems,
  filterNavGroups,
  transformMenuItem,
  type NavGroup,
  type NavItem
} from "@/components/layout/sidebar/nav-main";
import { menuItemsApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

// Flatten a group's items into every real, clickable destination (leaf pages and
// parents that are themselves a real page), skipping pure "#" parent stubs but
// still descending into their children so e.g. "Leads" is searchable even though
// its parent "CRM" entry is also shown.
function flattenSearchable(items: NavItem[]): NavItem[] {
  const result: NavItem[] = [];
  for (const item of items) {
    if (item.href && item.href !== "#") {
      result.push(item);
    }
    if (item.items && item.items.length > 0) {
      result.push(...flattenSearchable(item.items));
    }
  }
  return result;
}

export default function Search() {
  const [open, setOpen] = useState(false);
  const [navGroups, setNavGroups] = useState<NavGroup[]>(defaultNavItems);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const user = getCurrentUser();
        if (!user) return;

        const menuData = await menuItemsApi.getMenuItems(
          user.companyId || undefined,
          user.branchId || undefined
        );

        if (Array.isArray(menuData) && menuData.length > 0) {
          const transformed: NavGroup[] = menuData.map((group: any) => ({
            title: group.title,
            items: group.items.map(transformMenuItem)
          }));
          setNavGroups(filterNavGroups(transformed));
        }
      } catch (error) {
        console.error("Error loading menu items for search:", error);
      }
    };

    loadMenuItems();
  }, []);

  return (
    <div className="lg:flex-1">
      <div className="relative hidden max-w-sm flex-1 lg:block">
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          className="h-9 w-full cursor-pointer rounded-md border pr-4 pl-10 text-sm shadow-xs"
          placeholder="Search..."
          type="search"
          onFocus={() => setOpen(true)}
        />
        <div className="absolute top-1/2 right-2 hidden -translate-y-1/2 items-center gap-0.5 rounded-sm bg-zinc-200 p-1 font-mono text-xs font-medium sm:flex dark:bg-neutral-700">
          <CommandIcon className="size-3" />
          <span>k</span>
        </div>
      </div>
      <div className="block lg:hidden">
        <Button size="icon" variant="ghost" onClick={() => setOpen(true)}>
          <SearchIcon />
        </Button>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
        </VisuallyHidden>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {navGroups.map((route) => {
            const items = flattenSearchable(route.items);
            if (items.length === 0) return null;
            return (
              <React.Fragment key={route.title}>
                <CommandGroup heading={route.title === "Dashboards" ? undefined : route.title}>
                  {items.map((item, key) => (
                    <CommandItem
                      key={key}
                      onSelect={() => {
                        setOpen(false);
                        router.push(item.href);
                      }}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </React.Fragment>
            );
          })}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
