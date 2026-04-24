"""
Healthcare Readmission Risk ML Pipeline
========================================
Complete Python pipeline for training Logistic Regression and Random Forest
models on NHS-style hospital readmission data.

Usage:
    pip install -r requirements.txt
    python pipeline.py

Outputs:
    output/risk_scores.csv
    output/feature_importance.csv
    output/model_metrics.json
"""

import pandas as pd
import numpy as np
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix
)

# ── Configuration ─────────────────────────────────────────────────────
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'hospital_readmission_dataset.csv')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'output')
RANDOM_STATE = 42
TEST_SIZE = 0.2


def load_data(path: str) -> pd.DataFrame:
    """Load and validate the dataset."""
    df = pd.read_csv(path)
    print(f"✅ Loaded {len(df)} records with {len(df.columns)} columns")
    print(f"   Columns: {list(df.columns)}")
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean and preprocess the dataset."""
    # Drop duplicates
    before = len(df)
    df = df.drop_duplicates()
    print(f"   Removed {before - len(df)} duplicates")

    # Handle missing values
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        df[col] = df[col].fillna(df[col].median())

    cat_cols = df.select_dtypes(include=['object']).columns
    for col in cat_cols:
        df[col] = df[col].fillna(df[col].mode()[0] if len(df[col].mode()) > 0 else 'Unknown')

    print(f"✅ Data cleaned: {len(df)} records")
    return df


def engineer_features(df: pd.DataFrame) -> tuple:
    """Feature engineering pipeline."""
    # Identify target
    target_col = None
    for col in df.columns:
        if 'readmitted' in col.lower() or 'readmit' in col.lower():
            target_col = col
            break

    if target_col is None:
        raise ValueError("No readmission target column found")

    y = df[target_col].astype(int)

    # Select features
    numeric_features = ['length_of_stay', 'discharge_count', 'home_care_visits',
                        'reablement_success_rate', 'social_support_score', 'readmission_rate']
    cat_features = ['age_group', 'gender', 'region', 'diagnosis_group',
                    'procedure_category', 'follow_up_completed']

    available_numeric = [c for c in numeric_features if c in df.columns]
    available_cat = [c for c in cat_features if c in df.columns]

    # Encode categoricals
    encoders = {}
    encoded_df = df[available_numeric].copy()
    for col in available_cat:
        le = LabelEncoder()
        encoded_df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    feature_names = list(encoded_df.columns)
    X = encoded_df.values

    # Scale
    scaler = StandardScaler()
    X = scaler.fit_transform(X)

    print(f"✅ Engineered {X.shape[1]} features from {len(available_numeric)} numeric + {len(available_cat)} categorical")
    return X, y, feature_names, scaler, encoders


def train_models(X_train, X_test, y_train, y_test, feature_names):
    """Train and evaluate Logistic Regression + Random Forest."""
    results = {}

    # Logistic Regression
    lr = LogisticRegression(max_iter=1000, random_state=RANDOM_STATE, C=1.0)
    lr.fit(X_train, y_train)
    lr_probs = lr.predict_proba(X_test)[:, 1]
    lr_preds = lr.predict(X_test)
    results['Logistic Regression'] = evaluate_model(y_test, lr_preds, lr_probs)
    print(f"✅ Logistic Regression — AUC: {results['Logistic Regression']['aucROC']:.4f}")

    # Random Forest
    rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=RANDOM_STATE)
    rf.fit(X_train, y_train)
    rf_probs = rf.predict_proba(X_test)[:, 1]
    rf_preds = rf.predict(X_test)
    results['Random Forest'] = evaluate_model(y_test, rf_preds, rf_probs)
    print(f"✅ Random Forest — AUC: {results['Random Forest']['aucROC']:.4f}")

    # Feature importance
    lr_importance = np.abs(lr.coef_[0])
    rf_importance = rf.feature_importances_
    combined = 0.4 * (lr_importance / lr_importance.max()) + 0.6 * (rf_importance / rf_importance.max())

    feature_importance = sorted(
        [{'feature': name, 'importance': round(float(imp) * 100, 1),
          'direction': 'increases_risk' if lr.coef_[0][i] > 0 else 'decreases_risk'}
         for i, (name, imp) in enumerate(zip(feature_names, combined))],
        key=lambda x: x['importance'], reverse=True
    )

    return lr, rf, results, feature_importance


def evaluate_model(y_true, y_pred, y_probs):
    """Compute evaluation metrics."""
    cm = confusion_matrix(y_true, y_pred)
    return {
        'accuracy': round(float(accuracy_score(y_true, y_pred)), 4),
        'precision': round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        'recall': round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        'f1Score': round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
        'aucROC': round(float(roc_auc_score(y_true, y_probs)), 4),
        'confusionMatrix': {
            'tp': int(cm[1][1]), 'fp': int(cm[0][1]),
            'tn': int(cm[0][0]), 'fn': int(cm[1][0])
        }
    }


def generate_risk_scores(rf, X, df, feature_importance):
    """Generate patient-level risk scores."""
    probs = rf.predict_proba(X)[:, 1]
    scores = []
    for i, row in df.iterrows():
        prob = float(probs[i])
        risk_score = round(prob * 100, 1)
        if prob < 0.35:
            category, color = 'LOW', '#10B981'
        elif prob < 0.65:
            category, color = 'MEDIUM', '#F59E0B'
        else:
            category, color = 'HIGH', '#EF4444'

        patient_id = str(row.get('patient_id', f'P{str(i+1).zfill(5)}'))
        scores.append({
            'patientId': patient_id,
            'probability': round(prob, 4),
            'riskScore': risk_score,
            'riskCategory': category,
            'riskColor': color,
            'topFeatures': [{'name': f['feature'], 'contribution': round(f['importance'] * prob / 100, 2)}
                           for f in feature_importance[:3]]
        })
    return scores


def main():
    print("\n" + "=" * 60)
    print("🏥 Healthcare Readmission Risk ML Pipeline")
    print("=" * 60 + "\n")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 1. Load
    df = load_data(DATA_PATH)

    # 2. Clean
    df = clean_data(df)

    # 3. Feature Engineering
    X, y, feature_names, scaler, encoders = engineer_features(df)

    # 4. Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y)
    print(f"✅ Split: {len(X_train)} train / {len(X_test)} test")

    # 5. Train
    lr, rf, metrics, feature_importance = train_models(X_train, X_test, y_train, y_test, feature_names)

    # 6. Risk Scores
    risk_scores = generate_risk_scores(rf, X, df, feature_importance)

    # 7. Save outputs
    pd.DataFrame(risk_scores).to_csv(os.path.join(OUTPUT_DIR, 'risk_scores.csv'), index=False)
    pd.DataFrame(feature_importance).to_csv(os.path.join(OUTPUT_DIR, 'feature_importance.csv'), index=False)

    with open(os.path.join(OUTPUT_DIR, 'model_metrics.json'), 'w') as f:
        json.dump(metrics, f, indent=2)

    with open(os.path.join(OUTPUT_DIR, 'feature_importance.json'), 'w') as f:
        json.dump(feature_importance, f, indent=2)

    # 8. Aggregated Metrics
    agg_rows = []
    for group_col in ['diagnosis_group', 'region', 'age_group', 'gender']:
        if group_col in df.columns:
            target_col = [c for c in df.columns if 'readmitted' in c.lower()][0]
            grouped = df.groupby(group_col).agg(
                total_patients=(target_col, 'count'),
                readmitted=(target_col, 'sum'),
                readmission_rate=(target_col, 'mean'),
                avg_length_of_stay=('length_of_stay', 'mean') if 'length_of_stay' in df.columns else (target_col, 'count'),
            ).reset_index()
            grouped['group_type'] = group_col
            grouped.rename(columns={group_col: 'group_value'}, inplace=True)
            grouped['readmission_rate'] = (grouped['readmission_rate'] * 100).round(1)
            if 'avg_length_of_stay' in grouped.columns:
                grouped['avg_length_of_stay'] = grouped['avg_length_of_stay'].round(1)
            agg_rows.append(grouped)
    if agg_rows:
        agg_df = pd.concat(agg_rows, ignore_index=True)
        agg_df.to_csv(os.path.join(OUTPUT_DIR, 'aggregated_metrics.csv'), index=False)
        print(f"✅ Exported aggregated_metrics.csv ({len(agg_df)} rows)")

    # Summary
    dist = {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0}
    for s in risk_scores:
        dist[s['riskCategory']] += 1

    print(f"\n{'=' * 60}")
    print(f"📊 Pipeline Complete!")
    print(f"   Total patients: {len(risk_scores)}")
    print(f"   Risk Distribution: LOW={dist['LOW']} | MEDIUM={dist['MEDIUM']} | HIGH={dist['HIGH']}")
    print(f"   Outputs saved to: {OUTPUT_DIR}")
    print(f"{'=' * 60}\n")


if __name__ == '__main__':
    main()
