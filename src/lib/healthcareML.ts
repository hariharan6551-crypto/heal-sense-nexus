// ═══════════════════════════════════════════════════════════════════════
// Healthcare ML Engine — In-Browser Readmission Risk Prediction
// Logistic Regression + Random Forest + Risk Scoring + Evaluation
// ═══════════════════════════════════════════════════════════════════════

export interface RiskScore {
  patientId: string;
  probability: number;
  riskScore: number;
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
  riskColor: string;
  topFeatures: { name: string; contribution: number }[];
}

export interface ModelMetrics {
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  aucROC: number;
  confusionMatrix: { tp: number; fp: number; tn: number; fn: number };
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  direction: 'increases_risk' | 'decreases_risk';
}

export interface MLPipelineResult {
  riskScores: RiskScore[];
  logisticMetrics: ModelMetrics;
  forestMetrics: ModelMetrics;
  featureImportance: FeatureImportance[];
  riskDistribution: { LOW: number; MEDIUM: number; HIGH: number };
  avgRiskScore: number;
  readmission30dRate: number;
  readmission90dRate: number;
  diagnosisRisk: { name: string; rate: number; count: number }[];
  regionRisk: { name: string; rate: number; count: number }[];
  ageGroupRisk: { name: string; rate: number; count: number }[];
  genderDistribution: { name: string; count: number; riskRate: number }[];
  losDistribution: { range: string; count: number; riskRate: number }[];
  followUpStats: { completed: number; missed: number; rate: number };
  socialSupportCorrelation: { score: number; riskRate: number }[];
  recoveryTrends: { week: number; recoveryRate: number; readmissionRate: number }[];
  monthlyTrend: { month: string; admissions: number; readmissions: number; rate: number }[];
}

// ── Sigmoid Function ─────────────────────────────────────────────────
function sigmoid(z: number): number {
  if (z > 500) return 1;
  if (z < -500) return 0;
  return 1 / (1 + Math.exp(-z));
}

// ── Normalize Features ───────────────────────────────────────────────
function normalize(values: number[]): { normalized: number[]; mean: number; std: number } {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length) || 1;
  return { normalized: values.map(v => (v - mean) / std), mean, std };
}

// ── One-Hot Encode ───────────────────────────────────────────────────
function oneHotEncode(values: string[]): { encoded: number[][]; categories: string[] } {
  const categories = [...new Set(values)].sort();
  const encoded = values.map(v => categories.map(c => c === v ? 1 : 0));
  return { encoded, categories };
}

// ── Feature Engineering ──────────────────────────────────────────────
function engineerFeatures(data: Record<string, unknown>[]) {
  const featureNames: string[] = [];
  const featureMatrix: number[][] = [];

  // Detect columns
  const cols = Object.keys(data[0] || {});
  const numericCols = ['length_of_stay', 'discharge_count', 'home_care_visits',
    'reablement_success_rate', 'social_support_score', 'readmission_rate'];
  const catCols = ['age_group', 'gender', 'region', 'diagnosis_group', 'procedure_category', 'follow_up_completed'];

  const availableNumeric = numericCols.filter(c => cols.includes(c));
  const availableCat = catCols.filter(c => cols.includes(c));

  // Normalize numerics
  const numericData: Record<string, { normalized: number[]; mean: number; std: number }> = {};
  for (const col of availableNumeric) {
    const vals = data.map(r => Number(r[col]) || 0);
    numericData[col] = normalize(vals);
    featureNames.push(col);
  }

  // One-hot encode categoricals
  const catData: Record<string, { encoded: number[][]; categories: string[] }> = {};
  for (const col of availableCat) {
    const vals = data.map(r => String(r[col] || 'Unknown'));
    catData[col] = oneHotEncode(vals);
    catData[col].categories.forEach(c => featureNames.push(`${col}_${c}`));
  }

  // Build feature matrix
  for (let i = 0; i < data.length; i++) {
    const row: number[] = [];
    for (const col of availableNumeric) row.push(numericData[col].normalized[i]);
    for (const col of availableCat) row.push(...catData[col].encoded[i]);
    featureMatrix.push(row);
  }

  return { featureMatrix, featureNames, numericData, catData };
}

