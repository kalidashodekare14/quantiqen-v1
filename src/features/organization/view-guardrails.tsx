"use client";

import { useState } from "react";
import { Plus, Eye, Pencil } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/utils/date/date";
import { useRole } from "@/hooks/use-role";
import type { Policy, PolicyListParams, PolicyStatus } from "@/types/platform/policy-api.types";
import { usePolicies } from "./hooks/useGuardrailPolicies";
import PolicyFormDialog from "./components/guardrails/PolicyFormDialog";
import PolicyDetailDialog from "./components/guardrails/PolicyDetailDialog";

const STATUS_OPTIONS: Array<"ALL" | PolicyStatus> = ["ALL", "DRAFT", "ACTIVE", "ARCHIVED"];

const statusStyles: Record<string, string> = {
  DRAFT: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  ACTIVE: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  ARCHIVED: "bg-muted text-muted-foreground border-border",
};

export const ViewGuardrails = () => {
  const [status, setStatus] = useState<"ALL" | PolicyStatus>("ALL");
  const [search, setSearch] = useState("");
  const [formState, setFormState] = useState<
    { mode: "create" } | { mode: "edit"; policy: Policy } | null
  >(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { hasAnyRole } = useRole();
  const isAdmin = hasAnyRole(["CUSTOMER_ADMIN"]);

  const params: PolicyListParams = status !== "ALL" ? { status } : {};
  const { data: policies, isLoading, isError, error, refetch } = usePolicies(params);

  const filtered = (policies ?? []).filter((policy) =>
    policy.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Guardrail Policies"
        subtitle="Decision guardrails with versioned activation"
        action={
          isAdmin && (
            <Button size="sm" onClick={() => setFormState({ mode: "create" })}>
              <Plus className="mr-1.5 size-4" />
              Create Policy
            </Button>
          )
        }
      />

      <div className="bg-card flex flex-wrap items-center gap-3 rounded-xl p-3">
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as "ALL" | PolicyStatus)}
        >
          <SelectTrigger className="h-9 w-44" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "ALL" ? "All statuses" : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search policies…"
          className="h-9 w-56"
          aria-label="Search policies"
        />

        <span className="text-muted-foreground ml-auto text-sm">
          {filtered.length} policies
        </span>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground py-10 text-center text-sm">Loading policies…</div>
      ) : isError ? (
        <QueryErrorState
          error={error}
          message="Failed to load guardrail policies."
          onRetry={refetch}
        />
      ) : filtered.length === 0 ? (
        <div className="bg-card flex items-center justify-center rounded-xl p-10">
          <p className="text-muted-foreground text-sm">No policies found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((policy) => (
            <div
              key={policy.id}
              className="bg-card/80 border-foreground/10 hover:border-primary/40 flex flex-col gap-3 rounded-xl border p-5 backdrop-blur-md transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <h3 className="text-card-foreground text-sm font-semibold lg:text-base">
                    {policy.name}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {policy.description ?? "No description."}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[policy.status]}`}
                >
                  {policy.status}
                </span>
              </div>

              <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                <span>{policy.policyType.replaceAll("_", " ")}</span>
                <span>{policy.severity}</span>
                <span>{policy.rules.length} rules</span>
                <span>{policy.versions?.length ?? 0} versions</span>
                {policy._count && <span>{policy._count.evaluations} evaluations</span>}
                <span title={formatDateTime(policy.updatedAt)}>
                  Updated {formatDateTime(policy.updatedAt)}
                </span>
              </div>

              <div className="mt-auto flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setDetailId(policy.id)}>
                  <Eye className="mr-1.5 size-4" />
                  View
                </Button>
                {isAdmin && policy.status !== "ARCHIVED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFormState({ mode: "edit", policy })}
                  >
                    <Pencil className="mr-1.5 size-4" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {formState && (
        <PolicyFormDialog
          {...(formState.mode === "edit" ? { policy: formState.policy } : {})}
          open
          onClose={() => setFormState(null)}
        />
      )}

      {detailId && (
        <PolicyDetailDialog policyId={detailId} open onClose={() => setDetailId(null)} />
      )}
    </div>
  );
};
