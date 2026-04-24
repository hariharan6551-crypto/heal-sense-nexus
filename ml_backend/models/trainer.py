"""
Model Training & Evaluation Module
====================================
Logistic Regression + Random Forest with cross-validation and hyperparameter tuning.
"""
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, confusion_matrix
)


RANDOM_STATE = 42


def train_logistic_regression(X_train, y_train, tune: bool = True):
    """Train Logistic Regression with optional hyperparameter tuning."""
    if tune:
        param_grid = {'C': [0.01, 0.1, 1.0, 10.0], 'penalty': ['l2']}
        grid = GridSearchCV(
            LogisticRegression(max_iter=1000, random_state=RANDOM_STATE),
            param_grid, cv=5, scoring='roc_auc', n_jobs=-1
        )
        grid.fit(X_train, y_train)
        print(f"   LR best params: {grid.best_params_} (AUC: {grid.best_score_:.4f})")
        return grid.best_estimator_
    else:
        model = LogisticRegression(max_iter=1000, random_state=RANDOM_STATE)
        model.fit(X_train, y_train)
        return model


def train_random_forest(X_train, y_train, tune: bool = True):
    """Train Random Forest with optional hyperparameter tuning."""
    if tune:
        param_grid = {
            'n_estimators': [50, 100, 200],
            'max_depth': [5, 10, 15],
            'min_samples_split': [2, 5]
        }
        grid = GridSearchCV(
            RandomForestClassifier(random_state=RANDOM_STATE),
            param_grid, cv=5, scoring='roc_auc', n_jobs=-1
        )
        grid.fit(X_train, y_train)
        print(f"   RF best params: {grid.best_params_} (AUC: {grid.best_score_:.4f})")
        return grid.best_estimator_
    else:
        model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=RANDOM_STATE)
        model.fit(X_train, y_train)
        return model


def evaluate_model(model, X_test, y_test) -> dict:
    """Evaluate model with AUC-ROC, Precision, Recall, F1, Confusion Matrix."""
    y_pred = model.predict(X_test)
    y_probs = model.predict_proba(X_test)[:, 1]
    cm = confusion_matrix(y_test, y_pred)

    return {
        'accuracy': round(float(accuracy_score(y_test, y_pred)), 4),
        'precision': round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
        'recall': round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
        'f1Score': round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        'aucROC': round(float(roc_auc_score(y_test, y_probs)), 4),
        'confusionMatrix': {
            'tp': int(cm[1][1]), 'fp': int(cm[0][1]),
            'tn': int(cm[0][0]), 'fn': int(cm[1][0])
        }
    }


def cross_validate_model(model, X, y, cv: int = 5) -> dict:
    """Perform cross-validation and return mean scores."""
    scores = {
        'accuracy': cross_val_score(model, X, y, cv=cv, scoring='accuracy'),
        'roc_auc': cross_val_score(model, X, y, cv=cv, scoring='roc_auc'),
        'precision': cross_val_score(model, X, y, cv=cv, scoring='precision'),
        'recall': cross_val_score(model, X, y, cv=cv, scoring='recall'),
    }
    return {k: {'mean': round(float(v.mean()), 4), 'std': round(float(v.std()), 4)} for k, v in scores.items()}


def get_feature_importance(lr_model, rf_model, feature_names: list) -> list:
    """Combine LR weights + RF importance for final feature ranking."""
    lr_imp = np.abs(lr_model.coef_[0])
    rf_imp = rf_model.feature_importances_
    combined = 0.4 * (lr_imp / lr_imp.max()) + 0.6 * (rf_imp / rf_imp.max())

    return sorted(
        [{'feature': name, 'importance': round(float(imp) * 100, 1),
          'direction': 'increases_risk' if lr_model.coef_[0][i] > 0 else 'decreases_risk'}
         for i, (name, imp) in enumerate(zip(feature_names, combined))],
        key=lambda x: x['importance'], reverse=True
    )


def assign_risk_category(probability: float) -> tuple:
    """Convert probability to risk category."""
    if probability < 0.35:
        return 'LOW', '#10B981'
    elif probability < 0.65:
        return 'MEDIUM', '#F59E0B'
    return 'HIGH', '#EF4444'
