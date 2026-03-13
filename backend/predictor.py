import pandas as pd
import numpy as np
from backend.ml_model import train_linear_model, predict_with_model


def predict_future(df: pd.DataFrame, years: int) -> str:
    """
    Predict future recovery indicator based on dataset trends.
    Uses linear regression on the mean of numeric columns.
    """
    numeric = df.select_dtypes(include="number")

    if numeric.empty:
        raise ValueError("No numeric columns found in dataset for prediction.")

    # Calculate row-wise mean as the recovery indicator
    row_means = numeric.mean(axis=1).tolist()

    if len(row_means) < 2:
        raise ValueError("Not enough data points for prediction. Need at least 2 rows.")

    # Train model
    model = train_linear_model(row_means)

    # Predict future values
    predictions = predict_with_model(model, len(row_means), years)

    # Format results
    results = []
    for i, pred in enumerate(predictions):
        results.append(f"Year {i + 1}: {round(pred, 2)}")

    avg_prediction = round(np.mean(predictions), 2)

    return f"Predicted Recovery Indicators:\n" + "\n".join(results) + f"\n\nAverage Predicted Value: {avg_prediction}"
