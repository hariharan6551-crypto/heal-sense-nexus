import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateData = () => {
  const ageGroups = ['18-34', '35-44', '45-54', '55-64', '65-74', '75-84', '85+'];
  const genders = ['Male', 'Female'];
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const diagnoses = ['Cardiology', 'Orthopedics', 'Neurology', 'Pulmonology', 'Oncology'];
  const procedures = ['Surgery', 'Therapy', 'Observation', 'Emergency', 'Consultation'];

  let csv = 'id,age_group,gender,region,diagnosis_group,procedure_category,length_of_stay,discharge_count,home_care_visits,reablement_success_rate,social_support_score,readmission_rate,medication_adherence,follow_up_completed\n';

  for (let i = 1; i <= 10000; i++) {
    const r = () => Math.random();
    const pick = (arr) => arr[Math.floor(r() * arr.length)];
    const los = Math.floor(r() * 14) + 1; // 1 to 14
    const dis = Math.floor(r() * 450) + 50; // 50 to 500
    const home = Math.floor(r() * 10); // 0 to 9
    const reable = (r() * 0.45 + 0.40).toFixed(2); // 0.40 to 0.85
    const social = Math.floor(r() * 8) + 1; // 1 to 8
    const readm = (r() * 0.20 + 0.05).toFixed(2); // 0.05 to 0.25
    const med = (r() * 100).toFixed(0);
    const follow = r() > 0.5 ? 'Yes' : 'No';

    csv += `${i},${pick(ageGroups)},${pick(genders)},${pick(regions)},${pick(diagnoses)},${pick(procedures)},${los},${dis},${home},${reable},${social},${readm},${med},${follow}\n`;
  }
  
  fs.writeFileSync(path.join(__dirname, 'public', 'hospital_readmission_dataset.csv'), csv);
  console.log('Dataset generated successfully.');
};

generateData();
