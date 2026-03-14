// ═══════════════════════════════════════════════════════════════════════
// Healthcare Analytics — Data Module
// ═══════════════════════════════════════════════════════════════════════

export interface Patient {
  patientId: string;
  age: number;
  ageGroup: string;
  gender: string;
  region: string;
  diagnosis: string;
  diagnosisGroup: string;
  procedureCategory: string;
  supportType: string;
  supportScore: number;
  recoveryDays: number;
  readmissionRisk: number;
  opVisits: number;
  lengthOfStay: number;
  dischargeCount: number;
  homeCareVisits: number;
  reablementSuccess: number;
}

export interface DashboardKPIs {
  totalPatients: number;
  avgRecoveryDays: number;
  socialSupportScore: number;
  readmissionRate: number;
  opVisitsPerDay: number;
  doctorsOnDuty: number;
}

// ── Constants ────────────────────────────────────────────────────────
const REGIONS = ['London', 'Midlands', 'Yorkshire', 'North East', 'North West', 'South East', 'South West', 'East of England'];
const DIAGNOSES = ['Heart Failure', 'Diabetes', 'Respiratory', 'Infection', 'Neurological', 'Cardiovascular', 'Orthopedic', 'Renal Failure'];
const DIAGNOSIS_GROUPS = ['Neurological', 'Cardiovascular', 'Respiratory', 'Infection', 'Diabetes', 'Orthopedic'];
const PROCEDURES = ['Minor', 'Moderate', 'Major'];
const SUPPORT_TYPES = ['Family Support', 'Community Care', 'Peer Support', 'Counseling', 'No Support'];
const GENDERS = ['Male', 'Female'];

// ── Deterministic pseudo-random ──────────────────────────────────────
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function getAgeGroup(age: number): string {
  if (age < 35) return '18-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  if (age < 75) return '65-74';
  if (age < 85) return '75-84';
  return '85+';
}

// ── Generate patients ────────────────────────────────────────────────
function generatePatients(count: number): Patient[] {
  const patients: Patient[] = [];

  for (let i = 1; i <= count; i++) {
    const age = 18 + Math.floor(seededRandom(i * 3) * 70);
    const supportScore = +(1 + seededRandom(i * 7) * 9).toFixed(1);
    const isElderly = age >= 65;
    const hasLowSupport = supportScore < 4;

    // Higher risk for elderly + low support
    let baseRisk = seededRandom(i * 11) * 60;
    if (isElderly) baseRisk += 20;
    if (hasLowSupport) baseRisk += 15;
    const readmissionRisk = Math.min(99, Math.max(2, Math.round(baseRisk)));

    // Recovery days inversely related to support
    const baseRecovery = 5 + seededRandom(i * 13) * 30;
    const recoveryDays = Math.round(baseRecovery + (10 - supportScore) * 1.5);

    const diagnosis = pick(DIAGNOSES, i * 17);
    const diagnosisGroup = pick(DIAGNOSIS_GROUPS, i * 19);

    patients.push({
      patientId: `P${String(i).padStart(5, '0')}`,
      age,
      ageGroup: getAgeGroup(age),
      gender: pick(GENDERS, i * 23),
      region: pick(REGIONS, i * 29),
      diagnosis,
      diagnosisGroup,
      procedureCategory: pick(PROCEDURES, i * 31),
      supportType: pick(SUPPORT_TYPES, i * 37),
      supportScore,
      recoveryDays,
      readmissionRisk,
      opVisits: Math.round(1 + seededRandom(i * 41) * 14),
      lengthOfStay: Math.round(1 + seededRandom(i * 43) * 14),
      dischargeCount: Math.round(50 + seededRandom(i * 47) * 450),
      homeCareVisits: Math.round(seededRandom(i * 53) * 10),
      reablementSuccess: +(seededRandom(i * 59) * 0.6 + 0.3).toFixed(2),
    });
  }

  return patients;
}

// ── Pre-generated dataset ────────────────────────────────────────────
export const PATIENTS = generatePatients(200);

// ── KPI Calculator ───────────────────────────────────────────────────
export function computeKPIs(_patients: Patient[]): DashboardKPIs {
  return {
    totalPatients: 1245,
    avgRecoveryDays: 18,
    socialSupportScore: 7.4,
    readmissionRate: 11,
    opVisitsPerDay: 58,
    doctorsOnDuty: 12,
  };
}

// ── Chart data helpers ───────────────────────────────────────────────
export function getSupportDistribution(patients: Patient[]) {
  const counts: Record<string, number> = {};
  for (const p of patients) {
    counts[p.supportType] = (counts[p.supportType] || 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    percentage: +((value / patients.length) * 100).toFixed(1),
  }));
}

export function getRecoveryByWeek() {
  return [
    { week: 1, recovery: 15, support: 20, risk: 45 },
    { week: 2, recovery: 28, support: 35, risk: 38 },
    { week: 3, recovery: 42, support: 50, risk: 30 },
    { week: 4, recovery: 55, support: 58, risk: 25 },
    { week: 5, recovery: 65, support: 68, risk: 20 },
    { week: 6, recovery: 72, support: 75, risk: 16 },
    { week: 7, recovery: 78, support: 82, risk: 12 },
    { week: 8, recovery: 85, support: 88, risk: 8 },
  ];
}

export function getPatientsByRegion(patients: Patient[]) {
  const counts: Record<string, number> = {};
  for (const p of patients) {
    counts[p.region] = (counts[p.region] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAgeGroupDistribution(patients: Patient[]) {
  const counts: Record<string, number> = {};
  for (const p of patients) {
    counts[p.ageGroup] = (counts[p.ageGroup] || 0) + 1;
  }
  return Object.entries(counts).map(([group, count]) => ({ group, count }));
}

export function getHighRiskAlerts(patients: Patient[]) {
  return patients
    .filter(p => p.readmissionRisk > 70)
    .sort((a, b) => b.readmissionRisk - a.readmissionRisk)
    .slice(0, 5);
}

export function getScatterData(patients: Patient[]) {
  return patients.slice(0, 150).map(p => ({
    supportScore: p.supportScore,
    recoveryDays: p.recoveryDays,
    risk: p.readmissionRisk,
    id: p.patientId,
  }));
}

export function getHospitalOpsData() {
  return [
    { hour: '6AM', patients: 45, opVisits: 12, emergency: 3 },
    { hour: '8AM', patients: 120, opVisits: 35, emergency: 5 },
    { hour: '10AM', patients: 195, opVisits: 48, emergency: 8 },
    { hour: '12PM', patients: 230, opVisits: 42, emergency: 6 },
    { hour: '2PM', patients: 248, opVisits: 38, emergency: 4 },
    { hour: '4PM', patients: 210, opVisits: 30, emergency: 7 },
    { hour: '6PM', patients: 172, opVisits: 22, emergency: 5 },
    { hour: '8PM', patients: 130, opVisits: 15, emergency: 4 },
    { hour: '10PM', patients: 85, opVisits: 8, emergency: 3 },
  ];
}
