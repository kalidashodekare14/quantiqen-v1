"use client";

import type { ReactNode } from "react";

import { ChevronDown, Download, FileDown, FileSpreadsheet, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ReportExportFormat } from "../report-export";

interface ReportDownloadMenuProps {
  onSelect: (format: ReportExportFormat) => void;
  disabled?: boolean;
  size?: "sm" | "lg";
}

interface FormatItem {
  format: ReportExportFormat;
  label: string;
  icon: ReactNode;
}

const FORMAT_ITEMS: FormatItem[] = [
  { format: "md", label: "Markdown (.md)", icon: <FileText /> },
  { format: "csv", label: "CSV (.csv)", icon: <FileSpreadsheet /> },
  { format: "pdf", label: "PDF (.pdf)", icon: <FileDown /> },
];

export const ReportDownloadMenu = ({
  onSelect,
  disabled,
  size = "lg",
}: ReportDownloadMenuProps) => {
  const isLarge = size === "lg";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={isLarge ? "lg" : "sm"}
          disabled={disabled}
          className={cn(
            "rounded-xl",
            isLarge &&
              "border-chart-5 px-5 py-5 text-sm text-chart-5 hover:bg-chart-5 hover:text-white lg:text-base",
          )}
        >
          <Download className={isLarge ? "mr-1.5 size-4" : "size-3.5"} />
          Download
          <ChevronDown className={isLarge ? "ml-1 size-4" : "ml-0.5 size-3.5"} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {FORMAT_ITEMS.map((item) => (
          <DropdownMenuItem key={item.format} onSelect={() => onSelect(item.format)}>
            {item.icon}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ReportDownloadMenu;
