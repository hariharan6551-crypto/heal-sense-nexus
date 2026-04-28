"""
NHS Readmission Risk Prediction Pipeline
==========================================
Complete ML pipeline for predicting 30-day hospital readmission risk.

Models: Random Forest + Logistic Regression
Output: patient_risk_scores.csv, chart images, model metrics

Usage:
    pip install -r requirements.txt
    python nhs_readmission_pipeline.py
"""

import pandas as pd
import numpy as np
import json
import os
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix, roc_curve
)

# ── Configuration ─────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_RAW_DIR = os.path.join(BASE_DIR, 'data', 'raw')
DATA_PROCESSED_DIR = os.path.join(BASE_DIR, 'data', 'processed')
OUTPUT_DIR = os.path.join(BASE_DIR, 'outputs')

# Try to find the dataset in multiple locations
POSSIBLE_DATA_PATHS = [
    os.path.join(DATA_RAW_DIR, 'hospital_readmission_dataset.csv'),
    os.path.join(BASE_DIR, '..', 'public', 'hospital_readmission_dataset.csv'),
    os.path.join(BASE_DIR, '..', 'public', 'data', 'hospital_readmission_dataset.csv'),
]

RANDOM_STATE = 42
TEST_SIZE = 0.2


def find_dataset():
    """Find the dataset from possible locations."""
    for path in POSSIBLE_DATA_PATHS:
        if os.path.exists(path):
            return path
    raise FileNotFoundError(
        f"Dataset not found. Please place hospital_readmission_dataset.csv in: {DATA_RAW_DIR}"
    )


