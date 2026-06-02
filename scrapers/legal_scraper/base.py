"""BaseStateScraper: abstract HTTP + parsing scaffolding."""
from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from typing import Iterable

import requests
from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from .config import StateConfig, Target
from .normalizer import LegalRecord
from .rate_limiter import HostRateLimiter
from .robots import can_fetch

log = logging.getLogger(__name__)


class RobotsDisallowed(Exception):
    """Raised when robots.txt forbids access."""


class BaseStateScraper(ABC):
    def __init__(self, config: StateConfig, user_agent: str, limiter: HostRateLimiter | None = None):
        self.config = config
        self.user_agent = user_agent
        self.limiter = limiter or HostRateLimiter(config.rate_limit.min_delay_seconds)
        self.session = requests.Session()
        self.session.headers["User-Agent"] = user_agent
        self.session.headers["Accept"] = "text/html,application/xhtml+xml"

    # ----- HTTP ---------------------------------------------------------
    @retry(
        stop=stop_after_attempt(4),
        wait=wait_exponential(multiplier=2, min=2, max=30),
        retry=retry_if_exception_type((requests.HTTPError, requests.ConnectionError, requests.Timeout)),
        reraise=True,
    )
    def _get(self, url: str) -> str:
        if not can_fetch(url, self.user_agent):
            raise RobotsDisallowed(f"robots.txt disallows {url}")
        self.limiter.wait(url)
        log.debug("GET %s", url)
        r = self.session.get(url, timeout=30)
        if r.status_code in (429, 503):
            r.raise_for_status()
        r.raise_for_status()
        return r.text

    def _soup(self, url: str) -> BeautifulSoup:
        return BeautifulSoup(self._get(url), "lxml")

    # ----- Subclass contract -------------------------------------------
    @abstractmethod
    def scrape_target(self, target: Target) -> Iterable[LegalRecord]:
        """Yield LegalRecord instances for one target."""

    # ----- Public entry -------------------------------------------------
    def scrape(self) -> Iterable[LegalRecord]:
        for target in self.config.targets:
            log.info("Scraping %s :: %s", self.config.source_key, target.name)
            yield from self.scrape_target(target)
