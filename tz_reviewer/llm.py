"""Провайдер-независимый клиент LLM.

Поддерживаются:
* ``anthropic`` — официальный SDK Anthropic (Claude);
* ``openai`` — официальный SDK OpenAI, в том числе против любого
  OpenAI-совместимого эндпоинта через ``base_url`` (OpenRouter, GigaChat-proxy,
  локальный vLLM/Ollama, внутренний контур);
* ``offline`` — клиент не используется (анализ идёт на эвристиках).

Каждый бэкенд вызывается через свой родной SDK; сырых HTTP-запросов нет.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field

from .config import Settings


@dataclass
class LLMResult:
    text: str
    provider: str
    model: str
    usage: dict = field(default_factory=dict)


class LLMError(RuntimeError):
    pass


class LLMClient:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.provider = settings.resolve_provider()
        self.model = settings.resolve_model()

    @property
    def available(self) -> bool:
        return self.provider in {"anthropic", "openai"}

    # ------------------------------------------------------------------ public
    def generate_json(self, system: str, user: str, *, repair_hint: str | None = None) -> dict:
        """Делает запрос и возвращает распарсенный JSON-объект.

        При неудачном парсинге — одна повторная попытка с уточняющей подсказкой.
        """

        raw = self._complete(system, user)
        data = _extract_json(raw.text)
        if data is None and repair_hint:
            raw = self._complete(system, user + "\n\n" + repair_hint)
            data = _extract_json(raw.text)
        if data is None:
            raise LLMError("Модель вернула ответ, который не удалось разобрать как JSON.")
        data.setdefault("_meta", {})
        data["_meta"] = {"provider": raw.provider, "model": raw.model, "usage": raw.usage}
        return data

    # ----------------------------------------------------------------- private
    def _complete(self, system: str, user: str) -> LLMResult:
        if self.provider == "anthropic":
            return self._complete_anthropic(system, user)
        if self.provider == "openai":
            return self._complete_openai(system, user)
        raise LLMError(f"Провайдер '{self.provider}' не поддерживает генерацию.")

    def _complete_anthropic(self, system: str, user: str) -> LLMResult:
        try:
            import anthropic
        except ImportError as exc:  # pragma: no cover
            raise LLMError("Установите пакет anthropic: pip install anthropic") from exc

        client = anthropic.Anthropic(api_key=self.settings.api_key, timeout=self.settings.timeout)
        try:
            message = client.messages.create(
                model=self.model,
                max_tokens=self.settings.max_tokens,
                system=system,
                messages=[{"role": "user", "content": user}],
            )
        except anthropic.APIError as exc:
            raise LLMError(f"Ошибка Anthropic API: {exc}") from exc

        text = "".join(getattr(b, "text", "") for b in message.content if getattr(b, "type", "") == "text")
        usage = {}
        if getattr(message, "usage", None):
            usage = {
                "input_tokens": getattr(message.usage, "input_tokens", None),
                "output_tokens": getattr(message.usage, "output_tokens", None),
            }
        return LLMResult(text=text, provider="anthropic", model=self.model, usage=usage)

    def _complete_openai(self, system: str, user: str) -> LLMResult:
        try:
            from openai import OpenAI
        except ImportError as exc:  # pragma: no cover
            raise LLMError("Установите пакет openai: pip install openai") from exc

        kwargs = {"api_key": self.settings.api_key, "timeout": self.settings.timeout}
        if self.settings.base_url:
            kwargs["base_url"] = self.settings.base_url
        client = OpenAI(**kwargs)

        messages = [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]
        common = {
            "model": self.model,
            "messages": messages,
            "temperature": self.settings.temperature,
            "max_tokens": self.settings.max_tokens,
        }
        try:
            try:
                resp = client.chat.completions.create(
                    **common, response_format={"type": "json_object"}
                )
            except Exception:
                # часть эндпоинтов/моделей не знает response_format — повторяем без него
                resp = client.chat.completions.create(**common)
        except Exception as exc:  # noqa: BLE001 - разные SDK-исключения у совместимых API
            raise LLMError(f"Ошибка OpenAI-совместимого API: {exc}") from exc

        choice = resp.choices[0]
        text = choice.message.content or ""
        usage = {}
        if getattr(resp, "usage", None):
            usage = {
                "input_tokens": getattr(resp.usage, "prompt_tokens", None),
                "output_tokens": getattr(resp.usage, "completion_tokens", None),
            }
        return LLMResult(text=text, provider="openai", model=self.model, usage=usage)


_JSON_FENCE = re.compile(r"```(?:json)?\s*(.+?)\s*```", re.DOTALL | re.IGNORECASE)


def _extract_json(text: str) -> dict | None:
    if not text:
        return None
    candidates: list[str] = []
    fenced = _JSON_FENCE.search(text)
    if fenced:
        candidates.append(fenced.group(1))
    candidates.append(text)
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidates.append(text[start : end + 1])

    for cand in candidates:
        cand = cand.strip()
        for attempt in (cand, cand.replace(",\n]", "\n]").replace(",\n}", "\n}")):
            try:
                parsed = json.loads(attempt)
            except json.JSONDecodeError:
                continue
            if isinstance(parsed, list):
                return {"findings": parsed}
            if isinstance(parsed, dict):
                return parsed
    return None
