import { PATIENTS } from '@/data/healthcareData';
import type { DatasetInfo, ColumnMeta } from './parseData';

/** Convert the built-in healthcare patient array into a DatasetInfo
 *  so the dynamic dashboard can render it on first load. */
export function getDefaultDataset(): DatasetInfo {
  const data: Record<string, any>[] = PATIENTS.map(p => ({ ...p }));
  const columns = Object.keys(data[0]);

  const numericColumns = [
    'age', 'supportScore', 'recoveryDays', 'readmissionRisk',
    'opVisits', 'lengthOfStay', 'dischargeCount', 'homeCareVisits', 'reablementSuccess',
  ];
  const categoricalColumns = [
    'patientId', 'ageGroup', 'gender', 'region', 'diagnosis',
    'diagnosisGroup', 'procedureCategory', 'supportType',
  ];

  const columnMeta: ColumnMeta[] = columns.map(name => {
    const isNum = numericColumns.includes(name);
    const values = data.map(r => r[name]);
    const nonNull = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '');
    return {
      name,
      type: isNum ? 'numeric' : 'categorical',
      nonNullCount: nonNull.length,
      uniqueCount: new Set(values.map(String)).size,
      missingCount: data.length - nonNull.length,
    };
  });

  return {
    data,
    columns,
    columnMeta,
    numericColumns,
    categoricalColumns,
    datetimeColumns: [],
    textColumns: [],
    totalRows: data.length,
    totalColumns: columns.length,
    missingValueCount: 0,
    duplicateRowCount: 0,
    fileName: 'Healthcare Patient Dataset',
    fileSize: 0,
    uploadTimestamp: new Date().toISOString(),
  };
}
