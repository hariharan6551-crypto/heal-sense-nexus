"""
Data Cleaning Module
====================
Handles missing values, outliers, duplicates, and type detection.
"""
import pandas as pd
import numpy as np


def detect_column_types(df: pd.DataFrame) -> dict:
    """Auto-detect column types: numeric, categorical, datetime."""
    numeric = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical = df.select_dtypes(include=['object', 'category']).columns.tolist()
    datetime_cols = []
    for col in categorical[:]:
        try:
            pd.to_datetime(df[col], infer_datetime_format=True)
            datetime_cols.append(col)
            categorical.remove(col)
        except (ValueError, TypeError):
            pass
    return {'numeric': numeric, 'categorical': categorical, 'datetime': datetime_cols}


def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Impute missing values — median for numeric, mode for categorical."""
    for col in df.select_dtypes(include=[np.number]).columns:
        df[col] = df[col].fillna(df[col].median())
    for col in df.select_dtypes(include=['object']).columns:
        mode_val = df[col].mode()
        df[col] = df[col].fillna(mode_val[0] if len(mode_val) > 0 else 'Unknown')
    return df


def remove_outliers(df: pd.DataFrame, columns: list = None, method: str = 'iqr', threshold: float = 1.5) -> pd.DataFrame:
    """Remove outliers using IQR method."""
    if columns is None:
        columns = df.select_dtypes(include=[np.number]).columns.tolist()
    for col in columns:
        if method == 'iqr':
            q1, q3 = df[col].quantile(0.25), df[col].quantile(0.75)
            iqr = q3 - q1
            lower, upper = q1 - threshold * iqr, q3 + threshold * iqr
            df = df[(df[col] >= lower) & (df[col] <= upper)]
    return df


def clean_dataset(df: pd.DataFrame, remove_duplicates: bool = True, handle_outliers: bool = False) -> pd.DataFrame:
    """Full cleaning pipeline."""
    if remove_duplicates:
        df = df.drop_duplicates()
    df = handle_missing_values(df)
    if handle_outliers:
        df = remove_outliers(df)
    return df
