"""Config-driven scraper used when no custom subclass is registered."""
from __future__ import annotations

import logging
from typing import Iterable
from urllib.parse import urljoin

from ..base import BaseStateScraper
from ..config import Target
from ..normalizer import LegalRecord

log = logging.getLogger(__name__)


class GenericConfigScraper(BaseStateScraper):
    def scrape_target(self, target: Target) -> Iterable[LegalRecord]:
        sel = target.selectors
        try:
            soup = self._soup(target.start_url)
        except Exception as exc:
            log.error("Failed to load %s: %s", target.start_url, exc)
            return

        links = [a.get("href") for a in soup.select(sel.get("title_list", "a"))]
        for href in links:
            if not href:
                continue
            url = urljoin(target.start_url, href)
            try:
                page = self._soup(url)
            except Exception as exc:
                log.warning("Skip %s: %s", url, exc)
                continue

            section_number = self._text(page, sel.get("section_number"))
            section_title = self._text(page, sel.get("section_title"))
            content = self._text(page, sel.get("content"))
            if not section_number or not content:
                continue

            rec = LegalRecord(
                source_key=self.config.source_key,
                jurisdiction=self.config.jurisdiction,
                content_type=target.content_type,
                section_number=section_number,
                section_title=section_title,
                content=content,
                url=url,
            )
            rec.finalize()
            if rec.is_valid():
                yield rec

    @staticmethod
    def _text(soup, selector: str | None) -> str:
        if not selector:
            return ""
        node = soup.select_one(selector)
        return node.get_text(" ", strip=True) if node else ""
