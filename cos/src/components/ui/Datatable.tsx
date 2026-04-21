import { useState, useMemo } from "react"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"

// ─── Types ─────────────────────────────────────────────────────

export interface ColumnDef<T> {
  key: string
  label: string
  sortable?: boolean
  align?: "left" | "right"
  render: (row: T) => React.ReactNode
}
interface ActionColumn<T> {
  key: "actions"
  label: string
  actions: Array<{
    label: string
    onClick: (row: T) => void
    variant?: "primary" | "danger" | "success"
  }>
}


interface DataTableProps<T extends { id: string | number }> {
  columns: ColumnDef<T>[]
  data: T[]
  defaultPageSize?: number
  pageSizeOptions?: number[]
  onRowClick?: (row: T) => void
  emptyMessage?: string
  actions?: ActionColumn<T>
}

// ─── Component ─────────────────────────────────────────────────

export default function DataTable<T extends { id: string | number }>({
  columns,
  data,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  onRowClick,
  emptyMessage = "No results found.",
  actions,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey] ?? ""
      const bv = (b as Record<string, unknown>)[sortKey] ?? ""
      if (av === undefined || bv === undefined) return 0
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
  }, [data, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const paged = sorted.slice(start, start + pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPage(1)
  }

  const handlePageSize = (n: number) => {
    setPageSize(n)
    setPage(1)
  }

  // Build page number array with ellipsis
  const pageNums: (number | "…")[] = useMemo(() => {
    const maxBtns = 5
    if (totalPages <= maxBtns + 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const half = Math.floor(maxBtns / 2)
    let lo = Math.max(1, safePage - half)
    const hi = Math.min(totalPages, lo + maxBtns - 1)
    if (hi - lo < maxBtns - 1) lo = Math.max(1, hi - maxBtns + 1)
    const nums: (number | "…")[] = []
    if (lo > 1) { nums.push(1); if (lo > 2) nums.push("…") }
    for (let p = lo; p <= hi; p++) nums.push(p)
    if (hi < totalPages) { if (hi < totalPages - 1) nums.push("…"); nums.push(totalPages) }
    return nums
  }, [totalPages, safePage])

  const allColumns = actions ? [...columns, actions as any] : columns

  return (
    <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-xl">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-white bg-gray-900">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  className={[
                    "px-4 py-3 font-semibold whitespace-nowrap select-none",
                    col.align === "right" ? "text-right" : "text-left",
                    col.sortable ? "cursor-pointer hover:bg-gray-700 transition-colors" : "",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="flex flex-col gap-[1px] opacity-50">
                        <ChevronUp
                          className={`w-2.5 h-2.5 -mb-[2px] transition-opacity ${sortKey === col.key && sortDir === "asc" ? "opacity-100" : "opacity-40"}`}
                        />
                        <ChevronDown
                          className={`w-2.5 h-2.5 transition-opacity ${sortKey === col.key && sortDir === "desc" ? "opacity-100" : "opacity-40"}`}
                        />
                      </span>
                    )}
                  </span>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 font-semibold text-left text-white whitespace-nowrap">
                  {actions.label}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={allColumns.length} className="px-4 py-12 text-sm text-center text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={[
                    "border-b border-gray-100 last:border-0 transition-colors",
                    onRowClick ? "cursor-pointer hover:bg-orange-50/40" : "",
                  ].join(" ")}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={["px-4 py-3", col.align === "right" ? "text-right" : ""].join(" ")}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                  {actions && (
  <td className="px-4 py-3">
    <div className="flex items-center gap-2">
      {actions.actions.map((action, idx) => (
        <button
          key={idx}
          onClick={(e) => {
            e.stopPropagation()
            action.onClick(row)
          }}
          className={[
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap",
            action.variant === "danger"
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : action.variant === "success"
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-[#FC7844] text-white hover:bg-[#E66A36]",
          ].join(" ")}
        >
          {action.label}
        </button>
      ))}
    </div>
  </td>
)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
        {/* Info */}
        <p className="text-[11px] text-gray-400">
          {sorted.length === 0
            ? "No results"
            : `Showing ${start + 1}–${Math.min(start + pageSize, sorted.length)} of ${sorted.length}`}
        </p>

        {/* Page buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex items-center justify-center w-7 h-7 text-gray-500 border border-gray-200 rounded-md disabled:opacity-30 hover:border-[#FC7844] hover:text-[#FC7844] transition-colors disabled:pointer-events-none"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {pageNums.map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-[11px] text-gray-400">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={[
                  "w-7 h-7 text-[11px] rounded-md border transition-colors",
                  p === safePage
                    ? "bg-[#FC7844] border-[#FC7844] text-white font-medium"
                    : "border-gray-200 text-gray-500 hover:border-[#FC7844] hover:text-[#FC7844]",
                ].join(" ")}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="flex items-center justify-center w-7 h-7 text-gray-500 border border-gray-200 rounded-md disabled:opacity-30 hover:border-[#FC7844] hover:text-[#FC7844] transition-colors disabled:pointer-events-none"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Page size */}
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          Rows
          <select
            value={pageSize}
            onChange={(e) => handlePageSize(Number(e.target.value))}
            className="text-[11px] border border-gray-200 rounded-md px-1.5 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#FC7844]"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}