# Add Cards to Main Dashboard

## What you'll see

Above the existing charts on the **Dashboard** tab, a new "DASHBOARD PREVIEW" section will render — exactly matching reference Image 2:

- **Top row (4 metric cards)**: Total patients tracked · 30-day readmission rate · High-risk flagged · Social care referrals
- **Middle row**: Risk distribution (High/Medium/Low bars) + Recent high-risk patients list
- **Bottom row**: Top risk factors · 30-day readmissions by diagnosis · Social support gaps

The chart cards in Image 1 (Gender Distribution, Age Group, Length of stay) already render below via DynamicCharts — no change needed there.

## Technical changes

**Single file edit**: `src/components/analytics/AnalyticsDashboard.tsx`

1. Import `DashboardPreview` (component already exists at `src/components/dashboard/DashboardPreview.tsx`).
2. Inside the `activeTab === 'Dashboard'` block (around line 456), insert `<DashboardPreview />` **before** the existing `<DynamicCharts>`.
3. Pass `mlResult` (already computed) and `totalPatients={timeFilteredDataset.totalRows}`.
4. Guard with `{mlResult && ...}` so it only renders once the ML pipeline finishes (avoids skeleton flicker).

No new components, no styling changes, no dependencies. Reversible in one edit.

```text
Dashboard tab layout (after change):
┌─────────────────────────────────┐
│ Hero + Filters + DynamicKPIs    │  (unchanged)
├─────────────────────────────────┤
│ NEW: DashboardPreview cards     │  ← 4 metric cards + 5 panels
├─────────────────────────────────┤
│ DynamicCharts (Gender/Age/LOS)  │  (unchanged — matches Image 1)
└─────────────────────────────────┘
```