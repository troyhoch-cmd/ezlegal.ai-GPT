"""Thin REST wrapper for the three scraper tables."""
from __future__ import annotations

import logging
from typing import Any

import requests

log = logging.getLogger(__name__)


class SupabaseScraperClient:
    """Writes to scraper_sources, legal_content, scraper_run_logs via PostgREST."""

    def __init__(self, url: str, service_role_key: str, timeout: int = 30):
        self.base = url.rstrip("/") + "/rest/v1"
        self.headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        self.timeout = timeout

    def _post(self, table: str, payload: dict | list, on_conflict: str | None = None) -> list[dict]:
        params = {"on_conflict": on_conflict} if on_conflict else None
        headers = dict(self.headers)
        if on_conflict:
            headers["Prefer"] = "return=representation,resolution=merge-duplicates"
        r = requests.post(
            f"{self.base}/{table}",
            json=payload,
            params=params,
            headers=headers,
            timeout=self.timeout,
        )
        r.raise_for_status()
        return r.json()

    def upsert_source(self, row: dict[str, Any]) -> dict:
        return self._post("scraper_sources", row, on_conflict="source_key")[0]

    def upsert_content(self, row: dict[str, Any]) -> dict:
        return self._post("legal_content", row, on_conflict="source_key,section_number")[0]

    def start_run(self, source_id: str, source_key: str, action: str) -> str:
        res = self._post(
            "scraper_run_logs",
            {
                "source_id": source_id,
                "source_key": source_key,
                "action": action,
                "status": "started",
            },
        )
        return res[0]["id"]

    def finish_run(self, run_id: str, patch: dict[str, Any]) -> None:
        r = requests.patch(
            f"{self.base}/scraper_run_logs",
            json=patch,
            params={"id": f"eq.{run_id}"},
            headers=self.headers,
            timeout=self.timeout,
        )
        r.raise_for_status()
