// ============================================================================
// DrillDownPanel — Global → Local → Granular Data Exploration
// DATA ADD-ON MODULE: Non-destructive overlay with breadcrumb navigation
// ============================================================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedStore } from '@/stores/advancedStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import {
  Crosshair, X, ChevronRight, ArrowLeft, Search,
  TrendingUp, TrendingDown, Minus, BarChart3, PieChart as PieIcon
} from 'lucide-react';

interface DrillLevel {
  label: string;
  data: { name: string; value: number; change?: number }[];
  chartType: 'bar' | 'pie';
}

// Mock hierarchical data
const DRILL_HIERARCHY: DrillLevel[] = [
  {
    label: 'Region Overview',
    chartType: 'bar',
    data: [
      { name: 'North', value: 3420, change: 5.2 },
      { name: 'South', value: 2890, change: -2.1 },
      { name: 'East', value: 4150, change: 8.7 },
      { name: 'West', value: 3780, change: 3.4 },
      { name: 'Central', value: 2240, change: -0.8 },
    ],
  },
  {
    label: 'Department Breakdown',
    chartType: 'bar',
    data: [
      { name: 'Cardiology', value: 845, change: 12.3 },
      { name: 'Neurology', value: 623, change: -4.5 },
      { name: 'Orthopedics', value: 912, change: 6.8 },
      { name: 'Pediatrics', value: 456, change: 2.1 },
      { name: 'Oncology', value: 734, change: -1.2 },
      { name: 'Emergency', value: 580, change: 15.9 },
    ],
  },
  {
    label: 'Individual Records',
    chartType: 'pie',
    data: [
      { name: 'Critical', value: 89, change: -3.2 },
      { name: 'Severe', value: 234, change: 7.8 },
      { name: 'Moderate', value: 412, change: 1.5 },
      { name: 'Mild', value: 178, change: -0.9 },
      { name: 'Recovered', value: 342, change: 22.1 },
    ],
  },
];

const CHART_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'];

export default function DrillDownPanel() {
  const { drillDownOpen, toggleDrillDown } = useAdvancedStore();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['Global']);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const level = DRILL_HIERARCHY[currentLevel];
  const canDrillDown = currentLevel < DRILL_HIERARCHY.length - 1;

  const handleDrillDown = (itemName: string) => {
    if (!canDrillDown) return;
    setSelectedItem(itemName);
    setBreadcrumbs(prev => [...prev, itemName]);
    setCurrentLevel(prev => prev + 1);
  };

  const handleGoBack = () => {
    if (currentLevel === 0) return;
    setCurrentLevel(prev => prev - 1);
    setBreadcrumbs(prev => prev.slice(0, -1));
    setSelectedItem(null);
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentLevel(index);
    setBreadcrumbs(prev => prev.slice(0, index + 1));
    setSelectedItem(null);
  };

  const totalValue = level.data.reduce((s, d) => s + d.value, 0);

  return (
    <AnimatePresence>
      {drillDownOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-0 top-0 bottom-0 w-[460px] z-[60] advanced-panel-glass overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <Crosshair className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Drill-Down</h2>
                  <p className="text-xs text-slate-400">Hierarchical data explorer</p>
                </div>
              </div>
              <button onClick={toggleDrillDown} className="advanced-close-btn">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1 mb-5 flex-wrap">
              {currentLevel > 0 && (
                <button
                  onClick={handleGoBack}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all mr-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="w-3 h-3 text-slate-600" />}
                  <button
                    onClick={() => handleBreadcrumbClick(i)}
                    className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-all ${
                      i === breadcrumbs.length - 1
                        ? 'text-teal-400 bg-teal-400/10 border border-teal-400/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {crumb}
                  </button>
                </span>
              ))}
            </div>

            {/* Level indicator */}
            <div className="flex gap-1 mb-5">
              {DRILL_HIERARCHY.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    i <= currentLevel ? 'bg-teal-500' : 'bg-white/5'
                  }`}
                />
              ))}
            </div>

            {/* Current Level Title */}
            <motion.div
              key={currentLevel}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-white">{level.label}</h3>
                <span className="text-[10px] text-slate-500">
                  Level {currentLevel + 1} of {DRILL_HIERARCHY.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Total: <span className="text-white font-bold">{totalValue.toLocaleString()}</span> records
                {canDrillDown && ' · Click a bar to drill deeper'}
              </p>
            </motion.div>

            {/* Chart */}
            <motion.div
              key={`chart-${currentLevel}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="advanced-metric-card mb-4"
            >
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  {level.chartType === 'bar' ? (
                    <BarChart data={level.data} layout="vertical">
                      <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={75} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '12px',
                          color: '#e2e8f0',
                          fontSize: '11px',
                        }}
                      />
                      <Bar
                        dataKey="value"
                        radius={[0, 8, 8, 0]}
                        cursor={canDrillDown ? 'pointer' : 'default'}
                        onClick={(data) => canDrillDown && handleDrillDown(data.name)}
                      >
                        {level.data.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} fillOpacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={level.data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {level.data.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '12px',
                          color: '#e2e8f0',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Data Table */}
            <div className="space-y-1.5">
              {level.data.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => canDrillDown && handleDrillDown(item.name)}
                  className={`advanced-metric-card flex items-center gap-3 ${canDrillDown ? 'cursor-pointer hover:!bg-white/[0.06]' : ''}`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-white">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">{item.value.toLocaleString()}</span>
                    {item.change !== undefined && (
                      <div className={`flex items-center gap-0.5 justify-end text-[10px] font-semibold ${
                        item.change > 0 ? 'text-emerald-400' : item.change < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        {item.change > 0 ? <TrendingUp className="w-3 h-3" /> : item.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </div>
                    )}
                  </div>
                  {canDrillDown && <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
