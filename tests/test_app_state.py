"""Review results survive widget reruns without another analysis request."""

from pathlib import Path
from unittest.mock import Mock

import pytest

pytest.importorskip("streamlit")
from streamlit.testing.v1 import AppTest

from tz_reviewer import analyzer


@pytest.fixture
def reviewed_app(monkeypatch):
    monkeypatch.setenv("TZR_PROVIDER", "offline")
    review = Mock(wraps=analyzer.review_document)
    monkeypatch.setattr(analyzer, "review_document", review)
    app = AppTest.from_file(str(Path(__file__).resolve().parents[1] / "app.py")).run()
    app.text_area(key="pasted").input("## Источники обогащения данных\n").run()
    check(app)
    assert not app.exception
    assert review.call_count == 1
    return app, review


def check(app):
    next(b for b in app.button if b.label == "🔍 Проверить ТЗ").click().run()


def test_download_rerun_and_category_filter_preserve_report(reviewed_app):
    app, review = reviewed_app
    original_markdown = app.code[-1].value
    original_metrics = [m.value for m in app.metric]
    assert app.get("download_button")
    # AppTest has no download click API; reproduce its full script rerun.
    app.run()
    category = next(s for s in app.selectbox if s.label == "Категория")
    category.select(category.options[1]).run()
    assert not app.exception
    assert review.call_count == 1
    assert [m.value for m in app.metric] == original_metrics
    assert app.code[-1].value == original_markdown
    assert app.get("download_button")
    assert any("Источники обогащения данных" in e.label for e in app.expander)


@pytest.mark.parametrize("replacement", ["", "## Общие сведения\nНовый документ."])
def test_changed_input_clears_previous_results(reviewed_app, replacement):
    app, review = reviewed_app
    app.text_area(key="pasted").input(replacement).run()
    assert not app.exception
    assert not app.metric
    assert not app.get("download_button")
    assert review.call_count == 1
    if replacement:
        check(app)
        assert not app.exception
        assert app.metric
        assert review.call_count == 2


def test_explicit_check_runs_analysis_again(reviewed_app):
    app, review = reviewed_app
    check(app)
    assert not app.exception
    assert review.call_count == 2
    assert app.metric
