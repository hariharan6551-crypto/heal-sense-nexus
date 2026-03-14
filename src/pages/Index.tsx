import { useState, useMemo } from "react";
import { Activity, Upload as UploadIcon } from "lucide-react";
import FileUploader from "@/components/dashboard/FileUploader";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KPICards from "@/components/dashboard/KPICards";
import FilterPanel, { type FilterState } from "@/components/dashboard/FilterPanel";
import DataProfilePanel from "@/components/dashboard/DataProfilePanel";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import DynamicChart from "@/components/dashboard/DynamicChart";
import CorrelationHeatmap from "@/components/dashboard/CorrelationHeatmap";
import BoxPlotChart from "@/components/dashboard/BoxPlotChart";
import ChartControls from "@/components/dashboard/ChartControls";
import DatasetViewer from "@/components/dashboard/DatasetViewer";
import AIAssistant from "@/components/dashboard/AIAssistant";
import { parseFile, type DatasetInfo } from "@/lib/parseData";
import { analyzeDataset, type DataAnalysis } from "@/lib/analyzeData";
import { generateInsights, type Insight } from "@/lib/insightEngine";
import { recommendCharts, type ChartRecommendation } from "@/lib/chartRecommender";
import { toast } from "sonner";

const Index = () => {
  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [analysis, setAnalysis] = useState<DataAnalysis | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [chartRecs, setChartRecs] = useState<ChartRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ categoryFilters: {}, numericRanges: {} });

  const handleFile = async (file: File) => {
    setIsLoading(true);
    try {
      const result = await parseFile(file);

      // Run analysis
      const analysisResult = analyzeDataset(result);
      const insightsResult = generateInsights(result, analysisResult);
      const recs = recommendCharts(result);

      setDataset(result);
      setAnalysis(analysisResult);
      setInsights(insightsResult);
      setChartRecs(recs);
      setFilters({ categoryFilters: {}, numericRanges: {} });

      toast.success(`Analyzed ${result.totalRows.toLocaleString()} records from ${file.name}`);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to data
  const filteredData = useMemo(() => {
    if (!dataset) return [];
    let data = dataset.data;

    // Category filters
    for (const [col, values] of Object.entries(filters.categoryFilters)) {
      if (values.length > 0) {
        data = data.filter(row => values.includes(String(row[col] || "")));
      }
    }

    // Numeric range filters
    for (const [col, [min, max]] of Object.entries(filters.numericRanges)) {
      data = data.filter(row => {
        const v = Number(row[col]);
        return !isNaN(v) && v >= min && v <= max;
      });
    }

    return data;
  }, [dataset, filters]);

  // Charts that don't need a custom renderer
  const standardCharts = chartRecs.filter(r => !["heatmap", "boxplot"].includes(r.type));

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/20">
              <Activity className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">AI Analytics</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Intelligent Dashboard</p>
            </div>
          </div>

          {dataset && (
            <button
              onClick={() => { setDataset(null); setAnalysis(null); setInsights([]); setChartRecs([]); }}
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <UploadIcon className="h-3.5 w-3.5" /> New Dataset
            </button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Upload State */}
        {!dataset && <FileUploader onFileSelect={handleFile} isLoading={isLoading} />}

        {/* Dashboard State */}
        {dataset && analysis && (
          <>
            {/* 1. Dashboard Header */}
            <DashboardHeader dataset={dataset} />

            {/* 2. KPI Cards */}
            <KPICards dataset={dataset} />

            {/* 3. Filter Panel */}
            <FilterPanel dataset={dataset} filters={filters} onFiltersChange={setFilters} />

            {/* 4. AI Insights */}
            <InsightsPanel insights={insights} />

            {/* 5. Auto-generated charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {standardCharts.map(rec => (
                <DynamicChart
                  key={rec.id}
                  recommendation={rec}
                  dataset={dataset}
                  filteredData={filteredData}
                />
              ))}
            </div>

            {/* 6. Correlation Heatmap + Box Plot */}
            {(dataset.numericColumns.length >= 3 || analysis.columnStats.some(s => s.outlierCount > 0)) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dataset.numericColumns.length >= 3 && (
                  <CorrelationHeatmap
                    correlations={analysis.correlationMatrix}
                    columns={dataset.numericColumns.slice(0, 8)}
                  />
                )}
                {analysis.columnStats.some(s => s.max !== s.min) && (
                  <BoxPlotChart stats={analysis.columnStats} />
                )}
              </div>
            )}

            {/* 7. Chart Explorer */}
            <ChartControls dataset={dataset} filteredData={filteredData} />

            {/* 8. Data Profile */}
            <DataProfilePanel dataset={dataset} columnStats={analysis.columnStats} />

            {/* 9. Dataset Viewer */}
            <DatasetViewer dataset={dataset} filteredData={filteredData} />

            {/* 10. AI Assistant */}
            <AIAssistant dataset={dataset} analysis={analysis} />

            {/* Footer spacing */}
            <div className="h-8" />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
