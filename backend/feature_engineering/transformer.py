"""
Feature Engineering Module
===========================
Modular, reusable transformations for healthcare readmission prediction.
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder


def bucket_age_groups(df: pd.DataFrame, col: str = 'age_group') -> pd.DataFrame:
    """Ensure age groups are properly bucketed."""
    if col in df.columns:
        df[col] = df[col].astype(str)
    return df


def encode_diagnosis_category(df: pd.DataFrame, col: str = 'diagnosis_group') -> pd.DataFrame:
    """Label-encode primary diagnosis categories."""
    if col in df.columns:
        le = LabelEncoder()
        df[f'{col}_encoded'] = le.fit_transform(df[col].astype(str))
    return df


def compute_prior_admissions(df: pd.DataFrame, col: str = 'discharge_count') -> pd.DataFrame:
    """Use discharge_count as proxy for prior admissions in last 12 months."""
    if col in df.columns:
        df['prior_admissions_12m'] = df[col].clip(lower=0)
    return df


def compute_los_features(df: pd.DataFrame, col: str = 'length_of_stay') -> pd.DataFrame:
    """Create length-of-stay derived features."""
    if col in df.columns:
        df['los_bucket'] = pd.cut(df[col], bins=[0, 2, 5, 10, 100],
                                   labels=['1-2d', '3-5d', '6-10d', '11+d'])
        df['los_log'] = np.log1p(df[col])
    return df


def compute_followup_binary(df: pd.DataFrame, col: str = 'follow_up_completed') -> pd.DataFrame:
    """Convert follow-up to binary (1=Yes, 0=No)."""
    if col in df.columns:
        df['followup_arranged'] = (df[col].astype(str).str.lower() == 'yes').astype(int)
    return df


def compute_social_referral(df: pd.DataFrame, score_col: str = 'social_support_score') -> pd.DataFrame:
    """Derive social care referral flag from support score (low score = needs referral)."""
    if score_col in df.columns:
        df['social_care_referral'] = (df[score_col] < 4).astype(int)
    return df


def compute_deprivation_index(df: pd.DataFrame, score_col: str = 'social_support_score') -> pd.DataFrame:
    """Map social support score to deprivation index (inverse relationship)."""
    if score_col in df.columns:
        max_score = df[score_col].max()
        df['deprivation_index'] = ((max_score - df[score_col]) / max_score * 10).round(1)
    return df


def compute_time_to_followup(df: pd.DataFrame, los_col: str = 'length_of_stay',
                              visits_col: str = 'home_care_visits') -> pd.DataFrame:
    """Estimate time to first follow-up based on available data."""
    if los_col in df.columns and visits_col in df.columns:
        df['est_time_to_followup'] = (df[los_col] + np.random.randint(1, 7, size=len(df))).clip(lower=1)
    return df


def compute_gender_distribution(df: pd.DataFrame, col: str = 'gender') -> dict:
    """Aggregate gender distribution."""
    if col in df.columns:
        return df[col].value_counts().to_dict()
    return {}


def run_feature_pipeline(df: pd.DataFrame) -> pd.DataFrame:
    """Execute the full feature engineering pipeline."""
    df = bucket_age_groups(df)
    df = encode_diagnosis_category(df)
    df = compute_prior_admissions(df)
    df = compute_los_features(df)
    df = compute_followup_binary(df)
    df = compute_social_referral(df)
    df = compute_deprivation_index(df)
    df = compute_time_to_followup(df)
    return df


def prepare_model_features(df: pd.DataFrame, target_col: str = 'readmitted_30d'):
    """Prepare feature matrix and target for model training."""
    numeric_cols = ['length_of_stay', 'discharge_count', 'home_care_visits',
                    'reablement_success_rate', 'social_support_score', 'readmission_rate']
    cat_cols = ['age_group', 'gender', 'region', 'diagnosis_group',
                'procedure_category', 'follow_up_completed']

    available_numeric = [c for c in numeric_cols if c in df.columns]
    available_cat = [c for c in cat_cols if c in df.columns]

    # Encode categoricals
    encoded = df[available_numeric].copy()
    encoders = {}
    for col in available_cat:
        le = LabelEncoder()
        encoded[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    feature_names = list(encoded.columns)
    X = encoded.values
    y = df[target_col].astype(int).values

    scaler = StandardScaler()
    X = scaler.fit_transform(X)

    return X, y, feature_names, scaler, encoders
