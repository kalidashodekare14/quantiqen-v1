"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequireRole } from "@/components/auth/RequireRole";
import { usePortalUsers } from "../hooks/useUserManagement";
import { UserTable } from "./UserTable";
import { AddUserDialog } from "./AddUserDialog";
import { EditUserDialog } from "./EditUserDialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import type { PortalUser } from "../types/user-management.types";

export function UserManagement() {
  const { data: users, isLoading, isError } = usePortalUsers();
  const [editingUser, setEditingUser] = useState<PortalUser | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const handleEditUser = (user: PortalUser) => {
    setEditingUser(user);
    setEditOpen(true);
  };

  if (isLoading) return <LoadingSkeleton variant="table" />;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <PageHeader
          title="User Management"
          subtitle="Manage users in your organization"
        />
        <RequireRole allowedRoles={["CUSTOMER_ADMIN"]}>
          <AddUserDialog />
        </RequireRole>
      </div>

      {isError ? (
        <div className="text-muted-foreground py-8 text-center">
          Failed to load users. Please try again.
        </div>
      ) : (
        <UserTable users={users ?? []} onEditUser={handleEditUser} />
      )}

      <EditUserDialog
        user={editingUser}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
