import React from "react";
import TableCellRenderer from "./TableCellRenderer";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DataTable = ({
  columns = [],
  data = [],
  page = 1,
  totalPages = 1,
  totalRecords = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  height = "auto",
  loading = false,
}) => {
  const tableData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-card rounded-theme shadow-sm border border-border flex flex-col">
      
      {/* TABLE WRAPPER */}
      <div
        className="overflow-x-auto custom-scrollbar"
        style={{ minHeight: '200px' }}
      >
        <table className="min-w-full text-left border-collapse">
          
          {/* Sticky Header */}
          <thead className="bg-background-muted sticky top-0 z-10 border-b border-border">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || `col-${idx}`}
                  className="px-6 py-3 text-[10px] font-bold text-foreground-muted uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/50">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-20 text-foreground-muted text-sm"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : tableData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-20 text-foreground-muted text-sm"
                >
                  No data found for the selected criteria
                </td>
              </tr>
            ) : (
              tableData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="hover:bg-background-muted transition-colors"
                >
                  {columns.map((col, colIndex) => (
                    <td key={col.key || `cell-${rowIndex}-${colIndex}`} className="px-6 py-4 whitespace-nowrap">
                      <TableCellRenderer
                        column={col}
                        value={row}
                      />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card text-xs font-medium text-foreground-muted">
        
        {/* Records Info */}
        <div>
          Showing page <span className="text-foreground">{page}</span> of{" "}
          <span className="text-foreground">{totalPages}</span> (
          <span className="text-foreground">{totalRecords}</span> records)
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">

          {/* Page Size Selector */}
          {onPageSizeChange && (
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) =>
                  onPageSizeChange(Number(e.target.value))
                }
                className="bg-background border border-border rounded-theme px-2 py-1 outline-none focus:ring-1 focus:ring-primary text-foreground"
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-theme border border-border disabled:opacity-30 hover:bg-background-muted transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-theme border border-border disabled:opacity-30 hover:bg-background-muted transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DataTable;