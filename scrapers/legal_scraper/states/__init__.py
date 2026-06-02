"""Per-state scraper implementations."""
from __future__ import annotations

from ..base import BaseStateScraper
from ..config import StateConfig
from .generic import GenericConfigScraper
from .arizona import ArizonaScraper

_REGISTRY: dict[str, type[BaseStateScraper]] = {
    "az_ars": ArizonaScraper,
}


def build_scraper(config: StateConfig, user_agent: str) -> BaseStateScraper:
    cls = _REGISTRY.get(config.source_key, GenericConfigScraper)
    return cls(config, user_agent=user_agent)
