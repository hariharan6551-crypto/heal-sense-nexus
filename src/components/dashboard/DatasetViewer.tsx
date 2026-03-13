import { useState } from "react";
import { Table } from "lucide-react";
import type { DatasetInfo } from "@/lib/parseData";

const DatasetViewer = ({ dataset }: { dataset: DatasetInfo }) => {
  const { data } = dataset;
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const totalPages = Math.ceil(data.length / pageSize);
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const pageData = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="card-healthcare rounded-xl p-6 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Table className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Dataset Preview</h3>
          <span className="text-xs text-muted-foreground">({data.length} rows)</span>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded-md bg-secondary px-2 py-1 text-secondary-foreground disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-muted-foreground">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="rounded-md bg-secondary px-2 py-1 text-secondary-foreground disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              {columns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr key={i} className="border-t border-border hover:bg-muted/50 transition-colors">
                {columns.map((col) => (
                  <td key={col} className="whitespace-nowrap px-3 py-2 text-foreground">
                    {String(row[col] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DatasetViewer;
