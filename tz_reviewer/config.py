"""Конфигурация ТЗ-Ревьюера.

Все параметры читаются из переменных окружения (можно положить в файл ``.env``).
Инструмент провайдер-независимый: работает с Anthropic API, с любым
OpenAI-совместимым эндпоинтом (OpenRouter, GigaChat-proxy, локальный vLLM/Ollama,
внутренний контур МТС) и в полностью офлайн-режиме на эвристиках.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

try:  # .env необязателен
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # pragma: no cover - dotenv может быть не установлен
    pass

PACKAGE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = PACKAGE_DIR.parent
KNOWLEDGE_DIR = PROJECT_ROOT / "knowledge"
OUTPUT_DIR = PROJECT_ROOT / "out"
EXAMPLES_DIR = PROJECT_ROOT / "examples"

PROVIDERS = ("auto", "anthropic", "openai", "offline")


def _first_env(*names: str, default: str = "") -> str:
    for name in names:
        value = os.getenv(name)
        if value:
            return value.strip()
    return default


@dataclass
class Settings:
    """Настройки запуска анализа."""

    provider: str = field(default_factory=lambda: _first_env("TZR_PROVIDER", default="auto"))
    model: str = field(default_factory=lambda: _first_env("TZR_MODEL", default=""))
    api_key: str = field(
        default_factory=lambda: _first_env(
            "TZR_API_KEY", "ANTHROPIC_API_KEY", "OPENAI_API_KEY", "OPENROUTER_API_KEY"
        )
    )
    base_url: str = field(default_factory=lambda: _first_env("TZR_BASE_URL", "OPENAI_BASE_URL"))
    max_tokens: int = field(default_factory=lambda: int(_first_env("TZR_MAX_TOKENS", default="16000")))
    temperature: float = field(
        default_factory=lambda: float(_first_env("TZR_TEMPERATURE", default="0.2"))
    )
    timeout: int = field(default_factory=lambda: int(_first_env("TZR_TIMEOUT", default="180")))
    per_section: bool = field(
        default_factory=lambda: _first_env("TZR_PER_SECTION", default="0") in {"1", "true", "yes"}
    )
    knowledge_dir: Path = KNOWLEDGE_DIR

    # ------------------------------------------------------------------ helpers
    def resolve_provider(self) -> str:
        """Определяет фактического провайдера с учётом ``auto`` и наличия ключа."""

        provider = (self.provider or "auto").lower()
        if provider not in PROVIDERS:
            provider = "auto"
        if provider != "auto":
            if provider in {"anthropic", "openai"} and not self.api_key:
                return "offline"
            return provider

        if not self.api_key:
            return "offline"
        if self.base_url:
            return "openai"
        if self.api_key.startswith("sk-ant-"):
            return "anthropic"
        if self.api_key.startswith(("sk-or-", "sk-proj-", "sk-")):
            return "openai"
        return "anthropic"

    def resolve_model(self) -> str:
        if self.model:
            return self.model
        provider = self.resolve_provider()
        if provider == "anthropic":
            return "claude-opus-5"
        if provider == "openai":
            return "gpt-4o-mini"
        return "offline"

    @property
    def is_offline(self) -> bool:
        return self.resolve_provider() == "offline"

    def describe(self) -> str:
        provider = self.resolve_provider()
        if provider == "offline":
            return "offline (эвристики + покрытие шаблона, без LLM)"
        return f"{provider} / {self.resolve_model()}"
