// ============================================================================
// InternalReportView — Rich internal analytics fallback
// Shows beautiful Recharts-based report when Power BI iframe can't render
// ============================================================================
import { memo, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  Activity, TrendingUp, Users, AlertTriangle, HeartHandshake,
  BarChart3, PieChart as PieIcon, LineChart as LineIcon
} from 'lucide-react';

// ── Chart palette ──
const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'];
const RISK_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };

// ── Card wrapper ──
const ChartCard = ({ title, icon: Icon, children, badge }: {
  title: string; icon: any; children: React.ReactNode; badge?: string;
}) => (
  <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-500" />
        <h3 className="text-[14px] font-black text-slate-800">{title}</h3>
      </div>
      {badge && (
        <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400 bg-blue-50 px-2 py-1 rounded-lg">{badge}</span>
      )}
    </div>
    {children}
  </div>
);

// ── Healthcare Analytics Report ──
function HealthcareReport() {
  const readmissionData = useMemo(() => [
    { month: 'Jan', readmission: 14.2, target: 12, patients: 820 },
    { month: 'Feb', readmission: 13.8, target: 12, patients: 795 },
    { month: 'Mar', readmission: 15.1, target: 12, patients: 910 },
    { month: 'Apr', readmission: 12.9, target: 12, patients: 870 },
    { month: 'May', readmission: 11.7, target: 12, patients: 945 },
    { month: 'Jun', readmission: 13.2, target: 12, patients: 880 },
  ], []);

  const diagnosisData = useMemo(() => [
    { name: 'Cardiovascular', value: 28 },
    { name: 'Respiratory', value: 22 },
    { name: 'Diabetes', value: 18 },
    { name: 'Orthopaedic', value: 15 },
    { name: 'Neurological', value: 10 },
    { name: 'Other', value: 7 },
  ], []);

  const losData = useMemo(() => [
    { department: 'Cardiology', avg: 6.8, median: 5.2 },
    { department: 'Pulmonary', avg: 8.1, median: 7.0 },
    { department: 'Surgery', avg: 4.2, median: 3.5 },
    { department: 'Oncology', avg: 9.4, median: 8.1 },
    { department: 'Paediatrics', avg: 3.1, median: 2.8 },
  ], []);

  const metrics = [
    { label: 'Total Patients', value: '10,000', change: '+4.2%', color: '#3B82F6', icon: Users },
    { label: 'Readmission Rate', value: '13.2%', change: '-0.8%', color: '#EF4444', icon: TrendingUp },
    { label: 'High-Risk', value: '3,400', change: '+1.3%', color: '#F59E0B', icon: AlertTriangle },
    { label: 'Follow-up Rate', value: '50.9%', change: '+2.1%', color: '#10B981', icon: HeartHandshake },
  ];

  return (
    <div className="space-y-4">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{m.label}</span>
              <m.icon className="w-4 h-4" style={{ color: m.color }} />
            </div>
            <p className="text-2xl font-black" style={{ color: m.color }}>{m.value}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-1">{m.change} vs last month</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Readmission Trend */}
        <ChartCard title="30-Day Readmission Trend" icon={LineIcon} badge="LINE">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={readmissionData}>
              <defs>
                <linearGradient id="readmissionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600 }} />
              <YAxis domain={[10, 16]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="readmission" stroke="#3B82F6" strokeWidth={2} fill="url(#readmissionGrad)" />
              <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Diagnosis Distribution */}
        <ChartCard title="Readmission by Diagnosis" icon={PieIcon} badge="PIE">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={diagnosisData} cx="50%" cy="50%" outerRadius={85} paddingAngle={2} dataKey="value" label={({ name, value }) => `${name} (${value}%)`} stroke="none">
                {diagnosisData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Length of Stay */}
        <ChartCard title="Average Length of Stay by Department" icon={BarChart3} badge="BAR">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={losData} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="department" tick={{ fontSize: 10, fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="avg" name="Average" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="median" name="Median" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Risk Radar */}
        <ChartCard title="Risk Factor Analysis" icon={Activity} badge="RADAR">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={[
              { factor: 'Age 75+', score: 85 },
              { factor: 'Comorbidities', score: 72 },
              { factor: 'Length of Stay', score: 68 },
              { factor: 'No Follow-up', score: 91 },
              { factor: 'Deprivation', score: 56 },
              { factor: 'Prior Admits', score: 78 },
            ]}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name="Risk Score" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ── Risk Analysis Report ──
function RiskReport() {
  const riskTrend = useMemo(() => [
    { week: 'W1', high: 340, medium: 280, low: 380 },
    { week: 'W2', high: 320, medium: 290, low: 390 },
    { week: 'W3', high: 360, medium: 275, low: 365 },
    { week: 'W4', high: 380, medium: 260, low: 360 },
    { week: 'W5', high: 350, medium: 285, low: 365 },
    { week: 'W6', high: 330, medium: 295, low: 375 },
  ], []);

  const stratification = useMemo(() => [
    { name: 'High Risk', value: 34 },
    { name: 'Medium Risk', value: 33 },
    { name: 'Low Risk', value: 33 },
  ], []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Risk Level Trend (Weekly)" icon={TrendingUp} badge="STACKED">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={riskTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="high" name="High Risk" stackId="a" fill={RISK_COLORS.high} />
              <Bar dataKey="medium" name="Medium Risk" stackId="a" fill={RISK_COLORS.medium} />
              <Bar dataKey="low" name="Low Risk" stackId="a" fill={RISK_COLORS.low} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Patient Stratification" icon={PieIcon} badge="DONUT">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stratification} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value}%)`} stroke="none">
                <Cell fill={RISK_COLORS.high} />
                <Cell fill={RISK_COLORS.medium} />
                <Cell fill={RISK_COLORS.low} />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ── Operations Report ──
function OperationsReport() {
  const bedOccupancy = useMemo(() => [
    { day: 'Mon', occupancy: 87, admissions: 42, discharges: 38 },
    { day: 'Tue', occupancy: 91, admissions: 45, discharges: 35 },
    { day: 'Wed', occupancy: 85, admissions: 38, discharges: 44 },
    { day: 'Thu', occupancy: 89, admissions: 41, discharges: 37 },
    { day: 'Fri', occupancy: 93, admissions: 48, discharges: 32 },
    { day: 'Sat', occupancy: 82, admissions: 28, discharges: 42 },
    { day: 'Sun', occupancy: 78, admissions: 22, discharges: 35 },
  ], []);

  return (
    <div className="space-y-4">
      <ChartCard title="Weekly Bed Occupancy & Patient Flow" icon={BarChart3} badge="COMBO">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={bedOccupancy}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 600 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="admissions" name="Admissions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="left" dataKey="discharges" name="Discharges" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="occupancy" name="Occupancy %" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 3 }} />
          </BarChart>
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
