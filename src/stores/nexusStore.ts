// ============================================================================
// NEXUS STORE — Zustand Global State for Ultra-Premium Enhancement Layer
// NON-DESTRUCTIVE: Does NOT touch any existing state management
// ============================================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Theme System ---
export type NexusTheme = 'dark' | 'neon' | 'light';

// --- Notification System ---
export interface NexusNotification {
  id: string;
  title: string;
  message: string;
  priority: 'info' | 'warning' | 'critical';
  timestamp: number;
  read: boolean;
  icon?: string;
}

// --- Widget Layout ---
export interface WidgetPosition {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
}

// --- AI Copilot ---
export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// --- What-If Scenario ---
export interface WhatIfScenario {
  paramName: string;
  originalValue: number;
  adjustedValue: number;
  impactPercentage: number;
}

interface NexusState {
  // Theme
  theme: NexusTheme;
  setTheme: (theme: NexusTheme) => void;

  // Command Center Mode
  commandCenterMode: boolean;
  toggleCommandCenter: () => void;

  // Particle System
  particlesEnabled: boolean;
  toggleParticles: () => void;

  // Notifications
  notifications: NexusNotification[];
  addNotification: (n: Omit<NexusNotification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  clearNotifications: () => void;
  notificationPanelOpen: boolean;
  toggleNotificationPanel: () => void;

  // AI Copilot
  copilotOpen: boolean;
  toggleCopilot: () => void;
  copilotMessages: CopilotMessage[];
  addCopilotMessage: (msg: Omit<CopilotMessage, 'id' | 'timestamp'>) => void;
  clearCopilot: () => void;

  // AI Panels
  predictionPanelOpen: boolean;
  togglePredictionPanel: () => void;
  insightsPanelOpen: boolean;
  toggleInsightsPanel: () => void;
  whatIfPanelOpen: boolean;
  toggleWhatIfPanel: () => void;

  // Enterprise Panels
  rbacPanelOpen: boolean;
  toggleRBACPanel: () => void;
  auditPanelOpen: boolean;
  toggleAuditPanel: () => void;
  apiPanelOpen: boolean;
  toggleAPIPanel: () => void;

  // Data Panels
  filterBuilderOpen: boolean;
  toggleFilterBuilder: () => void;
  drillDownOpen: boolean;
  toggleDrillDown: () => void;

  // Boot Screen
  bootComplete: boolean;
  setBootComplete: (v: boolean) => void;

  // Widget Layout
  widgetLayout: WidgetPosition[];
  updateWidgetPosition: (id: string, pos: Partial<WidgetPosition>) => void;
  resetLayout: () => void;

  // What-If Engine
  whatIfScenarios: WhatIfScenario[];
  setWhatIfScenarios: (scenarios: WhatIfScenario[]) => void;
}

const DEFAULT_WIDGETS: WidgetPosition[] = [
  { id: 'kpi-row', x: 0, y: 0, w: 12, h: 2, visible: true },
  { id: 'charts', x: 0, y: 2, w: 9, h: 6, visible: true },
  { id: 'ai-panel', x: 9, y: 2, w: 3, h: 6, visible: true },
  { id: 'table', x: 0, y: 8, w: 12, h: 4, visible: true },
];

export const useNexusStore = create<NexusState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),

      // Command Center
      commandCenterMode: false,
      toggleCommandCenter: () => set((s) => ({ commandCenterMode: !s.commandCenterMode })),

      // Particles
      particlesEnabled: true,
      toggleParticles: () => set((s) => ({ particlesEnabled: !s.particlesEnabled })),

      // Notifications
      notifications: [],
      addNotification: (n) =>
        set((s) => ({
          notifications: [
            {
              ...n,
              id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: Date.now(),
              read: false,
            },
            ...s.notifications,
          ].slice(0, 50),
        })),
      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      clearNotifications: () => set({ notifications: [] }),
      notificationPanelOpen: false,
      toggleNotificationPanel: () =>
        set((s) => ({ notificationPanelOpen: !s.notificationPanelOpen })),

      // Copilot
      copilotOpen: false,
      toggleCopilot: () => set((s) => ({ copilotOpen: !s.copilotOpen })),
      copilotMessages: [],
      addCopilotMessage: (msg) =>
        set((s) => ({
          copilotMessages: [
            ...s.copilotMessages,
            {
              ...msg,
              id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              timestamp: Date.now(),
            },
          ],
        })),
      clearCopilot: () => set({ copilotMessages: [] }),

      // AI Panels
      predictionPanelOpen: false,
      togglePredictionPanel: () => set((s) => ({ predictionPanelOpen: !s.predictionPanelOpen })),
      insightsPanelOpen: false,
      toggleInsightsPanel: () => set((s) => ({ insightsPanelOpen: !s.insightsPanelOpen })),
      whatIfPanelOpen: false,
      toggleWhatIfPanel: () => set((s) => ({ whatIfPanelOpen: !s.whatIfPanelOpen })),

      // Enterprise Panels
      rbacPanelOpen: false,
      toggleRBACPanel: () => set((s) => ({ rbacPanelOpen: !s.rbacPanelOpen })),
      auditPanelOpen: false,
      toggleAuditPanel: () => set((s) => ({ auditPanelOpen: !s.auditPanelOpen })),
      apiPanelOpen: false,
      toggleAPIPanel: () => set((s) => ({ apiPanelOpen: !s.apiPanelOpen })),

      // Data Panels
      filterBuilderOpen: false,
      toggleFilterBuilder: () => set((s) => ({ filterBuilderOpen: !s.filterBuilderOpen })),
      drillDownOpen: false,
      toggleDrillDown: () => set((s) => ({ drillDownOpen: !s.drillDownOpen })),

      // Boot Screen
      bootComplete: false,
      setBootComplete: (v) => set({ bootComplete: v }),

      // Widget Layout
      widgetLayout: DEFAULT_WIDGETS,
      updateWidgetPosition: (id, pos) =>
        set((s) => ({
          widgetLayout: s.widgetLayout.map((w) =>
            w.id === id ? { ...w, ...pos } : w
          ),
        })),
      resetLayout: () => set({ widgetLayout: DEFAULT_WIDGETS }),

      // What-If
      whatIfScenarios: [],
      setWhatIfScenarios: (scenarios) => set({ whatIfScenarios: scenarios }),
    }),
    {
      name: 'nexus-ultra-store',
      partialize: (state) => ({
        particlesEnabled: state.particlesEnabled,
        widgetLayout: state.widgetLayout,
      }),
    }
  )
);
