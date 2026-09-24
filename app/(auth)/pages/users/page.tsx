'use client';

import { PageHeader } from "@/components/layout/page-header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api";

import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import UsersDataTable from "./data-table";

export default function Page() {
  const [users, setUsers] = useState<React.ComponentProps<typeof UsersDataTable>["data"]>([]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const data = await usersApi.getUsers();
        if (Array.isArray(data)) setUsers(data);
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };
    getUsers();
  }, []);

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage the people who have access to your workspace."
        actions={
          <Button asChild>
            <Link href="#">
              <PlusCircledIcon /> Add New User
            </Link>
          </Button>
        }
      />
      <UsersDataTable data={users} />
    </>
  );
}
