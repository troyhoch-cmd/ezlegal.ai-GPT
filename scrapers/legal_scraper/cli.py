"""Command-line entry point."""
from __future__ import annotations

import logging
import os
import sys

import click
from dotenv import load_dotenv
from rich.console import Console
from rich.logging import RichHandler
from rich.table import Table

from .config import env, load_all_configs, load_state
from .pipeline import register_source, run_state
from .supabase_client import SupabaseScraperClient

console = Console()
load_dotenv()


def _init_logging(level: str) -> None:
    logging.basicConfig(
        level=level.upper(),
        format="%(message)s",
        datefmt="[%X]",
        handlers=[RichHandler(console=console, rich_tracebacks=True)],
    )


def _client() -> SupabaseScraperClient:
    return SupabaseScraperClient(
        url=env("SUPABASE_URL"),
        service_role_key=env("SUPABASE_SERVICE_ROLE_KEY"),
    )


def _user_agent() -> str:
    return os.environ.get("SCRAPER_USER_AGENT", "ezLegalScraper/1.0 (+contact@ezlegal.ai)")


@click.group()
@click.option("--log-level", default="INFO")
def cli(log_level: str) -> None:
    _init_logging(log_level)


@cli.command("list")
def list_sources() -> None:
    """List configured sources."""
    table = Table("source_key", "jurisdiction", "type", "frequency", "active")
    for cfg in load_all_configs():
        table.add_row(cfg.source_key, cfg.jurisdiction, cfg.source_type, cfg.update_frequency, str(cfg.is_active))
    console.print(table)


@cli.command("register")
@click.option("--state", required=True)
def register(state: str) -> None:
    """Upsert a state into scraper_sources without scraping."""
    cfg = load_state(state)
    src_id = register_source(_client(), cfg)
    console.print(f"Registered {cfg.source_key} -> {src_id}")


@cli.command("run")
@click.option("--state", help="Config basename, e.g. arizona")
@click.option("--all", "all_states", is_flag=True, default=False)
@click.option("--type", "content_type", default=None, help="Filter by content_type")
@click.option("--dry-run", is_flag=True, default=False)
@click.option("--max-records", type=int, default=None)
def run(state: str | None, all_states: bool, content_type: str | None, dry_run: bool, max_records: int | None) -> None:
    """Run a scrape for one state or all configured states."""
    if not state and not all_states:
        console.print("[red]Provide --state or --all[/red]")
        sys.exit(2)

    configs = load_all_configs() if all_states else [load_state(state)]
    client = None if dry_run else _client()
    ua = _user_agent()

    summary = Table("state", "processed", "added", "updated", "failed", "errors")
    for cfg in configs:
        if content_type:
            cfg.targets = [t for t in cfg.targets if t.content_type == content_type]
            if not cfg.targets:
                continue
        stats = run_state(client, cfg, user_agent=ua, dry_run=dry_run, max_records=max_records)
        summary.add_row(
            cfg.source_key,
            str(stats.processed),
            str(stats.added),
            str(stats.updated),
            str(stats.failed),
            str(len(stats.errors)),
        )
    console.print(summary)


if __name__ == "__main__":
    cli()
