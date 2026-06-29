"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Table, TableHeader, TableBody, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Asset } from "@/types/asset.types";

interface AssetTableProps {
  assets: Asset[];
}

const criticalityStyles: Record<string, string> = {
  Critical: "bg-destructive/10 text-destructive",
  High: "bg-chart-3/10 text-chart-3",
  Medium: "bg-chart-5/10 text-chart-5",
  Low: "bg-muted text-muted-foreground",
};

const statusStyles: Record<string, string> = {
  Active: "bg-chart-2/10 text-chart-2",
  "At Risk": "bg-destructive/10 text-destructive",
  Inactive: "bg-muted text-muted-foreground",
};

const STATUS_OPTIONS = ["All", "Active", "At Risk", "Inactive"] as const;
const PAGE_SIZE = 8;

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const rowVariants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.03, duration: 0.3 },
  }),
};

const AssetTable = ({ assets }: AssetTableProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let result = assets;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) => a.domain.toLowerCase().includes(q) || a.owner.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "All") {
      result = result.filter((a) => a.status === statusFilter);
    }
    return result;
  }, [assets, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const from = (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, filtered.length);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by domain or owner..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border-input text-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-8 rounded-lg border bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:ring-3"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? "All Statuses" : option}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full overflow-x-auto">
        <Table className="min-w-200">
          <TableHeader>
            <tr>
              <TableHead className="text-muted-foreground text-xs font-medium uppercase">
                Domain
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium uppercase">
                IP Address
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium uppercase">
                Asset Type
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium uppercase">
                Owner
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium uppercase">
                Criticality
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium uppercase">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium uppercase">
                Last Scan
              </TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {paginated.map((asset, index) => (
              <motion.tr
                key={asset.id}
                custom={index}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                className="hover:bg-muted/50 border-b transition-colors"
              >
                <TableCell className="text-card-foreground py-3 pr-2 pl-4 font-medium">
                  {asset.domain}
                </TableCell>
                <TableCell className="text-card-foreground px-2 py-3 font-mono text-xs">
                  {asset.ipAddress}
                </TableCell>
                <TableCell className="text-card-foreground px-2 py-3">{asset.assetType}</TableCell>
                <TableCell className="text-card-foreground px-2 py-3">{asset.owner}</TableCell>
                <TableCell className="px-2 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      criticalityStyles[asset.criticality]
                    }`}
                  >
                    {asset.criticality}
                  </span>
                </TableCell>
                <TableCell className="px-2 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusStyles[asset.status]
                    }`}
                  >
                    {asset.status}
                  </span>
                </TableCell>
                <TableCell className="text-card-foreground py-3 pr-4 pl-2 text-xs">
                  {formatDate(asset.lastScan)}
                </TableCell>
              </motion.tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                  No assets found.
                </TableCell>
              </tr>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>{filtered.length > 0 ? `${from}-${to} of ${filtered.length}` : "0 of 0"}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssetTable;
