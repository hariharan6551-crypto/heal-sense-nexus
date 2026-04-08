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
    if (val > 70) return { level: 'Critical', color: 'pink', value: val };
    if (val > 40) return { level: 'Moderate', color: 'amber', value: val };
    return { level: 'Low', color: 'teal', value: val };
  }, [patient, dataset]);

  if (!isOpen || !patient) return null;

  const idCol = dataset.columns[0];
  const patientId = String(patient[idCol] ?? 'Unknown');

  const riskColors: Record<string, string> = {
    pink: 'bg-pink-100 text-pink-700 border-pink-200 shadow-sm',
    amber: 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm',
    teal: 'bg-teal-100 text-teal-700 border-teal-200 shadow-sm',
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-xl bg-white/95 backdrop-blur-xl shadow-2xl border-l border-slate-200 overflow-y-auto animate-slide-in-right custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-5 z-10 border-b border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-widest text-slate-800 uppercase">Node Profile {patientId}</h2>
                <p className="text-slate-500 text-[10px] font-mono font-medium mt-0.5">Isolated Telemetry View</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleFlag}
                className={`p-2 rounded-xl border transition-all ${flagged ? 'bg-pink-100 text-pink-600 border-pink-200 shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200 hover:border-slate-300'}`}
                title={flagged ? 'Unflag' : 'Flag for review'}
              >
                {flagged ? <Flag className="h-4 w-4" /> : <FlagOff className="h-4 w-4" />}
              </button>
              <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-sm">
                <X className="h-4 w-4 text-slate-500 hover:text-slate-800" />
              </button>
            </div>
          </div>

          {/* Risk Badge */}
          {riskLevel && (
            <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${riskColors[riskLevel.color]}`}>
              <ShieldAlert className="h-3 w-3" />
              {riskLevel.level} Status — {riskLevel.value}% Confidence
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Patient Details Grid */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 tracking-widest uppercase mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Telemetry Data Stream
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dataset.columns.map(col => {
                const val = patient[col];
                if (val === undefined || val === null) return null;
                const isNum = dataset.numericColumns.includes(col);
                return (
                  <div key={col} className="bg-white hover:bg-slate-50 rounded-lg p-3 border border-slate-200 transition-colors shadow-sm">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider truncate mb-1">
                      {col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}
                    </p>
                    <p className={`text-xs font-mono font-bold truncate ${isNum ? 'text-blue-700' : 'text-slate-700'}`}>
                      {isNum && typeof val === 'number' ? (Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2)) : String(val)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 tracking-widest uppercase mb-3 flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-amber-500" />
              Operator Annotations
            </h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add secured operator notes..."
              className="w-full h-28 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 placeholder-slate-400 font-mono shadow-inner transition-all"
            />
            <button
              onClick={saveNotes}
              className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-blue-600 border border-blue-700 text-white text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Save className="h-3.5 w-3.5" />
              Sync Data
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </>
  );
}
