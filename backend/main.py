"""
Main entry point for the backend.
This module can be used to run the backend as a standalone service
or to initialize components when imported.
"""

from backend.ai_agent import ask_ai
from backend.predictor import predict_future
from backend.chart_generator import (
    generate_bar_chart,
    generate_pie_chart,
    generate_line_chart,
    generate_box_chart,
)

__all__ = [
    "ask_ai",
    "predict_future",
    "generate_bar_chart",
    "generate_pie_chart",
    "generate_line_chart",
    "generate_box_chart",
]


if __name__ == "__main__":
    print("Healthcare Analytics Backend initialized.")
    print("Available modules: ai_agent, predictor, chart_generator, ml_model, sql_engine")
