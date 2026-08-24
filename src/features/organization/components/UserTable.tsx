"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/shared/DataTable";
import { MoreHorizontal, Pencil } from "lucide-react";
import { useRole } from "@/hooks/use-role";
import type { PortalUser } from "../types/user-management.types";

interface UserTableProps {
  users: PortalUser[];
  onEditUser: (user: PortalUser) => void;
}

const roleVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CUSTOMER_ADMIN: "default",
  ANALYST: "secondary",
  AUDITOR: "outline",
  READ_ONLY: "outline",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  SUSPENDED: "destructive",
};

export function UserTable({ users, onEditUser }: UserTableProps) {
  const { isAdmin } = useRole();

  const columns = [
    { key: "userId" as const, label: "User ID" },
    { key: "email" as const, label: "Email" },
    {
      key: "role" as const,
      label: "Role",
      render: (row: PortalUser) => (
        <Badge variant={roleVariant[row.role] ?? "outline"}>{row.role}</Badge>
      ),
    },
    {
      key: "status" as const,
      label: "Status",
      render: (row: PortalUser) => (
        <Badge variant={statusVariant[row.status] ?? "outline"}>{row.status}</Badge>
      ),
    },
    {
      key: "lastLoginAt" as const,
      label: "Last Login",
      render: (row: PortalUser) =>
        row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleDateString() : "Never",
    },
    ...(isAdmin
      ? [
          {
            key: "_actions" as const,
            label: "",
            render: (row: PortalUser) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditUser(row)}>
                    <Pencil className="mr-2 size-4" />
                    Edit User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]
      : []),
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      searchable
      searchKeys={["userId", "email"]}
      getRowId={(row) => row.id}
    />
  );
}
