"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

const FULL_WIDTH_PATHS = new Set<string>(["/dashboard/crm/deals/dashboards/create"]);

export function ContentContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullWidth = pathname ? FULL_WIDTH_PATHS.has(pathname) : false;

  const className = fullWidth
    ? "@container/main p-[var(--content-padding)] w-full max-w-none mx-0"
    : "@container/main p-[var(--content-padding)] xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto";

  return <div className={className}>{children}</div>;
}

