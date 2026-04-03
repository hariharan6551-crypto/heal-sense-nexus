# NEXUS AI Operating System - System Architecture

This document answers the mandatory output requirement for System Architecture, mapping exactly how the non-destructive Nexus AI layer interfaces with the existing Heatlthcare Dashboard.

## 1. 📦 Folder Structure (Production Ready)
```text
src/
├── components/
│   ├── nexus/                      # Enhancement Layer (Black-Box wrapper)
│   │   ├── ai/                     # AI Modules
│   │   │   ├── AICopilot.tsx
│   │   │   ├── AIPredictionPanel.tsx
│   │   │   ├── SmartInsightsEngine.tsx
│   │   │   └── WhatIfSimulator.tsx
│   │   ├── cinematic/              # Motion & Visuals
│   │   │   └── BootScreen.tsx
│   │   ├── controls/               # Toolbar & Customization
│   │   │   ├── NexusCommandBar.tsx
│   │   │   └── ThemeSwitcher.tsx
│   │   ├── data/                   # Analytics Add-ons
│   │   │   ├── AdvancedFilterBuilder.tsx
│   │   │   └── DrillDownPanel.tsx
│   │   ├── enterprise/             # Security & Ops
│   │   │   ├── AuditLogPanel.tsx
│   │   │   ├── APIIntegrationPanel.tsx
│   │   │   └── RBACPanel.tsx
│   │   ├── notifications/
│   │   │   └── NotificationCenter.tsx
│   │   ├── wrappers/               # The "Non-Destructive" rendering wrappers
│   │   │   ├── GlassCard.tsx
│   │   │   ├── NeonBorder.tsx
│   │   │   └── UltraContainer.tsx
│   │   ├── nexus.css               # Centralized light-mode premium stylings
│   │   └── NexusEnhancedDashboard.tsx # Root Integrator
├── stores/
│   └── nexusStore.ts               # Zustand State Engine (Global)
```

## 2. 🧩 Component Architecture (Modular)
The architecture splits presentation, state, and the black-box original application:
- **`UltraContainer`**: Injects absolute ambient lighting, CSS particles, and global variables via DOM nodes.
- **`NexusEnhancedDashboard`**: The bridge. Acts as a Higher-Order Component.
- **Floating Panels (`fixed z-50`)**: Modules like `AIPredictionPanel` exist above the dashboard layer, rendering their own data contexts without demanding props passing.

## 3. 🔌 Integration Strategy (Black-Box Wrapper)
The original `<HealthcareDashboard />` has `ZERO` prop modifications.

```tsx
// Integration Method
<UltraContainer>
   {/* Original App wrapped cleanly */}
   <HealthcareDashboard /> 

   {/* Nexus Enhancements injected via Zustand triggers */}
   <NexusCommandBar />
   <AnimatePresence>
      {predictionPanelOpen && <AIPredictionPanel />}
   </AnimatePresence>
</UltraContainer>
```

## 4. ⚙️ State Management (Zustand)
Using Zustand (`nexusStore.ts`) ensures the enhancement layer does not clash with the base app's Redux/Context (if any exists).
Features:
- `persist` middleware caches:
  - Particle enablement.
  - Widget layouts (x, y, w, h grid map).
- Memory-isolated triggers for: Notifications, Chat History, Panel visibility.

## 5. 📡 Data Flow Diagram (UI → API → AI Engine)

```mermaid
graph TD
    UI[Nexus UI: Command Bar] -->|Action Trigger| ZUS[Zustand Store]
    ZUS -->|State Update| Overlay[Nexus Motion Overlays]
    
    Overlay -->|Generate Query| Copilot[AI Copilot Engine]
    Overlay -->|Parameter Change| Simulator[What-If Simulation]
    
    Copilot -->|Async API Logic| AI_API{Mocked ML API / local eval}
    Simulator -->|Recalculate| AI_API
    
    AI_API -->|Real-Time WebSockets Payload| ZUS
    ZUS -->|Re-Render| Overlay
    
    subgraph "Legacy Black Box"
    BaseApp[HealthcareDashboard.tsx]
    BaseData[Post-Discharge Base Data context]
    BaseApp --- BaseData
    end

    %% The overlay reads state parallel to the base app without mutating it
    Overlay -.-|> BaseData 
```

## 6. 🚀 Performance Optimization Plan
1. **GPU Offloading:** `transform: translateZ(0)` and `will-change` apply to all `.nexus-panel-glass` objects to force the compositor to handle blurs off the main thread.
2. **Animation Debouncing:** Particle generation runs on `requestAnimationFrame` bound directly to the Canvas Context, circumventing React's render lifecycle entirely. 
3. **Mount Deferral:** `Framer Motion`'s `<AnimatePresence>` ensures heavy AI overlays (like the Prediction array and What-If simulator) are fully unmounted from the DOM when toggled off via the Command Bar, saving RAM.
