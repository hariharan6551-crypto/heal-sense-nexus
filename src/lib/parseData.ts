import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ColumnType = "numeric" | "categorical" | "datetime" | "text";

export interface ColumnMeta {
  name: string;
  type: ColumnType;
  nonNullCount: number;
  uniqueCount: number;
  missingCount: number;
}

export interface DatasetInfo {
  data: Record<string, any>[];
  columns: string[];
  columnMeta: ColumnMeta[];
  numericColumns: string[];
  categoricalColumns: string[];
  datetimeColumns: string[];
  textColumns: string[];
  totalRows: number;
  totalColumns: number;
  missingValueCount: number;
  duplicateRowCount: number;
  fileName: string;
  fileSize: number;
  uploadTimestamp: string;
}

const DATE_PATTERNS = [
  /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/,                        // 2024-01-15
  /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/,                        // 01/15/2024
  /^\d{4}[-/]\d{1,2}[-/]\d{1,2}[T ]\d{1,2}:\d{2}/,       // 2024-01-15T10:30
  /^\w{3,9}\s+\d{1,2},?\s+\d{4}$/,                        // January 15, 2024
  /^\d{1,2}\s+\w{3,9}\s+\d{4}$/,                          // 15 January 2024
  /^\d{1,2}[-/]\w{3}[-/]\d{2,4}$/,                        // 15-Jan-2024
];

function looksLikeDate(value: string): boolean {
  if (!value || value.length < 6 || value.length > 30) return false;
  const trimmed = value.trim();
  for (const pattern of DATE_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  const d = new Date(trimmed);
  return !isNaN(d.getTime()) && d.getFullYear() > 1900 && d.getFullYear() < 2100;
}

function classifyColumnType(data: Record<string, any>[], col: string): ColumnType {
  const sample = data.slice(0, Math.min(100, data.length));
  const nonEmpty = sample.filter(r => r[col] !== null && r[col] !== undefined && String(r[col]).trim() !== "");

  if (nonEmpty.length === 0) return "text";

  // Check numeric
  const numCount = nonEmpty.filter(r => {
    const v = r[col];
    return v !== null && v !== "" && !isNaN(Number(v));
  }).length;
  if (numCount > nonEmpty.length * 0.7) return "numeric";

  // Check datetime
  const dateCount = nonEmpty.filter(r => looksLikeDate(String(r[col]))).length;
  if (dateCount > nonEmpty.length * 0.7) return "datetime";

  // Check text vs categorical: if avg length > 50 or unique ratio > 0.8, it's text
  const values = nonEmpty.map(r => String(r[col]));
  const avgLen = values.reduce((s, v) => s + v.length, 0) / values.length;
  const uniqueRatio = new Set(values).size / values.length;
  if (avgLen > 50 || (uniqueRatio > 0.8 && values.length > 10)) return "text";

  return "categorical";
}

export function parseFile(file: File): Promise<DatasetInfo> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const uploadTimestamp = new Date().toISOString();

    const processData = (raw: Record<string, any>[]) => {
      try {
        resolve(buildDatasetInfo(raw, file.name, file.size, uploadTimestamp));
      } catch (err) {
        reject(err);
      }
    };

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processData(results.data as Record<string, any>[]),
        error: (err) => reject(err),
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: "array" });
          const sheet = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
          processData(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    } else if (ext === "json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          let parsed = JSON.parse(text);
          if (!Array.isArray(parsed)) {
            // If it's an object with a key containing an array, use that
            const keys = Object.keys(parsed);
            const arrayKey = keys.find(k => Array.isArray(parsed[k]));
            if (arrayKey) {
              parsed = parsed[arrayKey];
            } else {
              parsed = [parsed];
            }
          }
          processData(parsed as Record<string, any>[]);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    } else {
      reject(new Error("Unsupported file type. Please upload CSV, XLSX, XLS, or JSON."));
    }
  });
}

function buildDatasetInfo(
  raw: Record<string, any>[],
  fileName: string,
  fileSize: number,
  uploadTimestamp: string
): DatasetInfo {
  if (raw.length === 0) {
    return {
      data: [], columns: [], columnMeta: [],
      numericColumns: [], categoricalColumns: [], datetimeColumns: [], textColumns: [],
      totalRows: 0, totalColumns: 0, missingValueCount: 0, duplicateRowCount: 0,
      fileName, fileSize, uploadTimestamp,
    };
  }

  // Trim keys and values
  const data = raw.map((row) => {
    const newRow: Record<string, any> = {};
    for (const key of Object.keys(row)) {
      const trimKey = key.trim();
      const val = row[key];
      newRow[trimKey] = typeof val === "string" ? val.trim() : val;
    }
    return newRow;
  });

  const columns = Object.keys(data[0]);
  const numericColumns: string[] = [];
  const categoricalColumns: string[] = [];
  const datetimeColumns: string[] = [];
  const textColumns: string[] = [];
  const columnMeta: ColumnMeta[] = [];

  let totalMissing = 0;

  for (const col of columns) {
    const type = classifyColumnType(data, col);

    const nonNullCount = data.filter(r =>
      r[col] !== null && r[col] !== undefined && String(r[col]).trim() !== ""
    ).length;
    const missingCount = data.length - nonNullCount;
    totalMissing += missingCount;

    const uniqueValues = new Set(data.map(r => String(r[col] ?? "")));

    columnMeta.push({
      name: col,
      type,
      nonNullCount,
      uniqueCount: uniqueValues.size,
      missingCount,
    });

    if (type === "numeric") {
      numericColumns.push(col);
      // Convert to numbers
      for (const row of data) {
        const v = Number(row[col]);
        row[col] = isNaN(v) ? null : v;
      }
    } else if (type === "datetime") {
      datetimeColumns.push(col);
    } else if (type === "text") {
      textColumns.push(col);
    } else {
      categoricalColumns.push(col);
    }
  }

  // Duplicate detection
  const seen = new Set<string>();
  let duplicateRowCount = 0;
  for (const row of data) {
    const key = columns.map(c => String(row[c] ?? "")).join("||");
    if (seen.has(key)) {
      duplicateRowCount++;
    } else {
      seen.add(key);
    }
  }

  return {
    data,
    columns,
    columnMeta,
    numericColumns,
    categoricalColumns,
    datetimeColumns,
    textColumns,
    totalRows: data.length,
    totalColumns: columns.length,
    missingValueCount: totalMissing,
    duplicateRowCount,
    fileName,
    fileSize,
    uploadTimestamp,
  };
}
