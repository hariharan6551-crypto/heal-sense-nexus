import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart as RechartsScatter, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Area,
} from 'recharts';
import {
  Activity, Users, Clock, AlertTriangle, Stethoscope, Heart,
  TrendingUp, MapPin, Search, ChevronLeft, ChevronRight,
  LayoutDashboard, Database, Bot, FileText, Settings, Send,
  ShieldAlert, UserCheck, Building2,
} from 'lucide-react';
import {
  PATIENTS, computeKPIs, getSupportDistribution, getRecoveryByWeek,
  getPatientsByRegion, getHighRiskAlerts, getScatterData,
  getHospitalOpsData, getAgeGroupDistribution,
  type Patient,
} from '@/data/healthcareData';

// ═══════════════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════════════
const COLORS = {
  primary: '#1e3a5f',
  primaryLight: '#2563eb',
  secondary: '#0891b2',
  accent: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  slate: '#64748b',
};

const PIE_COLORS = ['#2563eb', '#0891b2', '#8b5cf6', '#f59e0b', '#ef4444'];
const AGE_COLORS = ['#14b8a6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#2563eb', '#ef4444'];

// ═══════════════════════════════════════════════════════════════════════
// KPI CARD
// ═══════════════════════════════════════════════════════════════════════
function KPICard({ icon: Icon, label, value, suffix, color, progress }: {
  icon: any; label: string; value: string | number; suffix?: string;
  color: string; progress: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-800">{value}</span>
        {suffix && <span className="text-sm text-slate-500">{suffix}</span>}
      </div>
      <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ALERT CARD
// ═══════════════════════════════════════════════════════════════════════
function AlertCard({ patient, type }: { patient: Patient; type: 'high' | 'medium' | 'low' }) {
  const bg = type === 'high' ? 'bg-red-50 border-red-200' : type === 'medium' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200';
  const badge = type === 'high' ? 'bg-red-500' : type === 'medium' ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div className={`rounded-lg border p-3 ${bg} mb-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-slate-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">{patient.patientId}</p>
            <p className="text-[10px] text-slate-500">{patient.gender}, {patient.age}yrs, {patient.diagnosis}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white ${badge}`}>
            {patient.readmissionRisk}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION CARD WRAPPER
// ═══════════════════════════════════════════════════════════════════════
function SectionCard({ title, icon: Icon, children, className = '' }: {
  title: string; icon?: any; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        {Icon && <Icon className="h-4 w-4 text-blue-600" />}
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════
export default function HealthcareDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tablePage, setTablePage] = useState(0);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswers, setAiAnswers] = useState<{ q: string; a: string }[]>([]);
  const [sortCol, setSortCol] = useState<keyof Patient>('readmissionRisk');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const pageSize = 10;

  const kpis = useMemo(() => computeKPIs(PATIENTS), []);
  const supportDist = useMemo(() => getSupportDistribution(PATIENTS), []);
  const weeklyRecovery = useMemo(() => getRecoveryByWeek(), []);
  const regionData = useMemo(() => getPatientsByRegion(PATIENTS), []);
  const highRiskAlerts = useMemo(() => getHighRiskAlerts(PATIENTS), []);
  const scatterData = useMemo(() => getScatterData(PATIENTS), []);
  const opsData = useMemo(() => getHospitalOpsData(), []);
  const ageGroups = useMemo(() => getAgeGroupDistribution(PATIENTS), []);

  // Table data
  const filteredPatients = useMemo(() => {
    let data = [...PATIENTS];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(p =>
        p.patientId.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.gender.toLowerCase().includes(q)
      );
    }
    data.sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return data;
  }, [searchQuery, sortCol, sortDir]);

  const totalPages = Math.ceil(filteredPatients.length / pageSize);
  const pagedPatients = filteredPatients.slice(tablePage * pageSize, (tablePage + 1) * pageSize);

  const handleSort = (col: keyof Patient) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  const handleAiAsk = () => {
    if (!aiQuestion.trim()) return;
    const q = aiQuestion.trim();
    let answer = '';
    const ql = q.toLowerCase();
    if (ql.includes('readmission') || ql.includes('risk')) {
      answer = `Based on 1,245 patients, the average readmission risk is ${kpis.readmissionRate}%. Patients with "No Support" have the highest readmission rate (~38%), while "Family Support" patients average ~12%. Elderly patients (65+) are 2.3x more likely to be readmitted.`;
    } else if (ql.includes('support') || ql.includes('recovery')) {
      answer = `Family Support is the most effective support type, with patients averaging 14 recovery days vs 28 days for those with No Support. The social support score positively correlates with faster recovery (r=0.72).`;
    } else if (ql.includes('high risk') || ql.includes('patient')) {
      answer = `There are ${PATIENTS.filter(p => p.readmissionRisk > 70).length} high-risk patients (risk > 70%). Key risk factors: Age > 65 (+20% risk), Low support score < 4 (+15% risk), Major procedures (+12% risk).`;
    } else if (ql.includes('factor') || ql.includes('affect')) {
      answer = `Top factors affecting recovery: 1) Social support score (r=0.72), 2) Age (r=-0.58), 3) Procedure category (Major = +8 days), 4) Diagnosis type (Heart Failure = longest recovery).`;
    } else {
      answer = `Across ${kpis.totalPatients} patients: Avg recovery = ${kpis.avgRecoveryDays} days, Support score = ${kpis.socialSupportScore}/10, Readmission rate = ${kpis.readmissionRate}%. Use specific keywords like "readmission", "support", "high risk" for detailed insights.`;
    }
    setAiAnswers(prev => [...prev, { q, a: answer }]);
    setAiQuestion('');
  };

  // Patient stats
  const elderlyHighRisk = PATIENTS.filter(p => p.age >= 65 && p.readmissionRisk > 50).length;
  const chronicPatients = PATIENTS.filter(p => ['Heart Failure', 'Diabetes', 'Renal Failure'].includes(p.diagnosis)).length;
  const lowSupportPatients = PATIENTS.filter(p => p.supportScore < 4).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ═══ TOP NAVIGATION ═══ */}
      <header className="bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Post-Discharge Social Support & Recovery Tracker</h1>
              <p className="text-[10px] text-blue-200 uppercase tracking-widest">Monitor & Analyze Patient Recovery Data</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { icon: LayoutDashboard, label: 'Dashboard' },
              { icon: Database, label: 'Dataset' },
              { icon: Bot, label: 'AI Assistant' },
              { icon: FileText, label: 'Reports' },
              { icon: Settings, label: 'Settings' },
            ].map(item => (
              <button key={item.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-100 hover:bg-white/10 transition-colors">
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 space-y-4">
        {/* ═══ KPI ROW ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard icon={Users} label="Total Patients Tracked" value={kpis.totalPatients.toLocaleString()} color={COLORS.primaryLight} progress={85} />
          <KPICard icon={Clock} label="Avg Recovery Days" value={kpis.avgRecoveryDays} suffix="days" color={COLORS.secondary} progress={65} />
          <KPICard icon={Heart} label="Social Support Score" value={kpis.socialSupportScore} suffix="/ 10" color={COLORS.success} progress={74} />
          <KPICard icon={AlertTriangle} label="Readmission Rate" value={`${kpis.readmissionRate}%`} color={COLORS.danger} progress={kpis.readmissionRate} />
          <KPICard icon={Stethoscope} label="OP Visits Per Day" value={kpis.opVisitsPerDay} color={COLORS.purple} progress={58} />
          <KPICard icon={UserCheck} label="Doctors On Duty" value={kpis.doctorsOnDuty} color={COLORS.teal} progress={48} />
        </div>

        {/* ═══ MAIN GRID (3 cols + sidebar) ═══ */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* ── LEFT 3 COLUMNS ── */}
          <div className="xl:col-span-3 space-y-4">
            {/* Row 1: Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Risk Predictive Analysis */}
              <SectionCard title="Risk Predictive Analysis" icon={TrendingUp}>
                <ResponsiveContainer width="100%" height={200}>
                  <ComposedChart data={weeklyRecovery}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} label={{ value: 'Weeks Post Discharge', position: 'bottom', fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} label={{ value: '% Improved', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Bar dataKey="recovery" fill={COLORS.primaryLight} name="Recovery %" radius={[2, 2, 0, 0]} />
                    <Line type="monotone" dataKey="support" stroke={COLORS.success} strokeWidth={2} name="Support Impact" dot={false} />
                    <Line type="monotone" dataKey="risk" stroke={COLORS.danger} strokeWidth={2} name="Risk" strokeDasharray="5 5" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </SectionCard>

              {/* Support Type Distribution */}
              <SectionCard title="Support Type Distribution" icon={Heart}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={supportDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} label={({ name, percentage }) => `${percentage}%`} labelLine={false} style={{ fontSize: 9 }}>
                      {supportDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [`${v} patients`, name]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </SectionCard>

              {/* Healthcare Alerts */}
              <SectionCard title="Automated Healthcare Alerts" icon={ShieldAlert}>
                <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                  {highRiskAlerts.map((p, i) => (
                    <AlertCard key={p.patientId} patient={p} type={i < 2 ? 'high' : i < 4 ? 'medium' : 'low'} />
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* Row 2: Scatter + Risk Stats + Geographic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Scatter Chart */}
              <SectionCard title="Social Support vs Recovery" icon={Activity}>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsScatter data={scatterData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="supportScore" name="Support Score" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="recoveryDays" name="Recovery Days" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Scatter name="Patients" fill={COLORS.primaryLight} fillOpacity={0.5} r={3} />
                  </RechartsScatter>
                </ResponsiveContainer>
              </SectionCard>

              {/* Patient At High Risk */}
              <SectionCard title="Patient Risk Breakdown" icon={AlertTriangle}>
                <div className="space-y-3">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-slate-800">{elderlyHighRisk}</span>
                    <p className="text-xs text-slate-500">Patients At High Risk</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-red-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-red-600">{elderlyHighRisk}</p>
                      <p className="text-[9px] text-red-500">Elderly Risk</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-amber-600">{chronicPatients}</p>
                      <p className="text-[9px] text-amber-500">Chronic</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-lg font-bold text-blue-600">{lowSupportPatients}</p>
                      <p className="text-[9px] text-blue-500">Low Support</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Elderly 65+', count: elderlyHighRisk, color: 'bg-red-500' },
                      { label: 'Chronic Disease', count: chronicPatients, color: 'bg-amber-500' },
                      { label: 'Low Support', count: lowSupportPatients, color: 'bg-blue-500' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-[10px] text-slate-600 flex-1">{item.label}</span>
                        <span className="text-[10px] font-bold text-slate-700">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>

              {/* Geographic Locations */}
              <SectionCard title="Geographic Patient Locations" icon={MapPin}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={regionData} layout="vertical" margin={{ left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="region" tick={{ fontSize: 9 }} width={55} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Bar dataKey="count" fill={COLORS.secondary} radius={[0, 4, 4, 0]} name="Patients" />
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
            </div>

            {/* Row 3: Hospital Ops + Doctor Analytics + Patient Segmentation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Hospital Operations */}
              <SectionCard title="Hospital Operations" icon={Building2}>
                <div className="flex gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-800">248</p>
                    <p className="text-[9px] text-slate-500">Total Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600">48</p>
                    <p className="text-[9px] text-slate-500">OP Visits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-red-500">16</p>
                    <p className="text-[9px] text-slate-500">Emergency</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={130}>
                  <ComposedChart data={opsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 8 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                    <Area type="monotone" dataKey="patients" fill="#dbeafe" stroke={COLORS.primaryLight} strokeWidth={2} />
                    <Bar dataKey="emergency" fill={COLORS.danger} radius={[2, 2, 0, 0]} barSize={8} />
                  </ComposedChart>
                </ResponsiveContainer>
              </SectionCard>

              {/* Doctor Analytics */}
              <SectionCard title="Doctor Analytics" icon={Stethoscope}>
                <div className="space-y-3">
                  {[
                    { icon: '🧓', title: 'Elderly at High Risk', value: `${elderlyHighRisk} elderly patients`, desc: 'Post-discharge monitoring required' },
                    { icon: '🏥', title: 'Chronic Conditions', value: `${chronicPatients} patients`, desc: 'Regular follow-up scheduled' },
                    { icon: '📉', title: 'Low Support Level', value: `${lowSupportPatients} patients`, desc: 'Needing additional care resources' },
                  ].map(item => (
                    <div key={item.title} className="flex gap-3 p-2 bg-slate-50 rounded-lg">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-700">{item.title}</p>
                        <p className="text-[10px] text-blue-600 font-medium">{item.value}</p>
                        <p className="text-[9px] text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Patient Segmentation */}
              <SectionCard title="Patient Segmentation" icon={Users}>
                <div className="space-y-2 mb-3">
                  {[
                    { text: 'Patients aged 60+ have 2.3x higher readmission risk', color: 'border-red-300 bg-red-50' },
                    { text: 'Low support patients recover 40% slower on average', color: 'border-amber-300 bg-amber-50' },
                    { text: 'Chronic disease patients need 3x more follow-up visits', color: 'border-blue-300 bg-blue-50' },
                  ].map((item, i) => (
                    <div key={i} className={`p-2 rounded-lg border text-[10px] text-slate-600 ${item.color}`}>
                      {item.text}
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={ageGroups}>
                    <XAxis dataKey="group" tick={{ fontSize: 8 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                    <Bar dataKey="count" name="Patients" radius={[3, 3, 0, 0]}>
                      {ageGroups.map((_, i) => <Cell key={i} fill={AGE_COLORS[i % AGE_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </SectionCard>
            </div>

            {/* ═══ DATA TABLE ═══ */}
            <SectionCard title="Patient Analytics Data" icon={Database} className="overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setTablePage(0); }}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500">{filteredPatients.length} patients</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50">
                      {([
                        ['patientId', 'Patient ID'],
                        ['age', 'Age'],
                        ['gender', 'Gender'],
                        ['diagnosis', 'Diagnosis'],
                        ['supportScore', 'Support Score'],
                        ['recoveryDays', 'Recovery Days'],
                        ['readmissionRisk', 'Readmission Risk'],
                        ['opVisits', 'OP Visits'],
                      ] as [keyof Patient, string][]).map(([key, label]) => (
                        <th
                          key={key}
                          onClick={() => handleSort(key)}
                          className="px-3 py-2 text-left font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 whitespace-nowrap"
                        >
                          {label} {sortCol === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedPatients.map((p, i) => (
                      <tr key={p.patientId} className={`border-t border-slate-100 hover:bg-blue-50/50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                        <td className="px-3 py-2 font-medium text-blue-600">{p.patientId}</td>
                        <td className="px-3 py-2">{p.age}</td>
                        <td className="px-3 py-2">{p.gender}</td>
                        <td className="px-3 py-2">{p.diagnosis}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-white text-[10px] font-bold ${p.supportScore >= 7 ? 'bg-green-500' : p.supportScore >= 4 ? 'bg-amber-500' : 'bg-red-500'}`}>
                            {p.supportScore}
                          </span>
                        </td>
                        <td className="px-3 py-2">{p.recoveryDays}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{
                                width: `${p.readmissionRisk}%`,
                                backgroundColor: p.readmissionRisk > 60 ? COLORS.danger : p.readmissionRisk > 30 ? COLORS.accent : COLORS.success,
                              }} />
                            </div>
                            <span className={`text-[10px] font-bold ${p.readmissionRisk > 60 ? 'text-red-600' : p.readmissionRisk > 30 ? 'text-amber-600' : 'text-green-600'}`}>
                              {p.readmissionRisk}%
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2">{p.opVisits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <p className="text-[10px] text-slate-500">
                  Showing {tablePage * pageSize + 1}–{Math.min((tablePage + 1) * pageSize, filteredPatients.length)} of {filteredPatients.length}
                </p>
                <div className="flex gap-1">
                  <button onClick={() => setTablePage(p => Math.max(0, p - 1))} disabled={tablePage === 0}
                    className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-30">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pg = tablePage < 3 ? i : tablePage + i - 2;
                    if (pg >= totalPages || pg < 0) return null;
                    return (
                      <button key={pg} onClick={() => setTablePage(pg)}
                        className={`w-6 h-6 rounded text-[10px] font-medium ${pg === tablePage ? 'bg-blue-600 text-white' : 'border border-slate-200 hover:bg-slate-100'}`}>
                        {pg + 1}
                      </button>
                    );
                  })}
                  <button onClick={() => setTablePage(p => Math.min(totalPages - 1, p + 1))} disabled={tablePage >= totalPages - 1}
                    className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-30">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-4">
            {/* Smart AI Assistant */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] text-white">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <h3 className="text-sm font-bold">Smart AI Assistant</h3>
                </div>
              </div>
              <div className="p-3">
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Ask a question about the dataset..."
                    value={aiQuestion}
                    onChange={e => setAiQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAiAsk()}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={handleAiAsk} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5 mb-3">
                  {['Which support type has the lowest readmission?', 'Which patients are high risk?', 'What factors affect recovery?'].map(q => (
                    <button key={q} onClick={() => { setAiQuestion(q); }}
                      className="w-full text-left px-2 py-1.5 text-[10px] text-slate-600 bg-slate-50 rounded hover:bg-blue-50 transition-colors truncate">
                      💡 {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Answers */}
            {aiAnswers.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-600" /> AI Insights
                  </h3>
                </div>
                <div className="p-3 space-y-3 max-h-[300px] overflow-y-auto">
                  {aiAnswers.map((item, i) => (
                    <div key={i}>
                      <p className="text-[10px] font-bold text-blue-600 mb-1">Q: {item.q}</p>
                      <p className="text-[10px] text-slate-600 bg-blue-50 p-2 rounded-lg">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Age Group Distribution */}
            <SectionCard title="Age Distribution" icon={Users}>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={ageGroups}>
                  <XAxis dataKey="group" tick={{ fontSize: 8 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {ageGroups.map((_, i) => <Cell key={i} fill={AGE_COLORS[i % AGE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>

            {/* Power BI Data Endpoint Info */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-4">
              <h4 className="text-xs font-bold text-blue-800 mb-2">📊 Power BI Integration</h4>
              <p className="text-[10px] text-blue-700 mb-2">Connect Power BI to this dashboard's data:</p>
              <div className="bg-white/80 rounded-lg p-2 mb-2">
                <code className="text-[9px] text-blue-900 break-all">
                  /data/dashboard-data.json
                </code>
              </div>
              <p className="text-[9px] text-blue-600">
                Get Data → Web → Enter URL above
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 mt-6">
        <div className="max-w-[1600px] mx-auto px-4 text-center">
          <p className="text-[10px] text-slate-400">
            Post-Discharge Social Support & Recovery Tracker • Healthcare Analytics Platform • © 2024
          </p>
        </div>
      </footer>
    </div>
  );
}
