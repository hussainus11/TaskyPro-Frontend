"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  Link as LinkIcon,
  User,
  Building2,
  Users,
  Briefcase,
  Handshake,
  FileText,
  Calculator,
  MessageSquare,
  Phone
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const sidebarNavItems = [
  {
    title: "Lead Stages",
    href: "/dashboard/crm/statuses-dropdowns/lead-stages",
    icon: TrendingUp
  },
  {
    title: "Sources",
    href: "/dashboard/crm/statuses-dropdowns/sources",
    icon: LinkIcon
  },
  {
    title: "Contact Types",
    href: "/dashboard/crm/statuses-dropdowns/contact-types",
    icon: User
  },
  {
    title: "Company Type",
    href: "/dashboard/crm/statuses-dropdowns/company-type",
    icon: Building2
  },
  {
    title: "Employees",
    href: "/dashboard/crm/statuses-dropdowns/employees",
    icon: Users
  },
  {
    title: "Industry",
    href: "/dashboard/crm/statuses-dropdowns/industry",
    icon: Briefcase
  },
  {
    title: "Deal Type",
    href: "/dashboard/crm/statuses-dropdowns/deal-type",
    icon: Handshake
  },
  {
    title: "Invoice Stages",
    href: "/dashboard/crm/statuses-dropdowns/invoice-stages",
    icon: FileText
  },
  {
    title: "Estimate Stages",
    href: "/dashboard/crm/statuses-dropdowns/estimate-stages",
    icon: Calculator
  },
  {
    title: "Salutations",
    href: "/dashboard/crm/statuses-dropdowns/salutations",
    icon: MessageSquare
  },
  {
    title: "Call Statuses",
    href: "/dashboard/crm/statuses-dropdowns/call-statuses",
    icon: Phone
  },
  {
    title: "Document Stages",
    href: "/dashboard/crm/statuses-dropdowns/document-stages",
    icon: FileText
  }
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Card className="py-0">
      <CardContent className="p-2">
        <nav className="flex flex-col space-y-0.5 space-x-2 lg:space-x-0">
          {sidebarNavItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "hover:bg-muted justify-start",
                pathname === item.href ? "bg-muted hover:bg-muted" : ""
              )}
              asChild>
              <Link href={item.href}>
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                {item.title}
              </Link>
            </Button>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}




