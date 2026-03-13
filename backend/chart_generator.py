import plotly.express as px
import pandas as pd


def generate_bar_chart(df: pd.DataFrame, x_col: str, y_col: str, color_col: str = None, title: str = "Bar Chart"):
    """Generate a bar chart using Plotly."""
    fig = px.bar(
        df,
        x=x_col,
        y=y_col,
        color=color_col,
        title=title
    )
    fig.update_layout(
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
    )
    return fig


def generate_pie_chart(df: pd.DataFrame, names_col: str, title: str = "Pie Chart"):
    """Generate a donut/pie chart using Plotly."""
    fig = px.pie(
        df,
        names=names_col,
        hole=0.5,
        title=title
    )
    fig.update_layout(
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
    )
    return fig


def generate_line_chart(data, title: str = "Line Chart"):
    """Generate a line chart using Plotly."""
    fig = px.line(
        data,
        title=title
    )
    fig.update_layout(
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
    )
    return fig


def generate_box_chart(df: pd.DataFrame, x_col: str, y_col: str, title: str = "Box Chart"):
    """Generate a box plot using Plotly."""
    fig = px.box(
        df,
        x=x_col,
        y=y_col,
        title=title
    )
    fig.update_layout(
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
    )
    return fig