// ── Logistic Regression ──────────────────────────────────────────────
function trainLogisticRegression(X: number[][], y: number[], lr = 0.01, epochs = 100) {
  const nFeatures = X[0].length;
  const weights = new Array(nFeatures).fill(0).map(() => (Math.random() - 0.5) * 0.01);
  let bias = 0;

  for (let epoch = 0; epoch < epochs; epoch++) {
    const gradW = new Array(nFeatures).fill(0);
    let gradB = 0;

    for (let i = 0; i < X.length; i++) {
      const z = X[i].reduce((s, x, j) => s + x * weights[j], bias);
      const pred = sigmoid(z);
      const err = pred - y[i];
      for (let j = 0; j < nFeatures; j++) gradW[j] += err * X[i][j];
      gradB += err;
    }

    for (let j = 0; j < nFeatures; j++) weights[j] -= lr * gradW[j] / X.length;
    bias -= lr * gradB / X.length;
  }

  return {
    weights, bias,
    predict: (X: number[][]) => X.map(x => {
      const z = x.reduce((s, v, j) => s + v * weights[j], bias);
      return sigmoid(z);
    }),
  };
}

// ── Decision Tree (Stump) ────────────────────────────────────────────
interface TreeNode { featureIdx: number; threshold: number; leftProb: number; rightProb: number; gain: number }

function buildStump(X: number[][], y: number[], sampleWeights?: number[]): TreeNode {
  const n = X.length;
  const nFeatures = X[0].length;
  let bestGain = -Infinity, bestFeature = 0, bestThreshold = 0, bestLeftP = 0.5, bestRightP = 0.5;

  const w = sampleWeights || new Array(n).fill(1 / n);

  for (let f = 0; f < nFeatures; f++) {
    const vals = X.map((x, i) => ({ v: x[f], y: y[i], w: w[i] })).sort((a, b) => a.v - b.v);
    for (let t = 0; t < Math.min(vals.length - 1, 20); t++) {
      const idx = Math.floor((t + 0.5) * vals.length / 20);
      const threshold = vals[idx]?.v ?? 0;
      let leftSum = 0, leftW = 0, rightSum = 0, rightW = 0;
      for (const v of vals) {
        if (v.v <= threshold) { leftSum += v.y * v.w; leftW += v.w; }
        else { rightSum += v.y * v.w; rightW += v.w; }
      }
      const leftP = leftW > 0 ? leftSum / leftW : 0.5;
      const rightP = rightW > 0 ? rightSum / rightW : 0.5;
      const gain = Math.abs(leftP - rightP) * Math.min(leftW, rightW);
      if (gain > bestGain) {
        bestGain = gain; bestFeature = f; bestThreshold = threshold;
        bestLeftP = leftP; bestRightP = rightP;
      }
    }
  }
  return { featureIdx: bestFeature, threshold: bestThreshold, leftProb: bestLeftP, rightProb: bestRightP, gain: bestGain };
}

// ── Random Forest ────────────────────────────────────────────────────
function trainRandomForest(X: number[][], y: number[], nTrees = 30) {
  const trees: TreeNode[] = [];
  const n = X.length;
  const featureImportances = new Array(X[0].length).fill(0);

  for (let t = 0; t < nTrees; t++) {
    // Bootstrap sample
    const indices = Array.from({ length: n }, () => Math.floor(Math.random() * n));
    const Xb = indices.map(i => X[i]);
    const yb = indices.map(i => y[i]);
    const tree = buildStump(Xb, yb);
    trees.push(tree);
    featureImportances[tree.featureIdx] += tree.gain;
  }

  // Normalize importances
  const maxImp = Math.max(...featureImportances, 0.001);
  const normalizedImportances = featureImportances.map(v => v / maxImp);

  return {
    trees, featureImportances: normalizedImportances,
    predict: (X: number[][]) => X.map(x => {
      const votes = trees.map(t => x[t.featureIdx] <= t.threshold ? t.leftProb : t.rightProb);
      return votes.reduce((a, b) => a + b, 0) / votes.length;
    }),
  };
}

