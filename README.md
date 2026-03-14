# AI-Powered Dynamic Healthcare & Data Analytics Dashboard

A premium, immersive analytics platform designed for hospitals and healthcare organizations. This dashboard automatically analyzes any uploaded dataset (CSV, Excel, JSON) and generates high-fidelity, interactive visualizations powered by AI.

## 🚀 Live Deployment
The project is deployed on Vercel and can be accessed here: **[Insert Vercel URL If Available]**

## ✨ Key Features

### 📊 Intelligent Visualization Engine
The system automatically recommends and renders the most suitable charts based on your data structure:
- **Donut Chart**: Featuring a circular layout with center labels showing total record counts.
- **Pie Chart**: Displays percentage breakdown with interactive slices and gradient fills.
- **Bar & Stacked Bar Charts**: For categorical vs numeric comparisons.
- **Time Series (Line/Area)**: Automatically detects date columns for trend analysis.
- **Advanced Charts**: Includes Funnel, Radar, Treemap, Scatter (Bubble), Histogram, Heatmap (Correlation), and Box Plots (Outlier Analysis).

### 🤖 Smart AI Assistant
- **Dataset-Aware Q&A**: Chat with an AI that understands your specific data statistics.
- **Auto-Generated Insights**: Get immediate alerts on correlations, category performance, and data quality.
- **Suggested Queries**: One-click questions to discover hidden patterns in your data.

### 📁 Universal Dataset Upload
- Supports **CSV**, **Excel (.xlsx, .xls)**, and **JSON** files.
- Automatically detects schema: Numeric, Categorical, Datetime, and Text columns.
- **Dynamic Branding**: The dashboard title automatically adapts to the name of your uploaded file (e.g., `sales_data.csv` -> "Sales Data Analytics Dashboard").

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Installation
```sh
# 1. Clone the repository
git clone https://github.com/hariharan6551-crypto/heal-sense-nexus.git

# 2. Install dependencies
npm install

# 3. Running locally
npm run dev
```

### Usage
1. Click the **"Upload Dataset"** button in the top navigation.
2. Select your data file (CSV, Excel, or JSON).
3. The dashboard will instantly re-render with your custom KPIs, charts, and analysis.
4. Navigate through tabs: **Dashboard** (Visuals), **Dataset** (Raw Data), **AI Assistant** (Deep Insights).

## 🌍 Deployment

### Vercel
The project is optimized for Vercel. Pushing to the `main` branch automatically triggers a new deployment.
```sh
# Trigger manual deployment
git add .
git commit -m "Your commit message"
git push origin main
```

## 🛠️ Technologies
- **Vite** & **React**
- **TypeScript**
- **Tailwind CSS** & **shadcn/ui**
- **Recharts** (Advanced Visualizations)
- **Lucide React** (Iconography)
- **TanStack Query** (State Management)
