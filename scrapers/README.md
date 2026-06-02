# ezLegal Legal-Data Scraper Framework

A modular, ethical Python framework that collects state statutes, case law,
attorney-general opinions, and administrative regulations from all 50 US states
and persists them into the existing Supabase tables
(`scraper_sources`, `legal_content`, `scraper_run_logs`).

## Architecture

```
scrapers/
  config/                  # Per-state YAML configs (5 working samples)
    arizona.yaml
    california.yaml
    texas.yaml
    new_york.yaml
    florida.yaml
  legal_scraper/
    __init__.py
    config.py              # YAML loader + validation
    supabase_client.py     # Thin REST client for upsert + run logs
    robots.py              # robots.txt compliance check
    rate_limiter.py        # Per-host token bucket
    base.py                # BaseStateScraper abstract class
    normalizer.py          # Cleaning + standard record shape
    pipeline.py            # Orchestration, retry, change detection
    cli.py                 # Command-line interface (click)
    states/
      __init__.py
      arizona.py           # Reference implementation (ARS statutes)
      generic.py           # Fallback parser for config-driven states
  requirements.txt
  README.md
  .env.example
```

## Setup

```bash
cd scrapers
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # fill SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
```

## Usage

```bash
# List all registered sources
python -m legal_scraper.cli list

# Dry-run (no writes) a single state
python -m legal_scraper.cli run --state arizona --dry-run

# Scrape one content type for one state
python -m legal_scraper.cli run --state arizona --type statute

# Scrape all active sources
python -m legal_scraper.cli run --all
```

## Ethical Guidelines

1. **Always honor robots.txt.** `robots.py` checks every host before first fetch.
2. **Respect rate limits.** Default 1 request / 2 seconds per host; configurable.
3. **Identify ourselves.** User-Agent includes contact email.
4. **Only public sources.** No bypassing auth walls or paywalls.
5. **Idempotent writes.** Change detection via `version_hash`; unchanged rows are skipped.
6. **Retry with backoff.** Exponential backoff on 5xx/429 only.
7. **Audit trail.** Every run logged to `scraper_run_logs`.

## Integration with the Node/React app

The React app reads directly from `legal_content` via the existing Supabase
client (`src/lib/supabase.ts`) and the `ars-scraper` / `legal-scraper` edge
functions. This Python framework shares the same schema; no code changes are
required in the web app.

## Adding a new state

1. Copy `config/arizona.yaml` to `config/<state>.yaml`
2. Update `jurisdiction`, `base_url`, selectors, and content types
3. Register the source (`python -m legal_scraper.cli register --state <state>`)
4. For custom parsing, drop a file in `legal_scraper/states/<state>.py`
   extending `BaseStateScraper`; otherwise the generic config-driven parser
   handles it.
