"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { EvidenceInput, EvidenceType } from "@/types/platform/decision-api.types";

export interface EvidenceDraft {
  evidenceType: EvidenceType;
  title: string;
  description: string;
}

export const EMPTY_EVIDENCE_DRAFT: EvidenceDraft = {
  evidenceType: "DOCUMENT",
  title: "",
  description: "",
};

const EVIDENCE_TYPES: EvidenceType[] = [
  "DOCUMENT",
  "LOG_EXTRACT",
  "CONFIG_SNAPSHOT",
  "SCREENSHOT",
  "CODE_DIFF",
  "SCAN_RESULT",
  "CUSTOM",
];

export function toEvidenceInputs(drafts: EvidenceDraft[]): EvidenceInput[] {
  return drafts
    .filter((draft) => draft.title.trim().length > 0)
    .map((draft) => ({
      evidenceType: draft.evidenceType,
      title: draft.title.trim(),
      ...(draft.description.trim() ? { description: draft.description.trim() } : {}),
    }));
}

interface EvidenceInputListProps {
  evidences: EvidenceDraft[];
  onChange: (evidences: EvidenceDraft[]) => void;
}

const EvidenceInputList = ({ evidences, onChange }: EvidenceInputListProps) => {
  const update = (index: number, patch: Partial<EvidenceDraft>) => {
    onChange(evidences.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const remove = (index: number) => {
    onChange(evidences.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...evidences, { ...EMPTY_EVIDENCE_DRAFT }]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Evidences (optional)</label>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="mr-1 size-3.5" />
          Add evidence
        </Button>
      </div>

      {evidences.length === 0 && (
        <p className="text-muted-foreground text-xs">No evidences attached.</p>
      )}

      {evidences.map((evidence, index) => (
        <div key={index} className="bg-muted/50 flex flex-col gap-2 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Select
              value={evidence.evidenceType}
              onValueChange={(value) => update(index, { evidenceType: value as EvidenceType })}
            >
              <SelectTrigger className="h-9 w-48" aria-label="Evidence type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVIDENCE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Evidence title *"
              value={evidence.title}
              onChange={(e) => update(index, { title: e.target.value })}
              className="h-9 flex-1"
              maxLength={500}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              aria-label="Remove evidence"
            >
              <Trash2 className="text-muted-foreground size-4" />
            </Button>
          </div>
          <Input
            placeholder="Description (optional)"
            value={evidence.description}
            onChange={(e) => update(index, { description: e.target.value })}
            className="h-9"
            maxLength={10000}
          />
        </div>
      ))}
    </div>
  );
};

export default EvidenceInputList;
