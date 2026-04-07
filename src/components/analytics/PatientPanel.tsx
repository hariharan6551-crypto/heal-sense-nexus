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
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.3)]',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.3)]',
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-xl bg-slate-900/90 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-l border-white/10 overflow-y-auto animate-slide-in-right custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-black/40 backdrop-blur-md text-white px-6 py-5 z-10 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/50 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_5px_currentColor]" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-widest text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] uppercase">Node Profile {patientId}</h2>
                <p className="text-cyan-300/70 text-[10px] font-mono mt-0.5">Isolated Telemetry View</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleFlag}
                className={`p-2 rounded-xl border transition-all ${flagged ? 'bg-pink-500/20 text-pink-400 border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10 hover:border-white/20'}`}
                title={flagged ? 'Unflag' : 'Flag for review'}
              >
                {flagged ? <Flag className="h-4 w-4 drop-shadow-[0_0_5px_currentColor]" /> : <FlagOff className="h-4 w-4" />}
              </button>
              <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all">
                <X className="h-4 w-4 text-slate-400 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Risk Badge */}
          {riskLevel && (
            <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${riskColors[riskLevel.color]}`}>
              <ShieldAlert className="h-3 w-3 drop-shadow-[0_0_5px_currentColor]" />
              {riskLevel.level} Status — {riskLevel.value}% Confidence
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Patient Details Grid */}
          <div className="bg-black/40 rounded-xl p-5 border border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_5px_currentColor]" />
              Telemetry Data Stream
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dataset.columns.map(col => {
                const val = patient[col];
                if (val === undefined || val === null) return null;
                const isNum = dataset.numericColumns.includes(col);
                return (
                  <div key={col} className="bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-white/5 transition-colors">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider truncate mb-1">
                      {col.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim()}
                    </p>
                    <p className={`text-xs font-mono font-bold truncate ${isNum ? 'text-blue-300 drop-shadow-[0_0_3px_rgba(147,197,253,0.5)]' : 'text-slate-200'}`}>
                      {isNum && typeof val === 'number' ? (Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2)) : String(val)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-5 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase mb-3 flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-amber-400 drop-shadow-[0_0_5px_currentColor]" />
              Operator Annotations
            </h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add secured operator notes..."
              className="w-full h-28 text-xs text-blue-100 bg-black/50 border border-white/10 rounded-lg p-3 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50 placeholder-slate-500 font-mono shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] transition-all"
            />
            <button
              onClick={saveNotes}
              className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-300 text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-blue-500/40 transition-colors shadow-[0_0_10px_rgba(59,130,246,0.2)]"
            >
              <Save className="h-3.5 w-3.5 drop-shadow-[0_0_5px_currentColor]" />
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
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
}
