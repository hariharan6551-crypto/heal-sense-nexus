import pandas as pd


def ask_ai(question: str, df: pd.DataFrame) -> str:
    """
    Simple AI agent that answers questions about the dataset.
    Analyzes the dataframe based on keywords in the question.
    """
    question_lower = question.lower()
    numeric = df.select_dtypes(include="number")
    cat_cols = df.select_dtypes(include="object").columns

    # Row/column counts
    if "how many" in question_lower and ("row" in question_lower or "record" in question_lower or "patient" in question_lower):
        return f"The dataset contains {len(df)} rows and {len(df.columns)} columns."

    if "column" in question_lower or "feature" in question_lower:
        return f"Columns: {', '.join(df.columns.tolist())}"

    # Summary statistics
    if "summary" in question_lower or "describe" in question_lower or "statistics" in question_lower:
        if not numeric.empty:
            stats = numeric.describe().round(2).to_string()
            return f"Summary Statistics:\n{stats}"
        return "No numeric columns found for summary."

    # Average / Mean
    if "average" in question_lower or "mean" in question_lower:
        if not numeric.empty:
            means = numeric.mean().round(2).to_string()
            return f"Averages:\n{means}"
        return "No numeric columns to calculate averages."

    # Maximum
    if "max" in question_lower or "highest" in question_lower or "maximum" in question_lower:
        if not numeric.empty:
            maxs = numeric.max().to_string()
            return f"Maximum values:\n{maxs}"
        return "No numeric columns found."

    # Minimum
    if "min" in question_lower or "lowest" in question_lower or "minimum" in question_lower:
        if not numeric.empty:
            mins = numeric.min().to_string()
            return f"Minimum values:\n{mins}"
        return "No numeric columns found."

    # Missing values
    if "missing" in question_lower or "null" in question_lower or "empty" in question_lower:
        missing = df.isnull().sum()
        missing = missing[missing > 0]
        if len(missing) > 0:
            return f"Missing values:\n{missing.to_string()}"
        return "No missing values found in the dataset."

    # Correlation
    if "correlation" in question_lower or "correlate" in question_lower:
        if not numeric.empty and len(numeric.columns) > 1:
            corr = numeric.corr().round(2).to_string()
            return f"Correlation Matrix:\n{corr}"
        return "Not enough numeric columns for correlation analysis."

    # Categories / unique values
    if "unique" in question_lower or "categories" in question_lower or "category" in question_lower:
        if len(cat_cols) > 0:
            result = []
            for col in cat_cols:
                unique_vals = df[col].unique()[:10]
                result.append(f"{col}: {', '.join(map(str, unique_vals))} ({df[col].nunique()} unique)")
            return "Categorical columns:\n" + "\n".join(result)
        return "No categorical columns found."

    # Distribution
    if "distribution" in question_lower:
        if len(cat_cols) > 0:
            col = cat_cols[0]
            dist = df[col].value_counts().to_string()
            return f"Distribution of '{col}':\n{dist}"
        return "No categorical columns for distribution analysis."

    # Default response
    return (
        f"Dataset has {len(df)} rows and {len(df.columns)} columns. "
        f"Numeric columns: {', '.join(numeric.columns.tolist())}. "
        f"Categorical columns: {', '.join(cat_cols.tolist())}. "
        f"Try asking about: summary, average, max, min, missing values, correlation, categories, or distribution."
    )
