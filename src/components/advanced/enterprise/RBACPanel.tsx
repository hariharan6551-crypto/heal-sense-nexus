// ============================================================================
// RBACPanel — Role-Based Access Control UI
// ENTERPRISE ADD-ON MODULE: Non-destructive overlay panel
// ============================================================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedStore } from '@/stores/advancedStore';
import {
  Shield, X, Users, UserPlus, Lock, Unlock, Eye, Edit3,
  Trash2, ChevronRight, CheckCircle2, AlertTriangle
} from 'lucide-react';

interface RBACUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer' | 'editor';
  status: 'active' | 'inactive' | 'suspended';
  lastActive: string;
  avatar: string;
}

interface Permission {
  id: string;
  name: string;
  admin: boolean;
  analyst: boolean;
  editor: boolean;
  viewer: boolean;
}

const MOCK_USERS: RBACUser[] = [
  { id: '1', name: 'Dr. Sarah Chen', email: 'sarah.chen@advanced.ai', role: 'admin', status: 'active', lastActive: '2 min ago', avatar: 'SC' },
  { id: '2', name: 'James Wilson', email: 'j.wilson@advanced.ai', role: 'analyst', status: 'active', lastActive: '15 min ago', avatar: 'JW' },
  { id: '3', name: 'Emily Rodriguez', email: 'e.rodriguez@advanced.ai', role: 'editor', status: 'active', lastActive: '1 hour ago', avatar: 'ER' },
  { id: '4', name: 'Michael Park', email: 'm.park@advanced.ai', role: 'viewer', status: 'inactive', lastActive: '3 days ago', avatar: 'MP' },
  { id: '5', name: 'Lisa Thompson', email: 'l.thompson@advanced.ai', role: 'analyst', status: 'suspended', lastActive: '1 week ago', avatar: 'LT' },
];

const PERMISSIONS: Permission[] = [
  { id: 'p1', name: 'View Dashboard', admin: true, analyst: true, editor: true, viewer: true },
  { id: 'p2', name: 'Upload Datasets', admin: true, analyst: true, editor: true, viewer: false },
  { id: 'p3', name: 'Edit Charts', admin: true, analyst: true, editor: true, viewer: false },
  { id: 'p4', name: 'AI Predictions', admin: true, analyst: true, editor: false, viewer: false },
  { id: 'p5', name: 'Export Data', admin: true, analyst: true, editor: true, viewer: false },
  { id: 'p6', name: 'Manage Users', admin: true, analyst: false, editor: false, viewer: false },
  { id: 'p7', name: 'System Settings', admin: true, analyst: false, editor: false, viewer: false },
  { id: 'p8', name: 'Audit Logs', admin: true, analyst: true, editor: false, viewer: false },
];

const roleColors: Record<string, string> = {
  admin: 'from-rose-500 to-pink-600',
  analyst: 'from-cyan-500 to-blue-600',
  editor: 'from-amber-500 to-orange-600',
  viewer: 'from-slate-500 to-slate-600',
};

const roleBadgeColors: Record<string, string> = {
  admin: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  analyst: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  editor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  viewer: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-400',
  inactive: 'bg-slate-500',
  suspended: 'bg-rose-400',
};

export default function RBACPanel() {
  const { rbacPanelOpen, toggleRBACPanel } = useAdvancedStore();
  const [activeTab, setActiveTab] = useState<'users' | 'permissions'>('users');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {rbacPanelOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-0 top-0 bottom-0 w-[480px] z-[60] advanced-panel-glass overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Access Control</h2>
                  <p className="text-xs text-slate-400">Role-based permissions manager</p>
                </div>
              </div>
              <button onClick={toggleRBACPanel} className="advanced-close-btn">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-white/5 rounded-xl p-1 border border-white/5">
              {[
                { id: 'users' as const, label: 'Users', icon: Users },
                { id: 'permissions' as const, label: 'Permissions', icon: Lock },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'users' ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Total Users', value: MOCK_USERS.length, color: 'text-white' },
                    { label: 'Active', value: MOCK_USERS.filter(u => u.status === 'active').length, color: 'text-emerald-400' },
                    { label: 'Suspended', value: MOCK_USERS.filter(u => u.status === 'suspended').length, color: 'text-rose-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="advanced-metric-card text-center py-3">
                      <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Add User Button */}
                <button className="w-full mb-4 py-2.5 rounded-xl border border-dashed border-white/10 text-xs font-semibold text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                  <UserPlus className="w-3.5 h-3.5" />
                  Add New User
                </button>

                {/* User List */}
                <div className="space-y-2">
                  {MOCK_USERS.map((user, i) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                      className="advanced-metric-card cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColors[user.role]} flex items-center justify-center text-white text-xs font-bold`}>
                          {user.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate">{user.name}</span>
                            <span className={`w-2 h-2 rounded-full ${statusColors[user.status]}`} />
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleBadgeColors[user.role]}`}>
                              {user.role.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-500">{user.lastActive}</span>
                          </div>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform ${selectedUser === user.id ? 'rotate-90' : ''}`} />
                      </div>

                      <AnimatePresence>
                        {selectedUser === user.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-white/5">
                              <p className="text-[11px] text-slate-400 mb-2">{user.email}</p>
                              <div className="flex gap-2">
                                <button className="flex-1 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-1">
                                  <Edit3 className="w-3 h-3" /> Edit Role
                                </button>
                                <button className="flex-1 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-[10px] font-semibold border border-rose-500/20 hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-1">
                                  <Trash2 className="w-3 h-3" /> Remove
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              /* Permissions Matrix */
              <div className="advanced-metric-card overflow-hidden">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-4">Permission Matrix</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left py-2 text-slate-400 font-semibold">Permission</th>
                        {['Admin', 'Analyst', 'Editor', 'Viewer'].map((role) => (
                          <th key={role} className="text-center py-2 text-slate-400 font-semibold">{role}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PERMISSIONS.map((perm, i) => (
                        <motion.tr
                          key={perm.id}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-white/3 hover:bg-white/3 transition-colors"
                        >
                          <td className="py-2.5 text-slate-300 font-medium">{perm.name}</td>
                          {[perm.admin, perm.analyst, perm.editor, perm.viewer].map((allowed, j) => (
                            <td key={j} className="text-center py-2.5">
                              {allowed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-slate-600 mx-auto" />
                              )}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
