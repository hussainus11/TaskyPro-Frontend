'use client';

import { useEffect, useState } from "react";
import { companiesApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { ShieldAlert } from "lucide-react";
import CompaniesDataTable, { Company } from "./data-table";
import AddCompanySheet from "./add-company-sheet";

export default function Page() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  const loadCompanies = async () => {
    try {
      const data = await companiesApi.getCompanies();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load companies:", error);
      setCompanies([]);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    setIsOwner(user?.company?.isPlatformOwner === true);
    loadCompanies();
  }, []);

  if (isOwner === null) {
    return null;
  }

  if (!isOwner) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>Restricted page</EmptyTitle>
          <EmptyDescription>Only the platform administrator can manage companies.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
        <Button onClick={() => setIsSheetOpen(true)}>
          <PlusCircledIcon /> Add New Company
        </Button>
      </div>
      <CompaniesDataTable data={companies} />
      <AddCompanySheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onSuccess={loadCompanies}
      />
    </>
  );
}
