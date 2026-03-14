import { Database, Clock, FileText, HardDrive } from "lucide-react";
import type { DatasetInfo } from "@/lib/parseData";

interface DashboardHeaderProps {
  dataset: DatasetInfo;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const DashboardHeader = ({ dataset }: DashboardHeaderProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 via-accent/80 to-primary/70 p-6 text-white animate-fade-up">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5 blur-xl" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
            <Database className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{dataset.fileName}</h1>
            <p className="text-sm text-white/70 mt-0.5">AI-powered analysis complete</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/10">
            <HardDrive className="h-4 w-4 text-white/70" />
            <span className="text-sm font-medium">{formatFileSize(dataset.fileSize)}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/10">
            <FileText className="h-4 w-4 text-white/70" />
            <span className="text-sm font-medium">{dataset.totalRows.toLocaleString()} rows × {dataset.totalColumns} cols</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/10">
            <Clock className="h-4 w-4 text-white/70" />
            <span className="text-sm font-medium">{formatTimestamp(dataset.uploadTimestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
