// ============================================================================
// InternalReportView — Fully Interactive Analytics (Power BI-grade)
// Slicers, cross-filtering, drill-down, export, clickable charts
// ============================================================================
import { memo, useMemo, useState, useCallback } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, ComposedChart, Line,
  PolarAngleAxis, PolarRadiusAxis, Radar, Sector
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, TrendingUp, Users, AlertTriangle, HeartHandshake, Download,
  BarChart3, PieChart as PieIcon, LineChart as LineIcon, Filter, X, RefreshCw
} from 'lucide-react';

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'];
const RISK_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };

// ── Slicer Chip ──
const Slicer = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'}`}>
    {label}
  </button>
);

// ── Card with export ──
const ChartCard = ({ title, icon: Icon, badge, children, onExport }: {
  title: string; icon: any; badge?: string; children: React.ReactNode; onExport?: () => void;
}) => (
  <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.06)] transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-500" />
        <h3 className="text-[14px] font-black text-slate-800">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        {badge && <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 bg-blue-50 px-2 py-1 rounded-lg">{badge}</span>}
        {onExport && <button onClick={onExport} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Export data"><Download className="w-3.5 h-3.5" /></button>}
      </div>
    </div>
    {children}
  </div>
);

// ── Custom active pie shape for drill-down ──
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" className="text-sm font-black" fill="#1e293b">{payload.name}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="text-xs" fill="#64748b">{value}% ({(percent * 100).toFixed(0)}%)</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 8} outerRadius={outerRadius + 12} fill={fill} opacity={0.3} />
    </g>
  );
};