def load_data() -> pd.DataFrame:
    """Load and validate the NHS dataset."""
    path = find_dataset()
    df = pd.read_csv(path)
    print(f"✅ Loaded {len(df)} records with {len(df.columns)} columns from {os.path.basename(path)}")
    print(f"   Columns: {list(df.columns)}")
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean and preprocess the dataset."""
    before = len(df)
    df = df.drop_duplicates()
    print(f"   Removed {before - len(df)} duplicates")

    # Handle missing values
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        df[col] = df[col].fillna(df[col].median())

    cat_cols = df.select_dtypes(include=['object']).columns
    for col in cat_cols:
        mode_val = df[col].mode()
        df[col] = df[col].fillna(mode_val[0] if len(mode_val) > 0 else 'Unknown')

    # Save processed data
    os.makedirs(DATA_PROCESSED_DIR, exist_ok=True)
    df.to_csv(os.path.join(DATA_PROCESSED_DIR, 'cleaned_dataset.csv'), index=False)
    print(f"✅ Data cleaned: {len(df)} records → saved to data/processed/")
    return df


def engineer_features(df: pd.DataFrame) -> tuple:
    """Feature engineering pipeline."""
    # Identify target column
    target_col = None
    for col in df.columns:
        if 'readmitted' in col.lower() or 'readmit' in col.lower():
            target_col = col
            break

    if target_col is None:
        raise ValueError("No readmission target column found in dataset")

    y = df[target_col].astype(int)

    # Select features
    numeric_features = [
        'length_of_stay', 'discharge_count', 'home_care_visits',
        'reablement_success_rate', 'social_support_score', 'readmission_rate'
    ]
    cat_features = [
        'age_group', 'gender', 'region', 'diagnosis_group',
        'procedure_category', 'follow_up_completed'
    ]

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

    print(f"✅ Engineered {X.shape[1]} features ({len(available_numeric)} numeric + {len(available_cat)} categorical)")
    return X, y, feature_names, scaler, encoders, df


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


def train_models(X_train, X_test, y_train, y_test, feature_names):
    """Train and evaluate Random Forest + Logistic Regression."""
    results = {}

    # ── Logistic Regression ──
    lr = LogisticRegression(max_iter=1000, random_state=RANDOM_STATE, C=1.0)
    lr.fit(X_train, y_train)
    lr_probs = lr.predict_proba(X_test)[:, 1]
    lr_preds = lr.predict(X_test)
    results['Logistic Regression'] = evaluate_model(y_test, lr_preds, lr_probs)
    print(f"✅ Logistic Regression — AUC: {results['Logistic Regression']['aucROC']:.4f}")

    # ── Random Forest ──
    rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=RANDOM_STATE)
    rf.fit(X_train, y_train)
    rf_probs = rf.predict_proba(X_test)[:, 1]
    rf_preds = rf.predict(X_test)
    results['Random Forest'] = evaluate_model(y_test, rf_preds, rf_probs)
    print(f"✅ Random Forest — AUC: {results['Random Forest']['aucROC']:.4f}")

    # ── Feature Importance (Combined) ──
    lr_importance = np.abs(lr.coef_[0])
    rf_importance = rf.feature_importances_
    combined = 0.4 * (lr_importance / lr_importance.max()) + 0.6 * (rf_importance / rf_importance.max())

    feature_importance = sorted(
        [{'feature': name, 'importance': round(float(imp) * 100, 1),
          'direction': 'increases_risk' if lr.coef_[0][i] > 0 else 'decreases_risk'}
         for i, (name, imp) in enumerate(zip(feature_names, combined))],
        key=lambda x: x['importance'], reverse=True
    )

    return lr, rf, results, feature_importance, rf_probs, y_test


def generate_risk_scores(rf, X, df, feature_importance):
    """Generate patient-level risk scores and export to CSV."""
    probs = rf.predict_proba(X)[:, 1]
    scores = []

    for i in range(len(df)):
        row = df.iloc[i]
        prob = float(probs[i])
        risk_score = round(prob * 100, 1)

        if prob < 0.35:
            category = 'Low'
        elif prob < 0.65:
            category = 'Medium'
        else:
            category = 'High'

        patient_id = str(row.get('patient_id', f'P{str(i + 1).zfill(5)}'))

        record = {
            'patient_id': patient_id,
            'probability': round(prob, 4),
            'risk_score': risk_score,
            'risk_band': category,
        }

        # Add demographics if available
        for col in ['age_group', 'gender', 'diagnosis_group', 'length_of_stay',
                     'follow_up_completed', 'social_support_score', 'region']:
            if col in df.columns:
                record[col] = row[col]

        scores.append(record)

    return scores


def generate_charts(df, results, feature_importance, rf_probs, y_test):
    """Generate PNG chart images for dashboard overview and model evaluation."""
    try:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import seaborn as sns
        sns.set_theme(style='darkgrid')
    except ImportError:
        print("⚠️  matplotlib/seaborn not installed — skipping chart generation")
        return

    # ── Chart 1: Dashboard Overview ──
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle('NHS Readmission Dashboard Overview', fontsize=16, fontweight='bold')

    # Risk Distribution
    risk_counts = pd.DataFrame([
        {'Risk': 'High', 'Count': sum(1 for p in rf_probs if p >= 0.65)},
        {'Risk': 'Medium', 'Count': sum(1 for p in rf_probs if 0.35 <= p < 0.65)},
        {'Risk': 'Low', 'Count': sum(1 for p in rf_probs if p < 0.35)},
    ])
    colors_risk = ['#EF4444', '#F59E0B', '#10B981']
    axes[0, 0].barh(risk_counts['Risk'], risk_counts['Count'], color=colors_risk)
    axes[0, 0].set_title('Risk Distribution', fontweight='bold')
    axes[0, 0].set_xlabel('Patients')

    # Feature Importance
    top_features = feature_importance[:6]
    feat_names = [f['feature'].replace('_', ' ').title() for f in top_features]
    feat_values = [f['importance'] for f in top_features]
    axes[0, 1].barh(feat_names[::-1], feat_values[::-1], color='#6366F1')
    axes[0, 1].set_title('Top Risk Factors', fontweight='bold')

    # Diagnosis breakdown
    if 'diagnosis_group' in df.columns:
        diag_counts = df['diagnosis_group'].value_counts().head(5)
        axes[1, 0].pie(diag_counts.values, labels=diag_counts.index, autopct='%1.1f%%',
                       colors=['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'])
        axes[1, 0].set_title('Diagnosis Distribution', fontweight='bold')

    # Age group breakdown
    if 'age_group' in df.columns:
        age_counts = df['age_group'].value_counts()
        axes[1, 1].pie(age_counts.values, labels=age_counts.index, autopct='%1.1f%%',
                       colors=['#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'])
        axes[1, 1].set_title('Age Group Breakdown', fontweight='bold')

    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'chart1_dashboard_overview.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved chart1_dashboard_overview.png")

    # ── Chart 2: Model Evaluation ──
    fig, axes = plt.subplots(1, 3, figsize=(16, 5))
    fig.suptitle('Model Evaluation Metrics', fontsize=16, fontweight='bold')

    # AUC-ROC Curve
    from sklearn.metrics import roc_curve as sk_roc_curve
    fpr, tpr, _ = sk_roc_curve(y_test, rf_probs)
    axes[0].plot(fpr, tpr, color='#3B82F6', linewidth=2,
                 label=f"RF AUC = {results['Random Forest']['aucROC']:.3f}")
    axes[0].plot([0, 1], [0, 1], 'k--', alpha=0.3)
    axes[0].set_title('ROC Curve', fontweight='bold')
    axes[0].set_xlabel('False Positive Rate')
    axes[0].set_ylabel('True Positive Rate')
    axes[0].legend()

    # Precision/Recall comparison
    models = list(results.keys())
    precision_vals = [results[m]['precision'] for m in models]
    recall_vals = [results[m]['recall'] for m in models]
    x_pos = np.arange(len(models))
    axes[1].bar(x_pos - 0.15, precision_vals, 0.3, label='Precision', color='#10B981')
    axes[1].bar(x_pos + 0.15, recall_vals, 0.3, label='Recall', color='#F59E0B')
    axes[1].set_xticks(x_pos)
    axes[1].set_xticklabels(models, fontsize=9)
    axes[1].set_title('Precision vs Recall', fontweight='bold')
    axes[1].legend()

    # Confusion Matrix
    cm = confusion_matrix(y_test, (rf_probs >= 0.5).astype(int))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[2],
                xticklabels=['No Readmit', 'Readmit'],
                yticklabels=['No Readmit', 'Readmit'])
    axes[2].set_title('Confusion Matrix (RF)', fontweight='bold')
    axes[2].set_xlabel('Predicted')
    axes[2].set_ylabel('Actual')

    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'chart2_model_evaluation.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved chart2_model_evaluation.png")


def main():
    print("\n" + "=" * 60)
    print("🏥 NHS Readmission Risk Prediction Pipeline")
    print("=" * 60 + "\n")

    # Ensure directories exist
    for d in [DATA_RAW_DIR, DATA_PROCESSED_DIR, OUTPUT_DIR]:
        os.makedirs(d, exist_ok=True)

    # 1. Load
    df = load_data()

    # 2. Clean
    df = clean_data(df)

    # 3. Feature Engineering
    X, y, feature_names, scaler, encoders, df = engineer_features(df)

    # 4. Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    print(f"✅ Train/Test split: {len(X_train)} train / {len(X_test)} test")

    # 5. Train Models
    lr, rf, results, feature_importance, rf_probs, y_test_out = train_models(
        X_train, X_test, y_train, y_test, feature_names
    )

    # 6. Generate Risk Scores
    risk_scores = generate_risk_scores(rf, X, df, feature_importance)

    # 7. Save patient_risk_scores.csv (PRIMARY OUTPUT)
    scores_df = pd.DataFrame(risk_scores)
    scores_df.to_csv(os.path.join(OUTPUT_DIR, 'patient_risk_scores.csv'), index=False)
    print(f"✅ Saved patient_risk_scores.csv ({len(scores_df)} patients)")

    # 8. Save model metrics
    with open(os.path.join(OUTPUT_DIR, 'model_metrics.json'), 'w') as f:
        json.dump(results, f, indent=2)

    # 9. Save feature importance
    pd.DataFrame(feature_importance).to_csv(
        os.path.join(OUTPUT_DIR, 'feature_importance.csv'), index=False
    )

    # 10. Generate chart images
    generate_charts(df, results, feature_importance, rf_probs, y_test_out)

    # 11. Summary
    dist = {'Low': 0, 'Medium': 0, 'High': 0}
    for s in risk_scores:
        dist[s['risk_band']] += 1

    print(f"\n{'=' * 60}")
    print(f"📊 Pipeline Complete!")
    print(f"   Total patients scored: {len(risk_scores)}")
    print(f"   Risk Distribution: High={dist['High']} | Medium={dist['Medium']} | Low={dist['Low']}")
    print(f"   30-day Readmission Rate: {(y.mean() * 100):.1f}%")
    print(f"   RF AUC-ROC: {results['Random Forest']['aucROC']}")
    print(f"   LR AUC-ROC: {results['Logistic Regression']['aucROC']}")
    print(f"   Outputs saved to: {OUTPUT_DIR}")
    print(f"{'=' * 60}\n")


if __name__ == '__main__':
    main()
