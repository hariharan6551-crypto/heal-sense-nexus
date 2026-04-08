// ============================================================================
// AdvancedFilterBuilder — Multi-condition Logic Filter System
// DATA ADD-ON MODULE: Non-destructive overlay panel
// ============================================================================
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedStore } from '@/stores/advancedStore';
import {
  Filter, X, Plus, Trash2, ChevronDown, Play, RotateCcw,
  Layers, GripVertical
} from 'lucide-react';

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic: 'AND' | 'OR';
}

const OPERATORS = [
  { value: 'equals', label: '= Equals' },
  { value: 'not_equals', label: '≠ Not Equals' },
  { value: 'contains', label: '∋ Contains' },
  { value: 'not_contains', label: '∌ Not Contains' },
  { value: 'greater_than', label: '> Greater Than' },
  { value: 'less_than', label: '< Less Than' },
  { value: 'between', label: '↔ Between' },
  { value: 'is_empty', label: '∅ Is Empty' },
  { value: 'is_not_empty', label: '≠∅ Is Not Empty' },
  { value: 'starts_with', label: 'A… Starts With' },
  { value: 'ends_with', label: '…Z Ends With' },
];

const logicColors = {
  AND: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  OR: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
};

export default function AdvancedFilterBuilder() {
  const { filterBuilderOpen, toggleFilterBuilder } = useAdvancedStore();

  const [conditions, setConditions] = useState<FilterCondition[]>([
    { id: 'f1', field: '', operator: 'equals', value: '', logic: 'AND' },
  ]);
  const [filterName, setFilterName] = useState('');

  // Mock columns from the dataset
  const columns = ['Patient ID', 'Age', 'Gender', 'Diagnosis', 'Recovery Score', 'Duration', 'Status', 'Region', 'Severity', 'Treatment'];

  const addCondition = useCallback(() => {
    setConditions(prev => [
      ...prev,
      {
        id: `f${Date.now()}`,
        field: '',
        operator: 'equals',
        value: '',
        logic: 'AND',
      },
    ]);
  }, []);

  const removeCondition = useCallback((id: string) => {
    setConditions(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateCondition = useCallback((id: string, updates: Partial<FilterCondition>) => {
    setConditions(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const resetAll = useCallback(() => {
    setConditions([{ id: 'f1', field: '', operator: 'equals', value: '', logic: 'AND' }]);
    setFilterName('');
  }, []);

  const activeCount = conditions.filter(c => c.field && c.value).length;

  // Saved filter presets
  const presets = [
    { name: 'High Risk Patients', conditions: 3 },
    { name: 'Recent Admissions', conditions: 2 },
    { name: 'Recovery > 80%', conditions: 1 },
  ];

  return (
    <AnimatePresence>
      {filterBuilderOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="fixed right-0 top-0 bottom-0 w-[460px] z-[60] bg-white/95 backdrop-blur-xl shadow-2xl border-l border-slate-200 overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Filter Builder</h2>
                  <p className="text-xs text-slate-400">
                    {activeCount > 0 ? `${activeCount} active condition${activeCount > 1 ? 's' : ''}` : 'Multi-condition filter engine'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={resetAll} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500" title="Reset">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={toggleFilterBuilder} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Saved Presets */}
            <div className="mb-5">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Quick Presets</p>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Layers className="w-3 h-3 text-blue-400" />
                    {preset.name}
                    <span className="text-[9px] text-slate-500">({preset.conditions})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Name */}
            <div className="mb-4">
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Name this filter (optional)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-300 transition-colors shadow-sm"
              />
            </div>

            {/* Conditions */}
            <div className="space-y-3 mb-5">
              {conditions.map((condition, i) => (
                <motion.div
                  key={condition.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm relative"
                >
                  {/* Logic connector */}
                  {i > 0 && (
                    <div className="flex justify-center mb-3 -mt-1">
                      <button
                        onClick={() => updateCondition(condition.id, { logic: condition.logic === 'AND' ? 'OR' : 'AND' })}
                        className={`text-[10px] font-bold px-3 py-1 rounded-md border cursor-pointer transition-all ${logicColors[condition.logic]}`}
                      >
                        {condition.logic}
                      </button>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      {/* Field selector */}
                      <select
                        value={condition.field}
                        onChange={(e) => updateCondition(condition.id, { field: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none cursor-pointer [&>option]:bg-white focus:border-indigo-300 transition-colors"
                      >
                        <option value="">Select field...</option>
                        {columns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>

                      {/* Operator + Value */}
                      <div className="flex gap-2">
                        <select
                          value={condition.operator}
                          onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
                          className="w-[45%] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none cursor-pointer [&>option]:bg-white focus:border-indigo-300 transition-colors"
                        >
                          {OPERATORS.map((op) => (
                            <option key={op.value} value={op.value}>{op.label}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={condition.value}
                          onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                          placeholder="Value..."
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-300 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Delete */}
                    {conditions.length > 1 && (
                      <button
                        onClick={() => removeCondition(condition.id)}
                        className="p-2 ml-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Add Condition */}
            <button
              onClick={addCondition}
              className="w-full mb-5 py-2.5 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Condition
            </button>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Apply Filter ({activeCount})
              </button>
              <button
                className="py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
              >
                Save
              </button>
            </div>

            {/* Filter Summary */}
            {activeCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm"
              >
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">Filter Preview</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {conditions.filter(c => c.field && c.value).map((c, i) => (
                    <span key={c.id}>
                      {i > 0 && <span className={c.logic === 'AND' ? 'text-cyan-400' : 'text-amber-400'}> {c.logic} </span>}
                      <span className="text-slate-800 font-bold">{c.field}</span>
                      {' '}<span className="text-slate-500">{c.operator.replace('_', ' ')}</span>{' '}
                      <span className="text-indigo-600 font-bold font-mono">"{c.value}"</span>
                    </span>
                  ))}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
