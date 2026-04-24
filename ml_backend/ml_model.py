import numpy as np
from sklearn.linear_model import LinearRegression


def train_linear_model(values: list):
    """
    Train a simple linear regression model on a list of numeric values.
    Returns the trained model.
    """
    X = np.arange(len(values)).reshape(-1, 1)
    y = np.array(values)

    model = LinearRegression()
    model.fit(X, y)

    return model


def predict_with_model(model, start_index: int, num_years: int):
    """
    Use a trained model to predict future values.
    """
    future_X = np.arange(start_index, start_index + num_years).reshape(-1, 1)
    predictions = model.predict(future_X)
    return predictions.tolist()
