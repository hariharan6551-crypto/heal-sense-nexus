import { useState, useMemo, useEffect } from 'react';
import {
  X, User, ShieldAlert, HeartPulse, Clock,
  MapPin, Stethoscope, StickyNote, Flag, FlagOff,
  Activity, Calendar, ChevronRight, Save,
} from 'lucide-react';
import type { DatasetInfo } from '@/lib/parseData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: Record<string, any> | null;
  dataset: DatasetInfo;
}

export default function PatientPanel({ isOpen, onClose, patient, dataset }: Props) {
  const [notes, setNotes] = useState('');
  const [flagged, setFlagged] = useState(false);

  // Load notes/flag from localStorage
  useEffect(() => {
    if (!patient) return;
    const id = String(patient[dataset.columns[0]] ?? '');
    const saved = localStorage.getItem(`patient-notes-${id}`);
    const savedFlag = localStorage.getItem(`patient-flag-${id}`);
    setNotes(saved || '');
    setFlagged(savedFlag === 'true');
  }, [patient, dataset.columns]);

  const saveNotes = () => {
    if (!patient) return;
    const id = String(patient[dataset.columns[0]] ?? '');
    localStorage.setItem(`patient-notes-${id}`, notes);
  };

  const toggleFlag = () => {
    if (!patient) return;
    const id = String(patient[dataset.columns[0]] ?? '');
    const newFlag = !flagged;
    setFlagged(newFlag);
    localStorage.setItem(`patient-flag-${id}`, String(newFlag));
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const riskLevel = useMemo(() => {
    if (!patient) return null;
    const riskCol = dataset.numericColumns.find(c => c.toLowerCase().includes('risk') || c.toLowerCase().includes('readmission'));
    if (!riskCol) return null;
    const val = Number(patient[riskCol]);
    if (isNaN(val)) return null;
    if (val > 70) return { level: 'Critical', color: 'red', value: val };
    if (val > 40) return { level: 'Moderate', color: 'amber', value: val };
    return { level: 'Low', color: 'emerald', value: val };
  }, [patient, dataset]);

  if (!isOpen || !patient) return null;

  const idCol = dataset.columns[0];
  const patientId = String(patient[idCol] ?? 'Unknown');

  const riskColors: Record<string, string> = {
    red: 'bg-red-100 text-red-700 border-red-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-700 text-white px-5 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Patient {patientId}</h2>
                <p className="text-slate-300 text-[10px]">Full Profile View</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleFlag}
                className={`p-1.5 rounded-lg transition-colors ${flagged ? 'bg-red-500/20 text-red-300' : 'hover:bg-white/10 text-slate-400'}`}
                title={flagged ? 'Unflag' : 'Flag for review'}
              >
                {flagged ? <Flag className="h-4 w-4" /> : <FlagOff className="h-4 w-4" />}
              </button>
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Risk Badge */}
          {riskLevel && (
            <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${riskColors[riskLevel.color]}`}>
              <ShieldAlert className="h-3 w-3" />
              {riskLevel.level} Risk — {riskLevel.value}%
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Patient Details Grid */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-indigo-500" />
              Patient Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {dataset.columns.map(col => {
                const val = patient[col];
                if (val === undefined || val === null) return null;
                const isNum = dataset.numericColumns.includes(col);
                return (
                  <div key={col} className="bg-white rounded-lg p-2.5 border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-medium uppercase truncate">
                      {col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}
                    </p>
                    <p className={`text-sm font-bold mt-0.5 ${isNum ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {isNum && typeof val === 'number' ? (Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2)) : String(val)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5 text-amber-500" />
              Clinical Notes
            </h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add clinical notes for this patient..."
              className="w-full h-24 text-xs text-slate-600 border border-slate-200 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={saveNotes}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save className="h-3 w-3" />
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
