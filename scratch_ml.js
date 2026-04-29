import fs from 'fs';
import { parse } from 'csv-parse/sync';

const dataStr = fs.readFileSync('public/hospital_readmission_dataset.csv', 'utf8');
const records = parse(dataStr, { columns: true, skip_empty_lines: true });

function trainLogisticRegression(X, y, lr = 0.01, epochs = 100) {
    if (!X || !X[0]) throw new Error("X is empty or invalid in trainLogisticRegression");
    const nFeatures = X[0].length;
    const weights = new Array(nFeatures).fill(0).map(() => (Math.random() - 0.5) * 0.01);
    let bias = 0;
  
    for (let epoch = 0; epoch < epochs; epoch++) {
      const gradW = new Array(nFeatures).fill(0);
      let gradB = 0;
  
      for (let i = 0; i < X.length; i++) {
        const z = X[i].reduce((s, x, j) => s + x * weights[j], bias);
        const pred = 1 / (1 + Math.exp(-z));
        const err = pred - y[i];
        for (let j = 0; j < nFeatures; j++) gradW[j] += err * X[i][j];
        gradB += err;
      }
  
      for (let j = 0; j < nFeatures; j++) weights[j] -= lr * gradW[j] / X.length;
      bias -= lr * gradB / X.length;
    }
    return { weights, bias };
}

try {
    const y = records.map(r => Number(r['readmitted_30d']) || 0);
    // engineerFeatures
    const numericCols = ['length_of_stay', 'discharge_count', 'home_care_visits', 'reablement_success_rate', 'social_support_score', 'readmission_rate'];
    const catCols = ['age_group', 'gender', 'region', 'diagnosis_group', 'procedure_category', 'follow_up_completed'];
    
    const availableNumeric = numericCols.filter(c => Object.keys(records[0]).includes(c));
    const availableCat = catCols.filter(c => Object.keys(records[0]).includes(c));
    
    // Normalize
    const numericData = {};
    for (const col of availableNumeric) {
        const vals = records.map(r => Number(r[col]) || 0);
        const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
        const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length) || 1;
        numericData[col] = { normalized: vals.map(v => (v - mean) / std), mean, std };
    }
    
    // One-Hot
    const catData = {};
    for (const col of availableCat) {
        const vals = records.map(r => String(r[col] || 'Unknown'));
        const categories = [...new Set(vals)].sort();
        const encoded = vals.map(v => categories.map(c => c === v ? 1 : 0));
        catData[col] = { encoded, categories };
    }
    
    const featureMatrix = [];
    for (let i = 0; i < records.length; i++) {
        const row = [];
        for (const col of availableNumeric) row.push(numericData[col].normalized[i]);
        for (const col of availableCat) row.push(...catData[col].encoded[i]);
        featureMatrix.push(row);
    }
    
    console.log("Feature matrix size:", featureMatrix.length, featureMatrix[0].length);
    console.log("Y length:", y.length);

    const splitIdx = Math.floor(featureMatrix.length * 0.8);
    const Xtrain = featureMatrix.slice(0, splitIdx);
    const ytrain = y.slice(0, splitIdx);
    console.log("Xtrain size:", Xtrain.length, Xtrain[0].length);
    console.log("ytrain size:", ytrain.length);

    console.log("Training Logistic Regression...");
    trainLogisticRegression(Xtrain, ytrain, 0.05, 100);
    console.log("LR trained successfully");
} catch (e) {
    console.error("ERROR", e);
}

