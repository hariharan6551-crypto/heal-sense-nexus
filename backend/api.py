"""
FastAPI API Layer
==================
REST API for Healthcare Readmission Risk Platform.
Enables real-time dataset upload, model inference, and risk scoring.

Usage:
    uvicorn backend.api:app --reload --port 8000
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import io
import json
import os

from backend.data_processing.cleaner import clean_dataset, detect_column_types
from backend.feature_engineering.transformer import run_feature_pipeline, prepare_model_features
from backend.models.trainer import (
    train_logistic_regression, train_random_forest,
    evaluate_model, get_feature_importance, assign_risk_category
)
from sklearn.model_selection import train_test_split

app = FastAPI(
    title="Healthcare Readmission Risk API",
    description="AI-powered readmission risk prediction and analytics",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory model store
_models = {}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}


@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload and process a healthcare dataset (CSV/Excel/JSON)."""
    try:
        content = await file.read()
        ext = file.filename.split('.')[-1].lower()

        if ext == 'csv':
            df = pd.read_csv(io.BytesIO(content))
        elif ext in ('xlsx', 'xls'):
            df = pd.read_excel(io.BytesIO(content))
        elif ext == 'json':
            df = pd.read_json(io.BytesIO(content))
        else:
            raise HTTPException(400, f"Unsupported format: {ext}")

        col_types = detect_column_types(df)
        df_clean = clean_dataset(df)
        df_features = run_feature_pipeline(df_clean)

        return {
            "rows": len(df_features),
            "columns": len(df_features.columns),
            "columnTypes": col_types,
            "preview": df_features.head(5).to_dict(orient='records'),
            "message": f"Processed {len(df_features)} records with {len(df_features.columns)} features"
        }
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/api/train")
async def train_models(file: UploadFile = File(...)):
    """Upload dataset, train models, and return evaluation metrics."""
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        df = clean_dataset(df)
        df = run_feature_pipeline(df)

        X, y, feature_names, scaler, encoders = prepare_model_features(df)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        lr = train_logistic_regression(X_train, y_train, tune=False)
        rf = train_random_forest(X_train, y_train, tune=False)

        lr_metrics = evaluate_model(lr, X_test, y_test)
        rf_metrics = evaluate_model(rf, X_test, y_test)
        importance = get_feature_importance(lr, rf, feature_names)

        _models['lr'] = lr
        _models['rf'] = rf
        _models['scaler'] = scaler
        _models['feature_names'] = feature_names

        return {
            "logisticRegression": lr_metrics,
            "randomForest": rf_metrics,
            "featureImportance": importance,
            "trainSize": len(X_train),
            "testSize": len(X_test),
        }
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/api/predict")
async def predict_risk(file: UploadFile = File(...)):
    """Generate risk scores for all patients in the uploaded dataset."""
    if 'rf' not in _models:
        raise HTTPException(400, "No model trained. Call /api/train first.")

    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        df = clean_dataset(df)
        df = run_feature_pipeline(df)

        X, _, _, _, _ = prepare_model_features(df)
        X = _models['scaler'].transform(X)
        probs = _models['rf'].predict_proba(X)[:, 1]

        scores = []
        for i, row in df.iterrows():
            prob = float(probs[i])
            cat, color = assign_risk_category(prob)
            scores.append({
                'patientId': str(row.get('patient_id', f'P{str(i+1).zfill(5)}')),
                'probability': round(prob, 4),
                'riskScore': round(prob * 100, 1),
                'riskCategory': cat,
                'riskColor': color,
            })

        dist = {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0}
        for s in scores:
            dist[s['riskCategory']] += 1

        return {
            "totalPatients": len(scores),
            "riskDistribution": dist,
            "scores": scores,
        }
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/api/insights")
async def get_insights():
    """Get AI-generated insights from the latest model."""
    if 'rf' not in _models:
        raise HTTPException(400, "No model trained yet.")

    importance = get_feature_importance(_models['lr'], _models['rf'], _models['feature_names'])
    top_drivers = [f for f in importance if f['direction'] == 'increases_risk'][:5]
    protective = [f for f in importance if f['direction'] == 'decreases_risk'][:3]

    return {
        "keyDrivers": top_drivers,
        "protectiveFactors": protective,
        "recommendations": [
            f"Focus on reducing '{top_drivers[0]['feature']}' — strongest risk driver ({top_drivers[0]['importance']}%)",
            f"Strengthen '{protective[0]['feature']}' programs — strongest protective factor",
            "Prioritize follow-up scheduling for high-risk patients within 48 hours of discharge",
            "Review social support referral criteria for patients scoring below 4",
        ] if top_drivers and protective else []
    }
