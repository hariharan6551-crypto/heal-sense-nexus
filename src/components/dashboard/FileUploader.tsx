import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";

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
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-all duration-300 cursor-pointer
        ${isDragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/50"}
      `}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".csv,.xlsx,.xls";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) onFileSelect(file);
        };
        input.click();
      }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl healthcare-gradient">
        {isLoading ? (
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        ) : (
          <Upload className="h-7 w-7 text-primary-foreground" />
        )}
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">
          {isLoading ? "Processing..." : "Upload Healthcare Dataset"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Drag & drop or click to browse • CSV, XLSX supported
        </p>
      </div>
      <div className="flex gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
          <FileSpreadsheet className="h-3 w-3" /> .csv
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
          <FileSpreadsheet className="h-3 w-3" /> .xlsx
        </span>
      </div>
    </div>
  );
};

export default FileUploader;
