import { Activity, Users, Globe, ShieldCheck, CalendarCheck } from "lucide-react";
import type { DatasetInfo } from "@/lib/parseData";

const KPICards = ({ dataset }: { dataset: DatasetInfo }) => {
  const { data, numericColumns } = dataset;

  const avgValue =
    numericColumns.length > 0
      ? +(
          numericColumns.reduce((sum, col) => {
            const colAvg = data.reduce((s, r) => s + (Number(r[col]) || 0), 0) / data.length;
            return sum + colAvg;
          }, 0) / numericColumns.length
        ).toFixed(2)
      : 0;

  const totalPopulation = numericColumns.reduce((sum, col) => {
    return sum + data.reduce((s, r) => s + (Number(r[col]) || 0), 0);
  }, 0);

  const kpis = [
    { label: "Avg Recovery Indicator", value: avgValue, icon: Activity, color: "healthcare-teal" },
    { label: "Patients Monitored", value: data.length, icon: Users, color: "healthcare-blue" },
    { label: "Total Population", value: Math.round(totalPopulation).toLocaleString(), icon: Globe, color: "healthcare-purple" },
    { label: "Support Coverage", value: (avgValue / 100).toFixed(2), icon: ShieldCheck, color: "healthcare-orange" },
    { label: "Avg Follow-up Rate", value: avgValue, icon: CalendarCheck, color: "healthcare-pink" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, i) => (
        <div
          key={kpi.label}
          className="card-healthcare rounded-xl p-5 animate-fade-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {kpi.label}
            </span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${kpi.color}/10`}>
              <kpi.icon className={`h-4 w-4 text-${kpi.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
