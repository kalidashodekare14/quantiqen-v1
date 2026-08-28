"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RequireRole } from "@/components/auth/RequireRole";
import { usePortalPolicy } from "../hooks/usePolicyManagement";
import { PolicyDisplay } from "./PolicyDisplay";
import { PolicyEditForm } from "./PolicyEditForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export function PolicyManagement() {
  const { data: policy, isLoading, isError } = usePortalPolicy();
  const [editing, setEditing] = useState(false);

  if (isLoading) return <LoadingSkeleton variant="page" />;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Policy Configuration"
          subtitle="Manage your organization's security policy"
        />
        {!editing && (
          <RequireRole allowedRoles={["CUSTOMER_ADMIN"]}>
            <Button onClick={() => setEditing(true)}>
              <Pencil className="mr-2 size-4" />
              Edit Policy
            </Button>
          </RequireRole>
        )}
      </div>

      {isError ? (
        <div className="text-muted-foreground py-8 text-center">
          Failed to load policy. Please try again.
        </div>
      ) : policy ? (
        editing ? (
          <PolicyEditForm policy={policy} onCancel={() => setEditing(false)} />
        ) : (
          <PolicyDisplay policy={policy} />
        )
      ) : null}
    </div>
  );
}
