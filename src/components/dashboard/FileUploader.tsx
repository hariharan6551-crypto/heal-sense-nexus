import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, FileJson } from "lucide-react";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUploader = ({ onFileSelect, isLoading }: FileUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-up">
      {/* Hero title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-3 tracking-tight">
          AI Analytics Dashboard
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Upload any dataset and get instant AI-powered analysis, visualizations, and insights
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative w-full max-w-xl flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed p-14 transition-all duration-300 cursor-pointer
          ${isDragOver
            ? "border-primary bg-primary/5 scale-[1.02] shadow-2xl shadow-primary/10"
            : "border-border hover:border-primary/50 hover:bg-muted/30 hover:shadow-lg"
          }
        `}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".csv,.xlsx,.xls,.json";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) onFileSelect(file);
          };
          input.click();
        }}
      >
        {/* Animated background orbs */}
        <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl animate-pulse-soft" />
        <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-accent/5 blur-2xl animate-pulse-soft" style={{ animationDelay: "1.5s" }} />

        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
          {isLoading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-white border-t-transparent" />
          ) : (
            <Upload className="h-8 w-8 text-white" />
          )}
        </div>

        <div className="text-center relative z-10">
          <p className="text-xl font-semibold text-foreground">
            {isLoading ? "Analyzing your data..." : "Drop your dataset here"}
          </p>
          <p className="text-sm text-muted-foreground mt-1.5">
            or click to browse your files
          </p>
        </div>

        <div className="flex gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-500/20">
            <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3.5 py-1.5 text-xs font-medium text-blue-600 border border-blue-500/20">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1.5 text-xs font-medium text-amber-600 border border-amber-500/20">
            <FileJson className="h-3.5 w-3.5" /> JSON
          </span>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