// ── Export helper ──
function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(','), ...data.map(r => keys.map(k => r[k]).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}.csv`;
  a.click();
}

// ═══════════════════════════════════════════════════════════════
// Healthcare Analytics Report — Full Interactive
// ═══════════════════════════════════════════════════════════════
function HealthcareReport() {
  const [timePeriod, setTimePeriod] = useState('6m');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(null);
  const [activePieIdx, setActivePieIdx] = useState(0);

  const allData = useMemo(() => ({
    '3m': [
      { month: 'Apr', readmission: 12.9, target: 12, patients: 870 },
      { month: 'May', readmission: 11.7, target: 12, patients: 945 },
      { month: 'Jun', readmission: 13.2, target: 12, patients: 880 },
    ],
    '6m': [
      { month: 'Jan', readmission: 14.2, target: 12, patients: 820 },
      { month: 'Feb', readmission: 13.8, target: 12, patients: 795 },
      { month: 'Mar', readmission: 15.1, target: 12, patients: 910 },
      { month: 'Apr', readmission: 12.9, target: 12, patients: 870 },
      { month: 'May', readmission: 11.7, target: 12, patients: 945 },
      { month: 'Jun', readmission: 13.2, target: 12, patients: 880 },
    ],
    '12m': [
      { month: 'Jul', readmission: 14.8, target: 12, patients: 800 },
      { month: 'Aug', readmission: 13.5, target: 12, patients: 810 },
      { month: 'Sep', readmission: 12.2, target: 12, patients: 830 },
      { month: 'Oct', readmission: 15.4, target: 12, patients: 860 },
      { month: 'Nov', readmission: 14.1, target: 12, patients: 890 },
      { month: 'Dec', readmission: 16.0, target: 12, patients: 920 },
      { month: 'Jan', readmission: 14.2, target: 12, patients: 820 },
      { month: 'Feb', readmission: 13.8, target: 12, patients: 795 },
      { month: 'Mar', readmission: 15.1, target: 12, patients: 910 },
      { month: 'Apr', readmission: 12.9, target: 12, patients: 870 },
      { month: 'May', readmission: 11.7, target: 12, patients: 945 },
      { month: 'Jun', readmission: 13.2, target: 12, patients: 880 },
    ],
  }), []);

  const readmissionData = allData[timePeriod as keyof typeof allData] || allData['6m'];

  const diagnosisData = useMemo(() => [
    { name: 'Cardiovascular', value: 28 },
    { name: 'Respiratory', value: 22 },
    { name: 'Diabetes', value: 18 },
    { name: 'Orthopaedic', value: 15 },
    { name: 'Neurological', value: 10 },
    { name: 'Other', value: 7 },
  ], []);

  const losData = useMemo(() => {
    const all = [
      { department: 'Cardiology', avg: 6.8, median: 5.2, diagnosis: 'Cardiovascular' },
      { department: 'Pulmonary', avg: 8.1, median: 7.0, diagnosis: 'Respiratory' },
      { department: 'Surgery', avg: 4.2, median: 3.5, diagnosis: 'Orthopaedic' },
      { department: 'Oncology', avg: 9.4, median: 8.1, diagnosis: 'Other' },
      { department: 'Paediatrics', avg: 3.1, median: 2.8, diagnosis: 'Neurological' },
      { department: 'Endocrinology', avg: 5.6, median: 4.8, diagnosis: 'Diabetes' },
    ];
    if (selectedDiagnosis) return all.filter(d => d.diagnosis === selectedDiagnosis);
    return all;
  }, [selectedDiagnosis]);

  const avgReadmission = useMemo(() => (readmissionData.reduce((s, d) => s + d.readmission, 0) / readmissionData.length).toFixed(1), [readmissionData]);
  const totalPatients = useMemo(() => readmissionData.reduce((s, d) => s + d.patients, 0), [readmissionData]);

  const handlePieClick = useCallback((_: any, idx: number) => {
    setActivePieIdx(idx);
    setSelectedDiagnosis(prev => prev === diagnosisData[idx].name ? null : diagnosisData[idx].name);
  }, [diagnosisData]);

  const metrics = [
    { label: 'Total Patients', value: totalPatients.toLocaleString(), change: '+4.2%', color: '#3B82F6', icon: Users },
    { label: 'Avg Readmission', value: `${avgReadmission}%`, change: '-0.8%', color: '#EF4444', icon: TrendingUp },
    { label: 'High-Risk', value: '3,400', change: '+1.3%', color: '#F59E0B', icon: AlertTriangle },
    { label: 'Follow-up Rate', value: '50.9%', change: '+2.1%', color: '#10B981', icon: HeartHandshake },
  ];

  return (
    <div className="space-y-4">
      {/* Slicers Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Filter className="w-3 h-3" /> Time Period:</div>
        {['3m', '6m', '12m'].map(p => <Slicer key={p} label={p === '3m' ? '3 Months' : p === '6m' ? '6 Months' : '12 Months'} active={timePeriod === p} onClick={() => setTimePeriod(p)} />)}
        {selectedDiagnosis && (
          <button onClick={() => setSelectedDiagnosis(null)} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold border border-red-200 hover:bg-red-100 transition-colors">
            <X className="w-3 h-3" /> Clear: {selectedDiagnosis}
          </button>
        )}
      </div>

      {/* KPIs — clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(m => (
          <motion.div key={m.label} whileHover={{ y: -2 }} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{m.label}</span>
              <m.icon className="w-4 h-4" style={{ color: m.color }} />
            </div>
            <p className="text-2xl font-black" style={{ color: m.color }}>{m.value}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{m.change} vs last period</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Readmission Trend" icon={LineIcon} badge="AREA" onExport={() => exportToCSV(readmissionData, 'readmission_trend')}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={readmissionData}>
              <defs><linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600 }} />
              <YAxis domain={[8, 18]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="readmission" stroke="#3B82F6" strokeWidth={2.5} fill="url(#rGrad)" activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
              <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Interactive Pie — click to cross-filter */}
        <ChartCard title={`Diagnosis Distribution${selectedDiagnosis ? ` → ${selectedDiagnosis}` : ''}`} icon={PieIcon} badge="DRILL-DOWN" onExport={() => exportToCSV(diagnosisData, 'diagnosis')}>
          <p className="text-[10px] text-slate-400 -mt-2 mb-2 italic">Click a slice to filter charts</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={diagnosisData} cx="50%" cy="50%" outerRadius={85} innerRadius={35} paddingAngle={2} dataKey="value"
                activeIndex={activePieIdx} activeShape={renderActiveShape}
                onMouseEnter={(_, idx) => setActivePieIdx(idx)} onClick={handlePieClick} stroke="none">
                {diagnosisData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={selectedDiagnosis && selectedDiagnosis !== entry.name ? 0.3 : 1} cursor="pointer" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Cross-filtered LOS */}
        <ChartCard title={`Length of Stay${selectedDiagnosis ? ` — ${selectedDiagnosis}` : ' by Dept'}`} icon={BarChart3} badge={selectedDiagnosis ? 'FILTERED' : 'BAR'} onExport={() => exportToCSV(losData, 'length_of_stay')}>
          <AnimatePresence mode="wait">
            <motion.div key={selectedDiagnosis || 'all'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={losData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="department" tick={{ fontSize: 10, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="avg" name="Average" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="median" name="Median" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </ChartCard>

        <ChartCard title="Risk Factor Analysis" icon={Activity} badge="RADAR" onExport={() => exportToCSV([{ factor: 'Age', score: 85 }], 'risk_factors')}>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={[
              { factor: 'Age 75+', score: 85 }, { factor: 'Comorbidities', score: 72 },
              { factor: 'Length of Stay', score: 68 }, { factor: 'No Follow-up', score: 91 },
              { factor: 'Deprivation', score: 56 }, { factor: 'Prior Admits', score: 78 },
            ]}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name="Risk" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Risk Analysis Report — Interactive
// ═══════════════════════════════════════════════════════════════
function RiskReport() {
  const [activeRisk, setActiveRisk] = useState<string | null>(null);
  const [activePie, setActivePie] = useState(0);

  const riskTrend = useMemo(() => [
    { week: 'W1', high: 340, medium: 280, low: 380 },
    { week: 'W2', high: 320, medium: 290, low: 390 },
    { week: 'W3', high: 360, medium: 275, low: 365 },
    { week: 'W4', high: 380, medium: 260, low: 360 },
    { week: 'W5', high: 350, medium: 285, low: 365 },
    { week: 'W6', high: 330, medium: 295, low: 375 },
  ], []);

  const strat = useMemo(() => [
    { name: 'High Risk', value: 34, count: 3400 },
    { name: 'Medium Risk', value: 33, count: 3300 },
    { name: 'Low Risk', value: 33, count: 3300 },
  ], []);

  const filteredTrend = useMemo(() => {
    if (!activeRisk) return riskTrend;
    return riskTrend.map(d => ({ ...d, high: activeRisk === 'high' ? d.high : 0, medium: activeRisk === 'medium' ? d.medium : 0, low: activeRisk === 'low' ? d.low : 0 }));
  }, [riskTrend, activeRisk]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Filter className="w-3 h-3" /> Risk Level:</div>
        <Slicer label="All" active={!activeRisk} onClick={() => setActiveRisk(null)} />
        {['high', 'medium', 'low'].map(r => <Slicer key={r} label={`${r.charAt(0).toUpperCase() + r.slice(1)} Risk`} active={activeRisk === r} onClick={() => setActiveRisk(activeRisk === r ? null : r)} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Risk Level Trend" icon={TrendingUp} badge="STACKED" onExport={() => exportToCSV(riskTrend, 'risk_trend')}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={filteredTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="high" name="High" stackId="a" fill={RISK_COLORS.high} radius={[2, 2, 0, 0]} />
              <Bar dataKey="medium" name="Medium" stackId="a" fill={RISK_COLORS.medium} />
              <Bar dataKey="low" name="Low" stackId="a" fill={RISK_COLORS.low} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Patient Stratification" icon={PieIcon} badge="DONUT" onExport={() => exportToCSV(strat, 'stratification')}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={strat} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value"
                activeIndex={activePie} activeShape={renderActiveShape}
                onMouseEnter={(_, i) => setActivePie(i)}
                onClick={(_, i) => setActiveRisk(activeRisk === ['high', 'medium', 'low'][i] ? null : ['high', 'medium', 'low'][i])} stroke="none">
                <Cell fill={RISK_COLORS.high} opacity={activeRisk && activeRisk !== 'high' ? 0.3 : 1} cursor="pointer" />
                <Cell fill={RISK_COLORS.medium} opacity={activeRisk && activeRisk !== 'medium' ? 0.3 : 1} cursor="pointer" />
                <Cell fill={RISK_COLORS.low} opacity={activeRisk && activeRisk !== 'low' ? 0.3 : 1} cursor="pointer" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Operations Report — Interactive
// ═══════════════════════════════════════════════════════════════
function OperationsReport() {
  const [metric, setMetric] = useState<'all' | 'admissions' | 'discharges'>('all');
  const data = useMemo(() => [
    { day: 'Mon', occupancy: 87, admissions: 42, discharges: 38 },
    { day: 'Tue', occupancy: 91, admissions: 45, discharges: 35 },
    { day: 'Wed', occupancy: 85, admissions: 38, discharges: 44 },
    { day: 'Thu', occupancy: 89, admissions: 41, discharges: 37 },
    { day: 'Fri', occupancy: 93, admissions: 48, discharges: 32 },
    { day: 'Sat', occupancy: 82, admissions: 28, discharges: 42 },
    { day: 'Sun', occupancy: 78, admissions: 22, discharges: 35 },
  ], []);

  const avgOcc = (data.reduce((s, d) => s + d.occupancy, 0) / data.length).toFixed(1);
  const totalAdm = data.reduce((s, d) => s + d.admissions, 0);
  const totalDis = data.reduce((s, d) => s + d.discharges, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Filter className="w-3 h-3" /> Metric:</div>
        <Slicer label="All" active={metric === 'all'} onClick={() => setMetric('all')} />
        <Slicer label="Admissions Only" active={metric === 'admissions'} onClick={() => setMetric('admissions')} />
        <Slicer label="Discharges Only" active={metric === 'discharges'} onClick={() => setMetric('discharges')} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[{ l: 'Avg Occupancy', v: `${avgOcc}%`, c: '#3B82F6' }, { l: 'Total Admissions', v: totalAdm.toString(), c: '#10B981' }, { l: 'Total Discharges', v: totalDis.toString(), c: '#8B5CF6' }].map(k => (
          <div key={k.l} className="bg-white/70 border border-white/80 rounded-2xl p-4 shadow-sm">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{k.l}</p>
            <p className="text-2xl font-black mt-1" style={{ color: k.c }}>{k.v}</p>
          </div>
        ))}
      </div>
      <ChartCard title="Bed Occupancy & Patient Flow" icon={BarChart3} badge="COMBO" onExport={() => exportToCSV(data, 'operations')}>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 600 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[70, 100]} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {(metric === 'all' || metric === 'admissions') && <Bar yAxisId="left" dataKey="admissions" name="Admissions" fill="#3B82F6" radius={[4, 4, 0, 0]} />}
            {(metric === 'all' || metric === 'discharges') && <Bar yAxisId="left" dataKey="discharges" name="Discharges" fill="#10B981" radius={[4, 4, 0, 0]} />}
            <Line yAxisId="right" type="monotone" dataKey="occupancy" name="Occupancy %" stroke="#EF4444" strokeWidth={2.5} dot={{ fill: '#EF4444', r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// ── Main export ──
const InternalReportView = memo(function InternalReportView({ reportId }: { reportId: string }) {
  if (reportId.includes('risk') || reportId === 'demo-risk') return <RiskReport />;
  if (reportId.includes('operations') || reportId.includes('ops') || reportId === 'demo-ops') return <OperationsReport />;
  return <HealthcareReport />;
});

export default InternalReportView;
