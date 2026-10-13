"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFriendlyError } from "@/utils/errorMessages";
import type {
  Policy,
  PolicyAction,
  PolicyField,
  PolicyOperator,
  PolicyRule,
  PolicyRuleValue,
  PolicySeverity,
  PolicyType,
} from "@/types/platform/policy-api.types";
import { useCreatePolicy, useUpdatePolicy } from "../../hooks/useGuardrailPolicies";

const POLICY_FIELDS: PolicyField[] = [
  "risk_score",
  "tier",
  "priority",
  "asset_criticality",
  "data_sensitivity",
  "environment",
  "finding_type",
  "situation_severity",
];

const POLICY_OPERATORS: PolicyOperator[] = ["eq", "neq", "gt", "gte", "lt", "lte", "in", "not_in"];

const POLICY_ACTIONS: PolicyAction[] = [
  "REQUIRE_APPROVAL",
  "AUTO_APPROVE",
  "BLOCK",
  "ESCALATE",
];

const POLICY_TYPES: PolicyType[] = [
  "SECURITY_GUARDRAIL",
  "REGULATORY",
  "ORG_POLICY",
  "ASSET_POLICY",
  "ENVIRONMENT_POLICY",
  "DETERMINISTIC_RULE",
];

const POLICY_SEVERITIES: PolicySeverity[] = ["MANDATORY", "RECOMMENDED", "ADVISORY"];

const NUMERIC_FIELDS = new Set<PolicyField>(["risk_score", "data_sensitivity"]);
const ARRAY_OPERATORS = new Set<PolicyOperator>(["in", "not_in"]);
const RANGE_OPERATORS = new Set<PolicyOperator>(["gt", "gte", "lt", "lte"]);

interface PolicyRuleDraft {
  field: PolicyField;
  operator: PolicyOperator;
  value: string;
  action: PolicyAction;
  message: string;
}

interface PolicyFormDialogProps {
  policy?: Policy;
  open: boolean;
  onClose: () => void;
}

const ruleToDraft = (rule: PolicyRule): PolicyRuleDraft => ({
  field: rule.field,
  operator: rule.operator,
  value: Array.isArray(rule.value) ? rule.value.join(", ") : String(rule.value),
  action: rule.action,
  message: rule.message,
});

const parseRuleValue = (
  field: PolicyField,
  operator: PolicyOperator,
  raw: string,
): PolicyRuleValue => {
  if (ARRAY_OPERATORS.has(operator)) {
    const parts = raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    return NUMERIC_FIELDS.has(field) ? parts.map(Number) : parts;
  }
  if (RANGE_OPERATORS.has(operator) || NUMERIC_FIELDS.has(field)) {
    return Number(raw);
  }
  return raw;
};

const emptyDraft = (): PolicyRuleDraft => ({
  field: "risk_score",
  operator: "gte",
  value: "",
  action: "REQUIRE_APPROVAL",
  message: "",
});

