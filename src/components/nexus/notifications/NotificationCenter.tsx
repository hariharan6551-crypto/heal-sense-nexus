// ============================================================================
// NotificationCenter — Real-time Alerts with Priority Tagging
// ADD-ON MODULE: Toast + Panel view
// ============================================================================
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNexusStore } from '@/stores/nexusStore';
import { Bell, X, Check, AlertTriangle, Info, AlertOctagon, Trash2 } from 'lucide-react';

const priorityConfig = {
  info: { icon: Info, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', dot: 'bg-cyan-400' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', dot: 'bg-amber-400' },
  critical: { icon: AlertOctagon, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', dot: 'bg-rose-400' },
};

export default function NotificationCenter() {
  const {
    notifications, addNotification, markRead, clearNotifications,
    notificationPanelOpen, toggleNotificationPanel,
  } = useNexusStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Generate mock notifications on mount
  useEffect(() => {
    const mockNotifs = [
      { title: 'Analysis Complete', message: 'AI prediction model finished processing 1,247 records.', priority: 'info' as const },
      { title: 'Anomaly Alert', message: 'Unusual spike detected in column "revenue" — 3.2σ deviation.', priority: 'warning' as const },
      { title: 'System Health', message: 'All dashboard services operating at peak performance.', priority: 'info' as const },
    ];
    const timer = setTimeout(() => {
      if (notifications.length === 0) {
        mockNotifs.forEach((n, i) => setTimeout(() => addNotification(n), i * 2000));
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Bell Button */}
      <button onClick={toggleNotificationPanel} className="nexus-icon-btn relative" title="Notifications">
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center border-2 border-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {notificationPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleNotificationPanel}
              className="fixed inset-0 z-[58] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-16 right-4 z-[59] w-[380px] max-h-[500px] rounded-2xl nexus-panel-glass overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={clearNotifications} className="nexus-icon-btn" title="Clear all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={toggleNotificationPanel} className="nexus-icon-btn">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-xs text-slate-500">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((notif, i) => {
                      const cfg = priorityConfig[notif.priority];
                      const Icon = cfg.icon;
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => markRead(notif.id)}
                          className={`px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors ${
                            notif.read ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`w-8 h-8 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-4 h-4 ${cfg.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                                {!notif.read && <span className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0`} />}
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed">{notif.message}</p>
                              <p className="text-[9px] text-slate-600 mt-1">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
