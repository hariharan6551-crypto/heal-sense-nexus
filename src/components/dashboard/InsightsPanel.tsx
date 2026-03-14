import { Lightbulb, TrendingUp, AlertTriangle, Link2, BarChart3, Award } from "lucide-react";
import type { Insight, InsightType } from "@/lib/insightEngine";

interface InsightsPanelProps {
  insights: Insight[];
}

const INSIGHT_CONFIG: Record<InsightType, { icon: typeof Lightbulb; gradient: string; bg: string }> = {
  trend: { icon: TrendingUp, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10" },
  correlation: { icon: Link2, gradient: "from-violet-500 to-purple-500", bg: "bg-violet-500/10" },
  anomaly: { icon: AlertTriangle, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-500/10" },
  quality: { icon: AlertTriangle, gradient: "from-rose-500 to-pink-500", bg: "bg-rose-500/10" },
  distribution: { icon: BarChart3, gradient: "from-teal-500 to-emerald-500", bg: "bg-teal-500/10" },
  top_performer: { icon: Award, gradient: "from-yellow-500 to-amber-500", bg: "bg-yellow-500/10" },
};

const SEVERITY_BORDER: Record<string, string> = {
  info: "border-l-blue-400",
  warning: "border-l-amber-400",
  critical: "border-l-rose-500",
};

const InsightsPanel = ({ insights }: InsightsPanelProps) => {
  if (insights.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-fade-up">
      <div className="px-5 py-3.5 border-b border-border flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
          <Lightbulb className="h-4 w-4 text-amber-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI-Generated Insights</h3>
          <p className="text-xs text-muted-foreground">{insights.length} insights discovered</p>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight, i) => {
          const config = INSIGHT_CONFIG[insight.type];
          const Icon = config.icon;
          return (
            <div
              key={insight.id}
              className={`rounded-lg border border-border border-l-4 ${SEVERITY_BORDER[insight.severity]} p-4 hover:bg-muted/30 transition-all duration-300 animate-fade-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InsightsPanel;
