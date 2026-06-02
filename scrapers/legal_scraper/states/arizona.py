"""Arizona Revised Statutes (ARS) reference implementation.

Demonstrates overriding the generic parser for a site-specific shape.
"""
from __future__ import annotations

import logging
from typing import Iterable
from urllib.parse import urljoin

from ..base import BaseStateScraper
from ..config import Target
from ..normalizer import LegalRecord

log = logging.getLogger(__name__)


class ArizonaScraper(BaseStateScraper):
    def scrape_target(self, target: Target) -> Iterable[LegalRecord]:
        index = self._soup(target.start_url)
        title_links = [a for a in index.select("a[href*='arsDetail']") if a.get("href")]
        log.info("Arizona: found %d section links", len(title_links))

        for link in title_links:
            url = urljoin(target.start_url, link.get("href", ""))
            try:
                page = self._soup(url)
            except Exception as exc:
                log.warning("Skip %s: %s", url, exc)
                continue

            heading = page.find(["h2", "h3"])
            if not heading:
                continue
            section_number = heading.get_text(strip=True).split(" ", 1)[0]
            section_title = heading.get_text(" ", strip=True)
            body = page.select_one("div.section-body") or page.select_one("main") or page
            content = body.get_text(" ", strip=True)

            rec = LegalRecord(
                source_key=self.config.source_key,
                jurisdiction="AZ",
                content_type=target.content_type,
                section_number=section_number,
                section_title=section_title,
                content=content,
                url=url,
            )
            rec.finalize()
            if rec.is_valid():
                yield rec
