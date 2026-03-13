import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface DatasetInfo {
  data: Record<string, any>[];
  numericColumns: string[];
  categoricalColumns: string[];
}

export function parseFile(file: File): Promise<DatasetInfo> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(classifyColumns(results.data as Record<string, any>[]));
        },
        error: (err) => reject(err),
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: "array" });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
          resolve(classifyColumns(json));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error("Unsupported file type"));
    }
  });
}

function classifyColumns(data: Record<string, any>[]): DatasetInfo {
  if (data.length === 0) return { data, numericColumns: [], categoricalColumns: [] };

  // Trim column names
  const trimmed = data.map((row) => {
    const newRow: Record<string, any> = {};
    for (const key of Object.keys(row)) {
      const trimKey = key.trim();
      const val = row[key];
      newRow[trimKey] = typeof val === "string" ? val.trim() : val;
    }
    return newRow;
  });

  const cols = Object.keys(trimmed[0]);
  const numericColumns: string[] = [];
  const categoricalColumns: string[] = [];

  for (const col of cols) {
    const sample = trimmed.slice(0, 50);
    const numCount = sample.filter((r) => {
      const v = r[col];
      return v !== null && v !== "" && !isNaN(Number(v));
    }).length;
    if (numCount > sample.length * 0.5) {
      numericColumns.push(col);
      // Convert to numbers
      for (const row of trimmed) {
        row[col] = Number(row[col]) || 0;
      }
    } else {
      categoricalColumns.push(col);
    }
  }

  return { data: trimmed, numericColumns, categoricalColumns };
}
