import { useEffect } from "react";
import { PATIENTS } from "@/data/analyticsData";

/**
 * /api/data — JSON Data Endpoint for Power BI
 *
 * Renders the full patient dataset as raw JSON.
 * Power BI connects via: Get Data → Web → enter this URL.
 */
export default function ApiDataPage() {
  useEffect(() => {
    document.title = "Analytics — API Data";

    const columns = [
      "patientId", "age", "ageGroup", "gender", "region",
      "diagnosis", "diagnosisGroup", "procedureCategory",
      "supportType", "supportScore", "recoveryDays",
      "readmissionRisk", "opVisits", "lengthOfStay",
      "dischargeCount", "homeCareVisits", "reablementSuccess",
    ];

    const payload = {
      dataset: "analytics-analytics",
      timestamp: new Date().toISOString(),
      recordCount: PATIENTS.length,
      format: "records",
      columns,
      data: PATIENTS,
    };

    document.open("application/json");
    document.write(JSON.stringify(payload, null, 2));
    document.close();
  }, []);

  return (
    <pre style={{ fontFamily: "monospace", padding: 20, background: "#0f172a", color: "#38bdf8", minHeight: "100vh" }}>
      Loading analytics data for Power BI...
    </pre>
  );
}
