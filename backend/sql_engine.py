import pandas as pd
import sqlite3
import io


def dataframe_to_sql(df: pd.DataFrame, table_name: str = "healthcare_data") -> sqlite3.Connection:
    """
    Convert a pandas DataFrame to an in-memory SQLite database.
    Returns the connection object.
    """
    conn = sqlite3.connect(":memory:")
    df.to_sql(table_name, conn, index=False, if_exists="replace")
    return conn


def run_query(conn: sqlite3.Connection, query: str) -> pd.DataFrame:
    """
    Execute a SQL query on the given connection and return results as a DataFrame.
    """
    try:
        result = pd.read_sql_query(query, conn)
        return result
    except Exception as e:
        raise ValueError(f"SQL Query Error: {e}")


def get_table_info(conn: sqlite3.Connection, table_name: str = "healthcare_data") -> str:
    """
    Get table schema information.
    """
    query = f"PRAGMA table_info({table_name})"
    info = pd.read_sql_query(query, conn)
    columns = []
    for _, row in info.iterrows():
        columns.append(f"  {row['name']} ({row['type']})")
    return f"Table: {table_name}\nColumns:\n" + "\n".join(columns)


def query_dataset(df: pd.DataFrame, sql_query: str, table_name: str = "healthcare_data") -> pd.DataFrame:
    """
    Convenience function: load DataFrame into SQLite and run a query.
    """
    conn = dataframe_to_sql(df, table_name)
    try:
        result = run_query(conn, sql_query)
        return result
    finally:
        conn.close()
