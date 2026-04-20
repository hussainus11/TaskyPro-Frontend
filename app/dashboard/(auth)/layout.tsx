import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layout/header";
import { CompanyCheck } from "./components/company-check";
import { ExceptionLogger } from "./components/exception-logger";
import { ContentContainer } from "./components/contentContainer";

export default async function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  // Redirect to login if no token
  // Note: This is a server-side check. Client-side checks are handled by middleware
  if (!token) {
    redirect("/dashboard/login/v1");
  }
  
  const defaultOpen =
    cookieStore.get("sidebar_state")?.value === "true" ||
    cookieStore.get("sidebar_state") === undefined;

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 80)",
          "--header-height": "calc(var(--spacing) * 14)",
          "--content-padding": "calc(var(--spacing) * 4)",
          "--content-margin": "calc(var(--spacing) * 2)",
          "--content-full-height":
            "calc(100vh - var(--header-height) - (var(--content-padding) * 2) - (var(--content-margin) * 2))"
        } as React.CSSProperties
      }>
      <CompanyCheck />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <ExceptionLogger />
        <div className="flex flex-1 flex-col">
          <ContentContainer>{children}</ContentContainer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
