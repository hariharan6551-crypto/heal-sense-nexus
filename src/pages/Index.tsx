import { useState } from "react";
import { Activity, LogOut } from "lucide-react";
import FileUploader from "@/components/dashboard/FileUploader";
import KPICards from "@/components/dashboard/KPICards";
import IndicatorChart from "@/components/dashboard/IndicatorChart";
import SupportDistribution from "@/components/dashboard/SupportDistribution";
import RecoveryTrend from "@/components/dashboard/RecoveryTrend";
import SupportComparison from "@/components/dashboard/SupportComparison";
import RecoveryForecast from "@/components/dashboard/RecoveryForecast";
import AIAssistant from "@/components/dashboard/AIAssistant";
import DatasetViewer from "@/components/dashboard/DatasetViewer";
import LoginPage from "@/components/dashboard/LoginPage";
import { parseFile, type DatasetInfo } from "@/lib/parseData";
import { toast } from "sonner";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFile = async (file: File) => {
    setIsLoading(true);
    try {
      const result = await parseFile(file);
      setDataset(result);
      setFileName(file.name);
      toast.success(`Loaded ${result.data.length} records from ${file.name}`);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl healthcare-gradient">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Healthcare Analytics</h1>
              <p className="text-xs text-muted-foreground">Welcome, Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {fileName && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {fileName}
              </span>
            )}
            <button
              onClick={() => { setIsAuthenticated(false); setDataset(null); setFileName(""); }}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Upload */}
        {!dataset && <FileUploader onFileSelect={handleFile} isLoading={isLoading} />}

        {/* Dashboard */}
        {dataset && (
          <>
            <KPICards dataset={dataset} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IndicatorChart dataset={dataset} />
              <SupportDistribution dataset={dataset} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecoveryTrend dataset={dataset} />
              <SupportComparison dataset={dataset} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecoveryForecast dataset={dataset} />
              <AIAssistant dataset={dataset} />
            </div>

            <DatasetViewer dataset={dataset} />

            <div className="flex justify-center pb-4">
              <button
                onClick={() => { setDataset(null); setFileName(""); }}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Upload Different Dataset
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
