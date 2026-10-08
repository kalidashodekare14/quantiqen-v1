"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFriendlyError } from "@/utils/errorMessages";
import type { ReportType } from "@/types/platform/report-api.types";
import { useGenerateReport } from "../hooks/useReports";

const REPORT_TYPES: ReportType[] = [
  "SECURITY_POSTURE",
  "RISK_ASSESSMENT",
  "DECISION_SUMMARY",
  "THREAT_INTELLIGENCE",
  "EXECUTIVE_SUMMARY",
  "COMPLIANCE",
];

interface GenerateReportDialogProps {
  open: boolean;
  onClose: () => void;
}

const GenerateReportDialog = ({ open, onClose }: GenerateReportDialogProps) => {
  const [reportType, setReportType] = useState<ReportType>("SECURITY_POSTURE");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);

  const generateReport = useGenerateReport();

  const resetAndClose = () => {
    setTitle("");
    setDescription("");
    setDateFrom("");
    setDateTo("");
    setErrorText(null);
    onClose();
  };

  const handleSubmit = () => {
    setErrorText(null);
    if (!title.trim()) {
      setErrorText("Title is required.");
      return;
    }

    generateReport.mutate(
      {
        reportType,
        title: title.trim(),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(dateFrom ? { dateFrom: new Date(dateFrom).toISOString() } : {}),
        ...(dateTo ? { dateTo: new Date(dateTo).toISOString() } : {}),
      },
      {
        onSuccess: () => {
          toast.success("Report generated.");
          resetAndClose();
        },
        onError: (error) => setErrorText(getFriendlyError(error).message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate report</DialogTitle>
          <DialogDescription>
            A version 1 snapshot is created immediately in GENERATED status.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="report-type">
              Report type <span className="text-destructive">*</span>
            </label>
            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
              <SelectTrigger id="report-type" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="report-title">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="report-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Security Posture Review"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="report-description">
              Description
            </label>
            <Textarea
              id="report-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="report-date-from">
                Date from
              </label>
              <Input
                id="report-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" htmlFor="report-date-to">
                Date to
              </label>
              <Input
                id="report-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </div>

        {errorText && <p className="text-destructive text-sm">{errorText}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={generateReport.isPending}>
            {generateReport.isPending ? "Generating…" : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateReportDialog;
