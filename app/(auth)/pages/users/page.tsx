'use client';

import { PageHeader } from "@/components/layout/page-header";
import { useEffect, useState, useCallback } from "react";
import { usersApi } from "@/lib/api";

import { PlusCircledIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import UsersDataTable from "./data-table";
import { CreateUserDialog } from "./create-user-dialog";

export default function Page() {
  const [users, setUsers] = useState<React.ComponentProps<typeof UsersDataTable>["data"]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const getUsers = useCallback(async () => {
    try {
      const data = await usersApi.getUsers();
      if (Array.isArray(data)) setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage the people who have access to your workspace."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <PlusCircledIcon /> Add New User
          </Button>
        }
      />
      <UsersDataTable data={users} />
      <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={getUsers} />
    </>
  );
}
