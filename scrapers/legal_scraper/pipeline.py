"""Orchestration: register source, run scrape, persist, log."""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field

from .config import StateConfig
from .states import build_scraper
from .supabase_client import SupabaseScraperClient

log = logging.getLogger(__name__)


@dataclass
class RunStats:
    processed: int = 0
    added: int = 0
    updated: int = 0
    failed: int = 0
    skipped: int = 0
    errors: list[str] = field(default_factory=list)


def register_source(client: SupabaseScraperClient, cfg: StateConfig) -> str:
    row = {
        "source_key": cfg.source_key,
        "source_name": cfg.source_name,
        "source_type": cfg.source_type,
        "jurisdiction": cfg.jurisdiction,
        "base_url": cfg.base_url,
        "update_frequency": cfg.update_frequency,
        "is_active": cfg.is_active,
        "scraper_config": {
            "rate_limit": {
                "requests_per_minute": cfg.rate_limit.requests_per_minute,
                "min_delay_seconds": cfg.rate_limit.min_delay_seconds,
            },
            "content_types": cfg.content_types,
        },
    }
    res = client.upsert_source(row)
    return res["id"]


def run_state(
    client: SupabaseScraperClient | None,
    cfg: StateConfig,
    user_agent: str,
    dry_run: bool = False,
    max_records: int | None = None,
) -> RunStats:
    stats = RunStats()
    source_id = None
    run_id = None

    if client and not dry_run:
        source_id = register_source(client, cfg)
        run_id = client.start_run(source_id, cfg.source_key, "scrape")

    started = time.monotonic()
    try:
        scraper = build_scraper(cfg, user_agent=user_agent)
        for i, rec in enumerate(scraper.scrape()):
            if max_records and i >= max_records:
                break
            stats.processed += 1
            if dry_run or not client:
                log.info("DRY-RUN %s %s %s", rec.source_key, rec.section_number, rec.section_title[:60])
                continue
            try:
                result = client.upsert_content(rec.to_row())
                if result.get("created_at") == result.get("updated_at"):
                    stats.added += 1
                else:
                    stats.updated += 1
            except Exception as exc:
                stats.failed += 1
                stats.errors.append(f"{rec.section_number}: {exc}")
                log.exception("Upsert failed for %s", rec.section_number)
    except Exception as exc:
        stats.errors.append(str(exc))
        log.exception("Run failed for %s", cfg.source_key)

    duration_ms = int((time.monotonic() - started) * 1000)
    if client and run_id and not dry_run:
        client.finish_run(run_id, {
            "status": "completed" if not stats.errors else ("partial" if stats.processed else "failed"),
            "sections_processed": stats.processed,
            "sections_added": stats.added,
            "sections_updated": stats.updated,
            "error_message": "; ".join(stats.errors[:3]) if stats.errors else None,
            "duration_ms": duration_ms,
            "completed_at": "now()",
        })
    return stats
