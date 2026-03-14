import { useState, useMemo } from "react";
import { Bot, Send } from "lucide-react";
import type { DatasetInfo } from "@/lib/parseData";
import type { DataAnalysis } from "@/lib/analyzeData";

interface AIAssistantProps {
  dataset: DatasetInfo;
  analysis: DataAnalysis;
}

const AIAssistant = ({ dataset, analysis }: AIAssistantProps) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);

  const handleAsk = () => {
    if (!question.trim()) return;

    const q = question.trim();
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setQuestion("");

    const { data, numericColumns, categoricalColumns, datetimeColumns, columnMeta } = dataset;
    const { columnStats, strongCorrelations } = analysis;
    let answer = "";
    const qLower = q.toLowerCase();

    if (qLower.includes("how many") || qLower.includes("count") || qLower.includes("total rows") || qLower.includes("size")) {
      answer = `📊 The dataset contains **${data.length.toLocaleString()} records** across **${dataset.totalColumns} columns** (${numericColumns.length} numeric, ${categoricalColumns.length} categorical${datetimeColumns.length > 0 ? `, ${datetimeColumns.length} datetime` : ""}).`;

    } else if (qLower.includes("average") || qLower.includes("mean")) {
      if (numericColumns.length > 0) {
        const lines = columnStats.slice(0, 8).map(s => `• ${s.column}: ${s.mean.toLocaleString()}`);
        answer = `📈 **Mean values:**\n${lines.join("\n")}`;
      } else {
        answer = "No numeric columns found in the dataset.";
      }

    } else if (qLower.includes("median")) {
      if (columnStats.length > 0) {
        const lines = columnStats.slice(0, 8).map(s => `• ${s.column}: ${s.median.toLocaleString()}`);
        answer = `📈 **Median values:**\n${lines.join("\n")}`;
      } else {
        answer = "No numeric columns available.";
      }

    } else if (qLower.includes("std") || qLower.includes("standard deviation") || qLower.includes("deviation")) {
      if (columnStats.length > 0) {
        const lines = columnStats.slice(0, 8).map(s => `• ${s.column}: ${s.stdDev.toLocaleString()}`);
        answer = `📊 **Standard deviations:**\n${lines.join("\n")}`;
      } else {
        answer = "No numeric columns available.";
      }

    } else if (qLower.includes("column") || qLower.includes("field") || qLower.includes("schema")) {
      const lines = columnMeta.map(m => `• **${m.name}** (${m.type}) — ${m.nonNullCount} values, ${m.uniqueCount} unique`);
      answer = `📋 **Columns:**\n${lines.join("\n")}`;

    } else if (qLower.includes("max") || qLower.includes("highest") || qLower.includes("largest")) {
      if (columnStats.length > 0) {
        const lines = columnStats.slice(0, 5).map(s => `• ${s.column}: ${s.max.toLocaleString()}`);
        answer = `🔝 **Maximum values:**\n${lines.join("\n")}`;
      } else {
        answer = "No numeric columns available.";
      }

    } else if (qLower.includes("min") || qLower.includes("lowest") || qLower.includes("smallest")) {
      if (columnStats.length > 0) {
        const lines = columnStats.slice(0, 5).map(s => `• ${s.column}: ${s.min.toLocaleString()}`);
        answer = `📉 **Minimum values:**\n${lines.join("\n")}`;
      } else {
        answer = "No numeric columns available.";
      }

    } else if (qLower.includes("correlation") || qLower.includes("correlat") || qLower.includes("relationship")) {
      if (strongCorrelations.length > 0) {
        const lines = strongCorrelations.slice(0, 5).map(c =>
          `• ${c.col1} ↔ ${c.col2}: **r = ${c.value.toFixed(3)}** (${c.value > 0 ? "positive" : "negative"})`
        );
        answer = `🔗 **Strong correlations:**\n${lines.join("\n")}`;
      } else {
        answer = "No strong correlations (|r| > 0.5) found between numeric columns.";
      }

    } else if (qLower.includes("outlier") || qLower.includes("anomal")) {
      const outlierCols = columnStats.filter(s => s.outlierCount > 0);
      if (outlierCols.length > 0) {
        const lines = outlierCols.slice(0, 5).map(s => `• ${s.column}: **${s.outlierCount} outliers** (range: ${s.min}–${s.max})`);
        answer = `⚠️ **Outliers detected:**\n${lines.join("\n")}`;
      } else {
        answer = "No significant outliers detected via IQR method.";
      }

    } else if (qLower.includes("missing") || qLower.includes("null") || qLower.includes("empty")) {
      const missing = columnMeta.filter(m => m.missingCount > 0);
      if (missing.length > 0) {
        const lines = missing.map(m => `• ${m.name}: ${m.missingCount} missing (${((m.missingCount / dataset.totalRows) * 100).toFixed(1)}%)`);
        answer = `🔍 **Missing values:**\n${lines.join("\n")}\n\nTotal: ${dataset.missingValueCount.toLocaleString()} missing values.`;
      } else {
        answer = "✅ No missing values found — dataset is complete!";
      }

    } else if (qLower.includes("duplicate")) {
      answer = dataset.duplicateRowCount > 0
        ? `📋 **${dataset.duplicateRowCount.toLocaleString()} duplicate rows** found (${((dataset.duplicateRowCount / dataset.totalRows) * 100).toFixed(1)}% of dataset).`
        : "✅ No duplicate rows detected.";

    } else if (qLower.includes("summary") || qLower.includes("overview") || qLower.includes("describe")) {
      const lines = [
        `📊 **Dataset:** ${dataset.fileName}`,
        `📏 **Size:** ${data.length.toLocaleString()} rows × ${dataset.totalColumns} columns`,
        `🔢 **Numeric:** ${numericColumns.join(", ") || "none"}`,
        `🏷️ **Categorical:** ${categoricalColumns.join(", ") || "none"}`,
        `📅 **Datetime:** ${datetimeColumns.join(", ") || "none"}`,
        `⚠️ **Missing:** ${dataset.missingValueCount.toLocaleString()} values`,
        `📋 **Duplicates:** ${dataset.duplicateRowCount}`,
      ];
      answer = lines.join("\n");

    } else {
      answer = `I can help you explore your dataset! Try asking about:\n• **summary** — full overview\n• **columns** — schema and types\n• **average / median / std** — statistics\n• **max / min** — extreme values\n• **correlations** — relationships\n• **outliers** — anomalies\n• **missing values / duplicates** — data quality`;
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", text: answer }]);
    }, 300);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-fade-up">
      <div className="px-5 py-3.5 border-b border-border flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI Data Assistant</h3>
          <p className="text-xs text-muted-foreground">Ask questions about your dataset</p>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4 max-h-72 overflow-y-auto space-y-2.5 scrollbar-thin">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-6 text-center">
              Try: "Give me a summary", "Show correlations", "Any outliers?"
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-xl px-3.5 py-2.5 text-sm animate-fade-up ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-12"
                  : "bg-muted text-foreground mr-4"
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans leading-relaxed">{msg.text}</pre>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAsk()}
            placeholder="Ask about your dataset..."
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleAsk}
            className="bg-gradient-to-r from-primary to-accent flex items-center justify-center rounded-xl px-4 text-white transition-transform hover:scale-105 active:scale-95 shadow-md shadow-primary/20"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
