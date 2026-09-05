"""Покрытие шаблона доступно в отдельной вкладке на всю ширину страницы."""

from pathlib import Path

import pytest

pytest.importorskip("streamlit")
from streamlit.testing.v1 import AppTest


@pytest.mark.parametrize("body, expected_label, expected_count", [
    ("", "пустой", "0/21"),
    ("НЕ ПРИМЕНИМО", "не применимо", "1/21"),
    ("Справочник регионов из системы учёта.", "заполнен", "1/21"),
])
def test_coverage_tab_shows_status_comment_and_matching_metric(monkeypatch, body, expected_label, expected_count):
    monkeypatch.setenv("TZR_PROVIDER", "offline")
    app = AppTest.from_file(str(Path(__file__).resolve().parents[1] / "app.py")).run()
    app.text_area(key="pasted").input(f"## Источники обогащения данных\n{body}").run()
    next(button for button in app.button if button.label == "🔍 Проверить ТЗ").click().run()
    assert not app.exception
    coverage = next(tab for tab in app.tabs if tab.label == "Покрытие шаблона")
    table = coverage.dataframe[0].value
    assert list(table.columns) == ["Раздел", "Статус", "Комментарий"]
    row = table.loc[table["Раздел"] == "Источники обогащения данных"].iloc[0]
    assert row["Статус"].endswith(expected_label)
    assert row["Комментарий"]
    assert next(metric for metric in app.metric if metric.label == "Покрытие шаблона").value == expected_count
