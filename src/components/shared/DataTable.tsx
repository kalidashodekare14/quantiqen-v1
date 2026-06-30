"use client"

import { useState, useMemo, ReactNode } from "react"
import { motion } from "framer-motion"
import { Table, TableHeader, TableBody, TableHead, TableCell, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Column<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  searchable?: boolean
  searchKeys?: string[]
  filterOptions?: { key: string; options: string[] }
  pageSize?: number
}

export const DataTable = <T,>({
  columns,
  data,
  onRowClick,
  searchable,
  searchKeys,
  filterOptions,
  pageSize = 10,
}: DataTableProps<T>) => {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("All")
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = useMemo(() => {
    let result = data

    if (searchable && search.trim() && searchKeys) {
      const q = search.toLowerCase()
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const val = (item as Record<string, unknown>)[key]
          return typeof val === "string" && val.toLowerCase().includes(q)
        }),
      )
    }

    if (filterOptions && filter !== "All") {
      result = result.filter((item) => (item as Record<string, unknown>)[filterOptions.key] === filter)
    }

    return result
  }, [data, search, filter, searchable, searchKeys, filterOptions])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
  const from = (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, filtered.length)

  const minWidth = `${columns.length * 12}rem`

  return (
    <div className="space-y-4">
      {(searchable || filterOptions) && (
        <div className="flex flex-wrap items-center gap-3">
          {searchable && (
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-64"
            />
          )}
          {filterOptions && (
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="border-input text-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-8 rounded-lg border bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:ring-3"
            >
              <option value="All">All {filterOptions.key}s</option>
              {filterOptions.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <Table style={{ minWidth }}>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className="text-muted-foreground text-xs font-medium uppercase"
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((row, index) => (
              <motion.tr
                key={(row as Record<string, unknown>).id as string}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                className="hover:bg-muted/50 border-b transition-colors"
                onClick={() => onRowClick?.(row)}
                style={{ cursor: onRowClick ? "pointer" : undefined }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className="text-card-foreground py-3 pr-2 first:pl-4 last:pr-4"
                  >
                    {col.render
                      ? col.render(row)
                      : ((row as Record<string, unknown>)[col.key] as ReactNode) ?? "—"}
                  </TableCell>
                ))}
              </motion.tr>
            ))}
            {paginated.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground py-8 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>
          {filtered.length > 0 ? `${from}-${to} of ${filtered.length}` : "0 of 0"}
        </span>
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
  )
}
