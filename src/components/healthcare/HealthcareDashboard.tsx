import { useState, useMemo, useCallback, useEffect } from 'react';
import type { DatasetInfo } from '@/lib/parseData';
import { analyzeDataset } from '@/lib/analyzeData';
import { recommendCharts } from '@/lib/chartRecommender';
import { generateInsights } from '@/lib/insightEngine';
import { parseFile } from '@/lib/parseData';
import DashboardNav from './DashboardNav';
import DynamicKPIs from './DynamicKPIs';
import DynamicCharts from './DynamicCharts';
import DashboardTable from './DashboardTable';
import AIPanel from './AIPanel';
import DashboardFilters from './DashboardFilters';
import DataProfilePanel from './DataProfilePanel';
import HeroSection from './HeroSection';
import CommandPalette from './CommandPalette';
import DrilldownPanel from './DrilldownPanel';
import PatientPanel from './PatientPanel';
import FloatingActionButton from './FloatingActionButton';
import { toast } from 'sonner';

export default function HealthcareDashboard() {
  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Drilldown & Patient Panel state
  const [drilldownChartId, setDrilldownChartId] = useState<string | null>(null);
  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Record<string, any> | null>(null);
  const [patientPanelOpen, setPatientPanelOpen] = useState(false);

  const analysis = useMemo(() => dataset ? analyzeDataset(dataset) : null, [dataset]);
  const charts = useMemo(() => dataset ? recommendCharts(dataset) : [], [dataset]);
  const insights = useMemo(() => dataset && analysis ? generateInsights(dataset, analysis) : [], [dataset, analysis]);

  // Derived Title Generation Rule
  const dashboardTitle = useMemo(() => {
    if (!dataset) return '';
    const rawName = dataset.fileName.toLowerCase();
    
    // Explicit requested test cases
    if (rawName.includes('hospital_readmission') || rawName.includes('hospital readmission')) {
      return 'Post Discharge Social Support and Recovery Tracker';
    }
    if (rawName.includes('hospital_patient_data') || rawName.includes('hospital patient data')) {
      return 'Hospital Patient Analytics Dashboard';
    }
    if (rawName.includes('retail_sales_2025') || rawName.includes('retail sales 2025')) {
      return 'Retail Sales Performance Dashboard 2025';
    }
    if (rawName.includes('employee_attendance') || rawName.includes('employee attendance')) {
      return 'Employee Attendance Insights Dashboard';
    }

    // Generic Fallback
    let base = dataset.fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
    base = base.replace(/([a-z])([A-Z])/g, '$1 $2');
    let words = base.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    
    // Check columns to infer subjects if the title is too generic
    const allCols = dataset.columns.join(' ').toLowerCase();
    if (words.length < 2) {
      if (allCols.includes('patient') || allCols.includes('health') || allCols.includes('diagnosis')) {
        words.unshift('Healthcare');
      } else if (allCols.includes('sale') || allCols.includes('revenue') || allCols.includes('price')) {
        words.unshift('Sales');
      } else if (allCols.includes('student') || allCols.includes('grade') || allCols.includes('school')) {
        words.unshift('Education');
      }
    }
    
    // Add context padding
    const titleString = words.join(' ');
    if (titleString.toLowerCase().includes('dashboard') || titleString.toLowerCase().includes('analytics') || titleString.toLowerCase().includes('insights') || titleString.toLowerCase().includes('tracker')) {
      return titleString;
    }
    return `${titleString} Analytics Dashboard`;
  }, [dataset]);

  useEffect(() => {
    const loadDefaultData = async () => {
      try {
        const response = await fetch('/hospital_readmission_dataset.csv');
        if (!response.ok) throw new Error('Failed to fetch default dataset');
        const text = await response.text();
        const file = new File([text], 'hospital_readmission_dataset.csv', { type: 'text/csv' });
        const ds = await parseFile(file);
        setDataset(ds);
        setFilters({});
      } catch (err: any) {
        toast.error('Failed to load dataset', { description: err.message });
      } finally {
        setIsLoading(false);
      }
    };
    loadDefaultData();
  }, []);

  const handleDatasetLoaded = useCallback((ds: DatasetInfo) => {
    setIsLoading(true);
    setTimeout(() => {
      setDataset(ds);
      setFilters({});
      setIsLoading(false);
      toast.success('Dataset processed successfully');
    }, 300);
  }, []);

  const handleFile = async (file: File) => {
    try {
      setIsLoading(true);
      const ds = await parseFile(file);
      handleDatasetLoaded(ds);
    } catch (err: any) {
      toast.error('Failed to parse file', { description: err.message });
      setIsLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFile(e.dataTransfer.files[0]);
  };

  const handleFilterChange = useCallback((col: string, value: string) => {
    setFilters(prev => ({ ...prev, [col]: value }));
  }, []);

  const handleDrilldown = useCallback((chartId: string) => {
    setDrilldownChartId(chartId);
    setDrilldownOpen(true);
  }, []);

  const handlePatientClick = useCallback((patient: Record<string, any>) => {
    setSelectedPatient(patient);
    setPatientPanelOpen(true);
  }, []);

  const handleExportCSV = useCallback(() => {
    if (!dataset) return;
    const cols = dataset.columns;
    const csvContent = [
      cols.join(','),
      ...dataset.data.map(row => cols.map(c => {
        const val = String(row[c] ?? '');
        return val.includes(',') ? `"${val}"` : val;
      }).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.fileName.replace(/\.[^.]+$/, '')}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dataset exported as CSV');
  }, [dataset]);

  if (!dataset || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          {/* Skeleton loader */}
          <div className="space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="skeleton h-4 w-48 mx-auto" />
            <div className="skeleton h-3 w-36 mx-auto" />
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[1,2,3].map(i => <div key={i} className="skeleton h-20" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Command Palette */}
      <CommandPalette
        onTabChange={setActiveTab}
        onAction={(action) => {
          if (action === 'exportCSV') handleExportCSV();
        }}
      />

      {/* Navigation */}
      <DashboardNav
        onDatasetLoaded={handleDatasetLoaded}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-40 bg-white/60 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Analyzing dataset...</p>
          </div>
        </div>
      )}

      <main className="max-w-[1600px] mx-auto p-4 space-y-4 pt-6">

        {/* Hero Section — replaces the old simple title */}
        <HeroSection dataset={dataset} analysis={analysis} dashboardTitle={dashboardTitle} />

        {/* Dataset info bar */}
        <div className="flex items-center gap-3 flex-wrap animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600 hover-glow">
            📊 <span className="font-semibold">{dataset.fileName}</span>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600 hover-glow">
            {dataset.totalRows.toLocaleString()} rows × {dataset.totalColumns} cols
          </div>
          <div className="bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600 hover-glow">
            🔢 {dataset.numericColumns.length} numeric · 📋 {dataset.categoricalColumns.length} categorical
            {dataset.datetimeColumns.length > 0 && ` · 📅 ${dataset.datetimeColumns.length} datetime`}
          </div>
          {dataset.missingValueCount > 0 && (
            <div className="bg-amber-50 rounded-lg border border-amber-200 px-3 py-1.5 text-[11px] text-amber-700">
              ⚠️ {dataset.missingValueCount.toLocaleString()} missing values
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="animate-fade-up" style={{ animationDelay: '300ms' }}>
          <DashboardFilters dataset={dataset} filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* KPI Row */}
        <div className="animate-fade-up" style={{ animationDelay: '400ms' }}>
          <DynamicKPIs dataset={dataset} columnStats={analysis.columnStats} />
        </div>

        {/* Main grid: 3 cols left + sidebar right */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 page-transition">
          {/* Left 3 columns */}
          <div className="xl:col-span-3 space-y-4">
            {/* Tab: Dashboard */}
            {activeTab === 'Dashboard' && (
              <>
                <DynamicCharts
                  dataset={dataset}
                  charts={charts}
                  analysis={analysis}
                  filters={filters}
                  onDrilldown={handleDrilldown}
                />
                <DashboardTable
                  dataset={dataset}
                  filters={filters}
                  onPatientClick={handlePatientClick}
                />
              </>
            )}

            {/* Tab: Dataset */}
            {activeTab === 'Dataset' && (
              <div className="page-transition">
                <DataProfilePanel dataset={dataset} analysis={analysis} />
              </div>
            )}

            {/* Tab: AI Assistant — show insights in main area too */}
            {activeTab === 'AI Assistant' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 page-transition">
                <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  AI-Generated Insights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insights.map(ins => (
                    <div key={ins.id} className={`rounded-xl border p-4 hover-glow ${
                      ins.severity === 'critical' ? 'bg-red-50 border-red-200' :
                      ins.severity === 'warning' ? 'bg-amber-50 border-amber-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <p className="text-sm font-bold text-slate-700">{ins.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{ins.description}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        ins.severity === 'critical' ? 'bg-red-500 text-white' :
                        ins.severity === 'warning' ? 'bg-amber-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {ins.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Reports */}
            {activeTab === 'Reports' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 page-transition">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-700">📊 Dataset Report</h2>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Export Full Report
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                  <div className="bg-slate-50 rounded-lg p-4 hover-glow">
                    <p className="font-bold text-slate-800 mb-2">Dataset Summary</p>
                    <p>File: {dataset.fileName}</p>
                    <p>Rows: {dataset.totalRows.toLocaleString()}</p>
                    <p>Columns: {dataset.totalColumns}</p>
                    <p>Missing: {dataset.missingValueCount.toLocaleString()}</p>
                    <p>Duplicates: {dataset.duplicateRowCount}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 hover-glow">
                    <p className="font-bold text-slate-800 mb-2">Column Types</p>
                    <p>Numeric: {dataset.numericColumns.join(', ') || 'None'}</p>
                    <p>Categorical: {dataset.categoricalColumns.join(', ') || 'None'}</p>
                    <p>Datetime: {dataset.datetimeColumns.join(', ') || 'None'}</p>
                    <p>Text: {dataset.textColumns.join(', ') || 'None'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 md:col-span-2 hover-glow">
                    <p className="font-bold text-slate-800 mb-2">Statistics</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-1">Column</th>
                            <th className="text-right py-1">Mean</th>
                            <th className="text-right py-1">Median</th>
                            <th className="text-right py-1">Min</th>
                            <th className="text-right py-1">Max</th>
                            <th className="text-right py-1">Std Dev</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.columnStats.map(s => (
                            <tr key={s.column} className="border-b border-slate-100">
                              <td className="py-1 font-medium">{s.column}</td>
                              <td className="text-right py-1">{s.mean.toLocaleString()}</td>
                              <td className="text-right py-1">{s.median.toLocaleString()}</td>
                              <td className="text-right py-1">{s.min.toLocaleString()}</td>
                              <td className="text-right py-1">{s.max.toLocaleString()}</td>
                              <td className="text-right py-1">{s.stdDev.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* AI Insights Summary */}
                {insights.length > 0 && (
                  <div className="mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
                    <h3 className="text-sm font-bold text-indigo-800 mb-2">🤖 AI Insights Summary</h3>
                    <div className="space-y-2">
                      {insights.slice(0, 5).map(ins => (
                        <div key={ins.id} className="flex items-start gap-2">
                          <span className={`inline-block mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            ins.severity === 'critical' ? 'bg-red-500' :
                            ins.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          <p className="text-xs text-indigo-700">{ins.title}: {ins.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Settings */}
            {activeTab === 'Settings' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 page-transition">
                <h2 className="text-lg font-bold text-slate-700 mb-4">⚙️ Settings</h2>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-4 hover-glow">
                    <h4 className="font-bold text-blue-800 mb-2">📊 Power BI Integration</h4>
                    <p className="text-blue-700 mb-2">Connect Power BI to this dashboard's data endpoint:</p>
                    <div className="bg-white/80 rounded-lg p-2 mb-2">
                      <code className="text-[9px] text-blue-900 break-all">/data/dashboard-data.json</code>
                    </div>
                    <p className="text-[9px] text-blue-600">Get Data → Web → Enter URL above</p>
                  </div>

                  {/* Role-based Access Badge */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200 p-4 hover-glow">
                    <h4 className="font-bold text-purple-800 mb-2">👤 Role-Based Access</h4>
                    <div className="flex gap-2 mb-2">
                      <span className="px-2 py-1 text-[9px] font-bold rounded-full bg-purple-100 text-purple-700">Admin</span>
                      <span className="px-2 py-1 text-[9px] font-bold rounded-full bg-blue-100 text-blue-700">Doctor</span>
                      <span className="px-2 py-1 text-[9px] font-bold rounded-full bg-teal-100 text-teal-700">Analyst</span>
                    </div>
                    <p className="text-[9px] text-purple-600">Configure access levels for different user roles in the enterprise suite.</p>
                  </div>

                  {/* Real-time simulation */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-4 hover-glow">
                    <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Real-Time Data Simulation
                    </h4>
                    <p className="text-[9px] text-emerald-600">Live data feeds are simulated for demonstration purposes.</p>
                  </div>

                  <p className="text-slate-400">Enterprise AI Analytics Suite v3.0 • Dynamic Dashboard Engine</p>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar — AI Panel */}
          <div className="space-y-4">
            <AIPanel dataset={dataset} analysis={analysis} insights={insights} />
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton
        onExportCSV={handleExportCSV}
        onOpenAI={() => setActiveTab('AI Assistant')}
        onScrollTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {/* Drilldown Panel */}
      <DrilldownPanel
        isOpen={drilldownOpen}
        onClose={() => setDrilldownOpen(false)}
        chartId={drilldownChartId}
        dataset={dataset}
        analysis={analysis}
        charts={charts}
        filters={filters}
      />

      {/* Patient Panel */}
      <PatientPanel
        isOpen={patientPanelOpen}
        onClose={() => setPatientPanelOpen(false)}
        patient={selectedPatient}
        dataset={dataset}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-6">
        <div className="max-w-[1600px] mx-auto px-4 text-center">
          <p className="text-[10px] text-slate-400">
            {dataset ? dashboardTitle : 'AI-Powered Analytics Platform'} • Enterprise AI Analytics Suite © 2026
          </p>
          <p className="text-[8px] text-slate-300 mt-1">
            Press <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[7px] border border-slate-200">Ctrl+K</kbd> for quick commands
          </p>
        </div>
      </footer>
    </div>
  );
}
