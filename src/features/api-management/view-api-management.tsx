"use client";

import { useState } from "react";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatPills } from "@/components/shared/StatPills";
import AppButton from "@/components/shared/AppButton";
import { Button } from "@/components/ui/button";
import { KeyRound, CheckCircle, XCircle, Clock, Activity } from "lucide-react";
import { useRole } from "@/hooks/use-role";
import type { RotateApiKeyResponse } from "@/types/platform/api-key.types";
import { useApiManagement, useApiUsage } from "./hooks/useApiManagement";
import ApiKeyCard from "./components/ApiKeyCard";
import ApiManagementSkeleton from "./components/ApiManagementSkeleton";
import CreateApiKeyDialog from "./components/CreateApiKeyDialog";
import RawKeyDialog from "./components/RawKeyDialog";

interface RawKeyState {
  rawKey: string;
  rotated: boolean;
}

const ViewApiManagement = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [rawKeyState, setRawKeyState] = useState<RawKeyState | null>(null);

  const { hasAnyRole } = useRole();
  const isAdmin = hasAnyRole(["CUSTOMER_ADMIN"]);

  const { data: apiKeys, isLoading, isError, refetch } = useApiManagement();
  const { data: usage } = useApiUsage();

  if (isLoading) {
    return <ApiManagementSkeleton />;
  }

  const meta = {
    total: apiKeys?.length ?? 0,
    active: apiKeys?.filter((key) => key.status === "ACTIVE").length ?? 0,
    expired: apiKeys?.filter((key) => key.status === "EXPIRED").length ?? 0,
    revoked: apiKeys?.filter((key) => key.status === "REVOKED").length ?? 0,
  };

  const recentUsage = (usage ?? []).slice(-7);
  const maxUsage = Math.max(1, ...recentUsage.map((row) => row.count));
  const requestsToday = recentUsage.length > 0 ? recentUsage[recentUsage.length - 1].count : 0;

  if (isError) {
    return (
      <div className="flex w-full flex-col gap-6">
        <h1 className="text-xl font-bold text-card-foreground">API Management</h1>
        <div className="bg-card flex flex-col items-center gap-3 rounded-xl p-10 text-center">
          <p className="text-destructive text-sm">Failed to load API keys. Please try again later.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="API Management"
        subtitle="Manage your API keys and monitor usage"
        action={
          isAdmin && (
            <AppButton variant="primary" size="md" onClick={() => setCreateOpen(true)}>
              <KeyRound className="mr-1.5 size-4" />
              Create API Key
            </AppButton>
          )
        }
      />

      <StatPills
        stats={[
          { value: meta.total.toLocaleString(), label: "Total Keys", icon: KeyRound },
          { value: meta.active.toLocaleString(), label: "Active", color: "success", icon: CheckCircle },
          { value: meta.expired.toLocaleString(), label: "Expired", color: "warning", icon: Clock },
          { value: meta.revoked.toLocaleString(), label: "Revoked", color: "danger", icon: XCircle },
          { value: requestsToday.toLocaleString(), label: "Requests Today", icon: Activity },
        ]}
      />

      <div className="bg-card rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-card-foreground text-sm font-semibold">API Usage (last 7 days)</h2>
          <span className="text-muted-foreground text-xs">Source: analytics/api-usage</span>
        </div>
        {recentUsage.length === 0 ? (
          <p className="text-muted-foreground text-sm">No usage recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentUsage.map((row) => {
              const label = new Date(row.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              const ratio = row.count / maxUsage;

              return (
                <div key={row.date} className="flex items-center gap-3">
                  <span className="text-muted-foreground w-16 shrink-0 text-xs">{label}</span>
                  <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                    <div
                      className="bg-chart-5 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(2, ratio * 100)}%` }}
                    />
                  </div>
                  <span className="text-card-foreground w-16 shrink-0 text-right text-xs">
                    {row.count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {apiKeys?.map((key) => (
          <ApiKeyCard
            key={key.id}
            apiKey={key}
            isAdmin={isAdmin}
            onRotated={(response: RotateApiKeyResponse) =>
              setRawKeyState({ rawKey: response.newKey.rawKey, rotated: true })
            }
          />
        ))}
        {apiKeys?.length === 0 && (
          <div className="bg-card col-span-full flex flex-col items-center gap-3 rounded-xl p-10 text-center">
            <p className="text-muted-foreground text-sm">No API keys yet.</p>
            {isAdmin && (
              <AppButton variant="outline" size="md" onClick={() => setCreateOpen(true)}>
                Create your first API key
              </AppButton>
            )}
          </div>
        )}
      </div>

      {createOpen && (
        <CreateApiKeyDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={(rawKey) => setRawKeyState({ rawKey, rotated: false })}
        />
      )}

      {rawKeyState && (
        <RawKeyDialog
          open
          onClose={() => setRawKeyState(null)}
          rawKey={rawKeyState.rawKey}
          rotated={rawKeyState.rotated}
          title={rawKeyState.rotated ? "Key regenerated" : "API key created"}
        />
      )}
    </div>
  );
};

export default ViewApiManagement;
