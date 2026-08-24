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
import { Loader2, MoreHorizontal, ShieldOff } from "lucide-react";
import { useRole } from "@/hooks/use-role";
import type { PortalSession } from "../types/session-management.types";

interface SessionTableProps {
  sessions: PortalSession[];
  onRequestRevoke: (sessionId: string) => void;
  revokingSessionId?: string;
}

export function SessionTable({ sessions, onRequestRevoke, revokingSessionId }: SessionTableProps) {
  const { isAdmin } = useRole();

  const columns = [
    { key: "userId" as const, label: "User" },
    {
      key: "userRole" as const,
      label: "Role",
      render: (row: PortalSession) => (
        <Badge variant="outline">{row.userRole}</Badge>
      ),
    },
    { key: "ipAddr" as const, label: "IP Address" },
    {
      key: "currentDevice" as const,
      label: "Device",
      render: (row: PortalSession) =>
        row.currentDevice ? (
          <Badge variant="default">Current</Badge>
        ) : (
          <Badge variant="secondary">Other</Badge>
        ),
    },
    {
      key: "lastSeenAt" as const,
      label: "Last Seen",
      render: (row: PortalSession) => new Date(row.lastSeenAt).toLocaleString(),
    },
    {
      key: "expiresAt" as const,
      label: "Expires",
      render: (row: PortalSession) => new Date(row.expiresAt).toLocaleString(),
    },
    ...(isAdmin
      ? [
          {
            key: "_actions" as const,
            label: "",
            render: (row: PortalSession) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onRequestRevoke(row.id)}
                    disabled={revokingSessionId === row.id}
                    className="text-destructive"
                  >
                    {revokingSessionId === row.id ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <ShieldOff className="mr-2 size-4" />
                    )}
                    Revoke Session
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
      data={sessions}
      searchable
      searchKeys={["userId", "ipAddr"]}
      getRowId={(row) => row.id}
    />
  );
}
