'use client';

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import CompaniesDataTable, { Company } from "./data-table";
import AddCompanySheet from "./add-company-sheet";

export default function Page() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const getCompanies = async () => {
    const res = await fetch(`${API_BASE_URL}/companies`);
    if (res.ok) {
      const data = await res.json();
      setCompanies(data);
    }
  };

  useEffect(() => {
    getCompanies();
  }, []);

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
        onSuccess={getCompanies}
      />
    </>
  );
}