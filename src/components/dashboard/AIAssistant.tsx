import { useState } from "react";
import { Bot, Send } from "lucide-react";
import type { DatasetInfo } from "@/lib/parseData";

const AIAssistant = ({ dataset }: { dataset: DatasetInfo }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);

  const handleAsk = () => {
    if (!question.trim()) return;

    const q = question.trim();
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");

    // Simple local analytics-based answers
    const { data, numericColumns, categoricalColumns } = dataset;
    let answer = "";

    const qLower = q.toLowerCase();
    if (qLower.includes("how many") || qLower.includes("count") || qLower.includes("total rows")) {
      answer = `The dataset contains ${data.length} records with ${numericColumns.length} numeric and ${categoricalColumns.length} categorical columns.`;
    } else if (qLower.includes("average") || qLower.includes("mean")) {
      if (numericColumns.length > 0) {
        const summaries = numericColumns.slice(0, 5).map((col) => {
          const avg = (data.reduce((s, r) => s + (Number(r[col]) || 0), 0) / data.length).toFixed(2);
          return `${col}: ${avg}`;
        });
        answer = `Averages:\n${summaries.join("\n")}`;
      } else {
        answer = "No numeric columns found in the dataset.";
      }
    } else if (qLower.includes("column") || qLower.includes("field")) {
      answer = `Columns: ${[...numericColumns, ...categoricalColumns].join(", ")}`;
    } else if (qLower.includes("max") || qLower.includes("highest")) {
      if (numericColumns.length > 0) {
        const col = numericColumns[0];
        const max = Math.max(...data.map((r) => Number(r[col]) || 0));
        answer = `Maximum value for "${col}": ${max}`;
      } else {
        answer = "No numeric columns available.";
      }
    } else if (qLower.includes("min") || qLower.includes("lowest")) {
      if (numericColumns.length > 0) {
        const col = numericColumns[0];
        const min = Math.min(...data.map((r) => Number(r[col]) || 0));
        answer = `Minimum value for "${col}": ${min}`;
      } else {
        answer = "No numeric columns available.";
      }
    } else {
      answer = `Dataset summary: ${data.length} records, ${numericColumns.length} numeric columns (${numericColumns.slice(0, 3).join(", ")}${numericColumns.length > 3 ? "..." : ""}), ${categoricalColumns.length} categorical columns. Try asking about averages, counts, columns, max, or min values.`;
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: answer }]);
    }, 400);
  };

  return (
    <div className="card-healthcare rounded-xl p-6 animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg healthcare-gradient">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">AI Healthcare Assistant</h3>
          <p className="text-xs text-muted-foreground">Ask questions about your dataset</p>
        </div>
      </div>

      <div className="mb-4 max-h-64 overflow-y-auto space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            Try: "How many records?", "What's the average?", "Show columns"
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground ml-8"
                : "bg-secondary text-secondary-foreground mr-8"
            }`}
          >
            <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ask about your dataset..."
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={handleAsk}
          className="healthcare-gradient flex items-center justify-center rounded-lg px-4 text-primary-foreground transition-transform hover:scale-105 active:scale-95"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