// ── Model Evaluation ─────────────────────────────────────────────────
function evaluate(yTrue: number[], yProbs: number[], threshold = 0.5): ModelMetrics {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  const yPred = yProbs.map(p => p >= threshold ? 1 : 0);

  for (let i = 0; i < yTrue.length; i++) {
    if (yTrue[i] === 1 && yPred[i] === 1) tp++;
    else if (yTrue[i] === 0 && yPred[i] === 1) fp++;
    else if (yTrue[i] === 0 && yPred[i] === 0) tn++;
    else fn++;
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
  const accuracy = (tp + tn) / (tp + fp + tn + fn);

  // AUC-ROC approximation
  const sorted = yTrue.map((y, i) => ({ y, p: yProbs[i] })).sort((a, b) => b.p - a.p);
  let auc = 0, tpCount = 0, fpCount = 0;
  const totalP = yTrue.filter(y => y === 1).length;
  const totalN = yTrue.filter(y => y === 0).length;
  for (const s of sorted) {
    if (s.y === 1) tpCount++;
    else { fpCount++; auc += tpCount; }
  }
  const aucROC = totalP > 0 && totalN > 0 ? auc / (totalP * totalN) : 0.5;

  return { modelName: '', accuracy, precision, recall, f1Score: f1, aucROC, confusionMatrix: { tp, fp, tn, fn } };
}

// ── Risk Category Assignment ─────────────────────────────────────────
function assignRisk(prob: number): { category: 'LOW' | 'MEDIUM' | 'HIGH'; color: string } {
  if (prob < 0.35) return { category: 'LOW', color: '#10B981' };
  if (prob < 0.65) return { category: 'MEDIUM', color: '#F59E0B' };
  return { category: 'HIGH', color: '#EF4444' };
}

// ── Main Pipeline ────────────────────────────────────────────────────
export function runMLPipeline(data: Record<string, unknown>[]): MLPipelineResult {
  if (!data.length) return getEmptyResult();

  // Extract target variable
  const targetCol = Object.keys(data[0]).find(c =>
    c.toLowerCase().includes('readmitted') || c.toLowerCase().includes('readmit_30')
  ) || 'readmitted_30d';

  const y = data.map(r => Number(r[targetCol]) || 0);
  const { featureMatrix: X, featureNames } = engineerFeatures(data);

  // Train-test split (80/20)
  const splitIdx = Math.floor(X.length * 0.8);
  const indices = Array.from({ length: X.length }, (_, i) => i);
  // Shuffle deterministically
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(((i * 2654435761) >>> 0) / 4294967296 * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const trainIdx = indices.slice(0, splitIdx);
  const testIdx = indices.slice(splitIdx);
  const Xtrain = trainIdx.map(i => X[i]);
  const ytrain = trainIdx.map(i => y[i]);
  const Xtest = testIdx.map(i => X[i]);
  const ytest = testIdx.map(i => y[i]);

  // Train models (reduced hyperparams for instant UI)
  const lr = trainLogisticRegression(Xtrain, ytrain, 0.05, 100);
  const rf = trainRandomForest(Xtrain, ytrain, 30);

  // Evaluate
  const lrProbs = lr.predict(Xtest);
  const rfProbs = rf.predict(Xtest);
  const lrMetrics = { ...evaluate(ytest, lrProbs), modelName: 'Logistic Regression' };
  const rfMetrics = { ...evaluate(ytest, rfProbs), modelName: 'Random Forest' };

  // Feature importance (combine both models)
  const lrImportance = lr.weights.map(w => Math.abs(w));
  const maxLR = Math.max(...lrImportance, 0.001);
  const featureImportance: FeatureImportance[] = featureNames.map((name, i) => ({
    feature: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    importance: +(((lrImportance[i] / maxLR) * 0.4 + (rf.featureImportances[i] || 0) * 0.6) * 100).toFixed(1),
    direction: (lr.weights[i] || 0) > 0 ? 'increases_risk' as const : 'decreases_risk' as const,
  })).sort((a, b) => b.importance - a.importance).slice(0, 15);

  // Generate risk scores for ALL patients using RF (primary model)
  const allProbs = rf.predict(X);
  const riskScores: RiskScore[] = data.map((row, i) => {
    const prob = allProbs[i];
    const { category, color } = assignRisk(prob);
    const patientId = String(row.patient_id || row.patientId || `P${String(i + 1).padStart(5, '0')}`);
    const topFeats = featureImportance.slice(0, 3).map(f => ({
      name: f.feature, contribution: +(f.importance * prob / 100).toFixed(2),
    }));
    return { patientId, probability: +prob.toFixed(4), riskScore: +(prob * 100).toFixed(1), riskCategory: category, riskColor: color, topFeatures: topFeats };
  });

  // Risk distribution
  const riskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  riskScores.forEach(r => riskDistribution[r.riskCategory]++);

  // Avg risk
  const avgRiskScore = +(riskScores.reduce((s, r) => s + r.riskScore, 0) / riskScores.length).toFixed(1);

  // Readmission rates
  const readmission30dRate = +(y.filter(v => v === 1).length / y.length * 100).toFixed(1);
  const readmission90dRate = +(readmission30dRate * 1.6).toFixed(1); // Estimated

  // Diagnosis risk breakdown
  const diagGroups: Record<string, { total: number; readmitted: number }> = {};
  data.forEach((r, i) => {
    const dg = String(r.diagnosis_group || r.diagnosisGroup || 'Other');
    if (!diagGroups[dg]) diagGroups[dg] = { total: 0, readmitted: 0 };
    diagGroups[dg].total++;
    if (y[i] === 1) diagGroups[dg].readmitted++;
  });
  const diagnosisRisk = Object.entries(diagGroups).map(([name, v]) => ({
    name, rate: +(v.readmitted / v.total * 100).toFixed(1), count: v.total,
  })).sort((a, b) => b.rate - a.rate);

  // Region risk
  const regionGroups: Record<string, { total: number; readmitted: number }> = {};
  data.forEach((r, i) => {
    const rg = String(r.region || 'Unknown');
    if (!regionGroups[rg]) regionGroups[rg] = { total: 0, readmitted: 0 };
    regionGroups[rg].total++;
    if (y[i] === 1) regionGroups[rg].readmitted++;
  });
  const regionRisk = Object.entries(regionGroups).map(([name, v]) => ({
    name, rate: +(v.readmitted / v.total * 100).toFixed(1), count: v.total,
  })).sort((a, b) => b.rate - a.rate);

  // Age group risk
  const ageGroups: Record<string, { total: number; readmitted: number }> = {};
  data.forEach((r, i) => {
    const ag = String(r.age_group || r.ageGroup || 'Unknown');
    if (!ageGroups[ag]) ageGroups[ag] = { total: 0, readmitted: 0 };
    ageGroups[ag].total++;
    if (y[i] === 1) ageGroups[ag].readmitted++;
  });
  const ageGroupRisk = Object.entries(ageGroups).map(([name, v]) => ({
    name, rate: +(v.readmitted / v.total * 100).toFixed(1), count: v.total,
  }));

  // Gender distribution
  const genderGroups: Record<string, { total: number; readmitted: number }> = {};
  data.forEach((r, i) => {
    const g = String(r.gender || 'Unknown');
    if (!genderGroups[g]) genderGroups[g] = { total: 0, readmitted: 0 };
    genderGroups[g].total++;
    if (y[i] === 1) genderGroups[g].readmitted++;
  });
  const genderDistribution = Object.entries(genderGroups).map(([name, v]) => ({
    name, count: v.total, riskRate: +(v.readmitted / v.total * 100).toFixed(1),
  }));

  // LOS distribution
  const losBuckets: Record<string, { total: number; readmitted: number }> = {};
  data.forEach((r, i) => {
    const los = Number(r.length_of_stay || r.lengthOfStay || 0);
    const bucket = los <= 2 ? '1-2 days' : los <= 5 ? '3-5 days' : los <= 10 ? '6-10 days' : '11+ days';
    if (!losBuckets[bucket]) losBuckets[bucket] = { total: 0, readmitted: 0 };
    losBuckets[bucket].total++;
    if (y[i] === 1) losBuckets[bucket].readmitted++;
  });
  const losDistribution = Object.entries(losBuckets).map(([range, v]) => ({
    range, count: v.total, riskRate: +(v.readmitted / v.total * 100).toFixed(1),
  }));

  // Follow-up stats
  const followUpCompleted = data.filter(r => String(r.follow_up_completed || '').toLowerCase() === 'yes').length;
  const followUpStats = {
    completed: followUpCompleted,
    missed: data.length - followUpCompleted,
    rate: +(followUpCompleted / data.length * 100).toFixed(1),
  };

  // Social support correlation
  const supportBuckets: Record<number, { total: number; readmitted: number }> = {};
  data.forEach((r, i) => {
    const score = Math.round(Number(r.social_support_score || r.supportScore || 5));
    if (!supportBuckets[score]) supportBuckets[score] = { total: 0, readmitted: 0 };
    supportBuckets[score].total++;
    if (y[i] === 1) supportBuckets[score].readmitted++;
  });
  const socialSupportCorrelation = Object.entries(supportBuckets)
    .map(([score, v]) => ({ score: Number(score), riskRate: +(v.readmitted / v.total * 100).toFixed(1) }))
    .sort((a, b) => a.score - b.score);

  // Recovery trends (simulated weekly)
  const recoveryTrends = Array.from({ length: 8 }, (_, i) => ({
    week: i + 1,
    recoveryRate: +(15 + i * 10 + Math.random() * 5).toFixed(1),
    readmissionRate: +(45 - i * 5 - Math.random() * 3).toFixed(1),
  }));

  // Monthly trend (simulated)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrend = months.map((month, i) => {
    const admissions = Math.round(150 + Math.sin(i * 0.5) * 30 + Math.random() * 20);
    const readmissions = Math.round(admissions * (readmission30dRate / 100) * (0.8 + Math.random() * 0.4));
    return { month, admissions, readmissions, rate: +(readmissions / admissions * 100).toFixed(1) };
  });

  return {
    riskScores, logisticMetrics: lrMetrics, forestMetrics: rfMetrics,
    featureImportance, riskDistribution, avgRiskScore,
    readmission30dRate, readmission90dRate,
    diagnosisRisk, regionRisk, ageGroupRisk, genderDistribution,
    losDistribution, followUpStats, socialSupportCorrelation,
    recoveryTrends, monthlyTrend,
  };
}

function getEmptyResult(): MLPipelineResult {
  return {
    riskScores: [], logisticMetrics: { modelName: 'Logistic Regression', accuracy: 0, precision: 0, recall: 0, f1Score: 0, aucROC: 0, confusionMatrix: { tp: 0, fp: 0, tn: 0, fn: 0 } },
    forestMetrics: { modelName: 'Random Forest', accuracy: 0, precision: 0, recall: 0, f1Score: 0, aucROC: 0, confusionMatrix: { tp: 0, fp: 0, tn: 0, fn: 0 } },
    featureImportance: [], riskDistribution: { LOW: 0, MEDIUM: 0, HIGH: 0 },
    avgRiskScore: 0, readmission30dRate: 0, readmission90dRate: 0,
    diagnosisRisk: [], regionRisk: [], ageGroupRisk: [], genderDistribution: [],
    losDistribution: [], followUpStats: { completed: 0, missed: 0, rate: 0 },
    socialSupportCorrelation: [], recoveryTrends: [], monthlyTrend: [],
  };
}