const PolicyFormDialog = ({ policy, open, onClose }: PolicyFormDialogProps) => {
  const isEdit = Boolean(policy);

  const [name, setName] = useState(policy?.name ?? "");
  const [description, setDescription] = useState(policy?.description ?? "");
  const [policyType, setPolicyType] = useState<PolicyType>(
    policy?.policyType ?? "SECURITY_GUARDRAIL",
  );
  const [severity, setSeverity] = useState<PolicySeverity>(policy?.severity ?? "RECOMMENDED");
  const [rules, setRules] = useState<PolicyRuleDraft[]>(
    policy?.rules.length ? policy.rules.map(ruleToDraft) : [emptyDraft()],
  );

  const createPolicy = useCreatePolicy();
  const updatePolicy = useUpdatePolicy();
  const isPending = createPolicy.isPending || updatePolicy.isPending;

  const updateRule = (index: number, patch: Partial<PolicyRuleDraft>) => {
    setRules((current) =>
      current.map((rule, idx) => (idx === index ? { ...rule, ...patch } : rule)),
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Policy name is required.");
      return;
    }
    if (rules.length === 0) {
      toast.error("At least one rule is required.");
      return;
    }
    const invalid = rules.some(
      (rule) => !rule.value.trim() || !rule.message.trim(),
    );
    if (invalid) {
      toast.error("Every rule needs a value and a message.");
      return;
    }

    const parsedRules = rules.map((rule) => ({
      field: rule.field,
      operator: rule.operator,
      value: parseRuleValue(rule.field, rule.operator, rule.value.trim()),
      action: rule.action,
      message: rule.message.trim(),
    }));

    if (isEdit && policy) {
      updatePolicy.mutate(
        {
          id: policy.id,
          body: {
            name: name.trim(),
            description: description.trim() || undefined,
            rules: parsedRules,
          },
        },
        {
          onSuccess: () => {
            toast.success("Policy updated.");
            onClose();
          },
          onError: (error) => toast.error(getFriendlyError(error).message),
        },
      );
      return;
    }

    createPolicy.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        policyType,
        severity,
        rules: parsedRules,
      },
      {
        onSuccess: () => {
          toast.success("Draft policy created.");
          onClose();
        },
        onError: (error) => toast.error(getFriendlyError(error).message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Policy" : "Create Guardrail Policy"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Changes do not create a version until the policy is activated."
              : "Policies are created as DRAFT. Activate to snapshot the rules into a version."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="policy-name">Name</Label>
            <Input
              id="policy-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Block high-risk external changes"
              maxLength={200}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="policy-description">Description</Label>
            <Textarea
              id="policy-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this guardrail enforces"
              rows={2}
              maxLength={2000}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Policy Type</Label>
              <Select
                value={policyType}
                onValueChange={(value) => setPolicyType(value as PolicyType)}
                disabled={isEdit}
              >
                <SelectTrigger className="h-9" aria-label="Policy type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POLICY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Severity</Label>
              <Select
                value={severity}
                onValueChange={(value) => setSeverity(value as PolicySeverity)}
                disabled={isEdit}
              >
                <SelectTrigger className="h-9" aria-label="Severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POLICY_SEVERITIES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Rules</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRules((current) => [...current, emptyDraft()])}
            >
              <Plus className="mr-1.5 size-4" />
              Add Rule
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="bg-muted/40 border-border flex flex-col gap-3 rounded-lg border p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-medium">
                    Rule {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRules((current) => current.filter((_, idx) => idx !== index))}
                    disabled={rules.length === 1}
                    aria-label={`Remove rule ${index + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Field</Label>
                    <Select
                      value={rule.field}
                      onValueChange={(value) => updateRule(index, { field: value as PolicyField })}
                    >
                      <SelectTrigger className="h-9" aria-label="Rule field">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POLICY_FIELDS.map((field) => (
                          <SelectItem key={field} value={field}>
                            {field.replaceAll("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Operator</Label>
                    <Select
                      value={rule.operator}
                      onValueChange={(value) =>
                        updateRule(index, { operator: value as PolicyOperator })
                      }
                    >
                      <SelectTrigger className="h-9" aria-label="Rule operator">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POLICY_OPERATORS.map((operator) => (
                          <SelectItem key={operator} value={operator}>
                            {operator}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Value</Label>
                    <Input
                      value={rule.value}
                      onChange={(e) => updateRule(index, { value: e.target.value })}
                      placeholder={
                        ARRAY_OPERATORS.has(rule.operator)
                          ? "comma, separated, values"
                          : NUMERIC_FIELDS.has(rule.field) || RANGE_OPERATORS.has(rule.operator)
                            ? "e.g. 70"
                            : "value"
                      }
                      className="h-9"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Action</Label>
                    <Select
                      value={rule.action}
                      onValueChange={(value) => updateRule(index, { action: value as PolicyAction })}
                    >
                      <SelectTrigger className="h-9" aria-label="Rule action">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POLICY_ACTIONS.map((action) => (
                          <SelectItem key={action} value={action}>
                            {action.replaceAll("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs">Message</Label>
                  <Input
                    value={rule.message}
                    onChange={(e) => updateRule(index, { message: e.target.value })}
                    placeholder="Why this rule triggers"
                    className="h-9"
                    maxLength={500}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyFormDialog;
