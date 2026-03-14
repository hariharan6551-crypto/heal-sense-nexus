import { useState, useMemo } from "react";
import { Table, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { DatasetInfo } from "@/lib/parseData";

interface DatasetViewerProps {
  dataset: DatasetInfo;
  filteredData: Record<string, any>[];
}

const DatasetViewer = ({ dataset, filteredData }: DatasetViewerProps) => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const pageSize = 25;

  const columns = dataset.columns;

  // Filter and sort
  const processedData = useMemo(() => {
    let result = filteredData;

    // Search
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(row =>
        columns.some(col => String(row[col] ?? "").toLowerCase().includes(lower))
      );
    }

    // Sort
    if (sortCol) {
      const isNumeric = dataset.numericColumns.includes(sortCol);
      result = [...result].sort((a, b) => {
        const va = a[sortCol] ?? "";
        const vb = b[sortCol] ?? "";
        let cmp = 0;
        if (isNumeric) {
          cmp = (Number(va) || 0) - (Number(vb) || 0);
        } else {
          cmp = String(va).localeCompare(String(vb));
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [filteredData, search, sortCol, sortDir, columns, dataset.numericColumns]);

  const totalPages = Math.ceil(processedData.length / pageSize);
  const pageData = processedData.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
    setPage(0);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 gap-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Table className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Dataset Viewer</h3>
            <span className="text-xs text-muted-foreground">{processedData.length.toLocaleString()} rows</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search..."
              className="rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-44"
            />
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-md bg-secondary px-2 py-1 text-secondary-foreground disabled:opacity-40 hover:bg-muted transition-colors"
              >
                Prev
              </button>
              <span className="text-muted-foreground px-1">{page + 1}/{totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-md bg-secondary px-2 py-1 text-secondary-foreground disabled:opacity-40 hover:bg-muted transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              {columns.map(col => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none group"
                >
                  <span className="inline-flex items-center gap-1">
                    {col}
                    {sortCol === col ? (
                      sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                {columns.map(col => {
                  const val = row[col];
                  const isEmpty = val === null || val === undefined || String(val).trim() === "";
                  return (
                    <td
                      key={col}
                      className={`whitespace-nowrap px-3 py-2 ${isEmpty ? "text-rose-400 italic" : "text-foreground"}`}
                    >
                      {isEmpty ? "—" : String(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DatasetViewer;
