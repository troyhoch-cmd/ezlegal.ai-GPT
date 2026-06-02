"""Config loader for per-state YAML files."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import yaml

CONFIG_DIR = Path(__file__).resolve().parent.parent / "config"


@dataclass
class RateLimit:
    requests_per_minute: int = 30
    min_delay_seconds: float = 2.0


@dataclass
class Target:
    name: str
    content_type: str
    start_url: str
    selectors: dict[str, str] = field(default_factory=dict)
    pagination: dict[str, Any] = field(default_factory=dict)


@dataclass
class StateConfig:
    source_key: str
    source_name: str
    jurisdiction: str
    source_type: str
    base_url: str
    update_frequency: str = "monthly"
    is_active: bool = True
    rate_limit: RateLimit = field(default_factory=RateLimit)
    content_types: list[str] = field(default_factory=list)
    targets: list[Target] = field(default_factory=list)

    @classmethod
    def from_file(cls, path: Path) -> "StateConfig":
        with path.open("r", encoding="utf-8") as fh:
            raw = yaml.safe_load(fh)
        rl = RateLimit(**raw.get("rate_limit", {}))
        targets = [Target(**t) for t in raw.get("targets", [])]
        return cls(
            source_key=raw["source_key"],
            source_name=raw["source_name"],
            jurisdiction=raw["jurisdiction"],
            source_type=raw["source_type"],
            base_url=raw["base_url"],
            update_frequency=raw.get("update_frequency", "monthly"),
            is_active=raw.get("is_active", True),
            rate_limit=rl,
            content_types=raw.get("content_types", []),
            targets=targets,
        )


def load_all_configs(config_dir: Path = CONFIG_DIR) -> list[StateConfig]:
    configs = []
    for path in sorted(config_dir.glob("*.yaml")):
        configs.append(StateConfig.from_file(path))
    return configs


def load_state(name: str, config_dir: Path = CONFIG_DIR) -> StateConfig:
    path = config_dir / f"{name.lower()}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"No config for state '{name}' at {path}")
    return StateConfig.from_file(path)


def env(name: str, default: str | None = None) -> str:
    value = os.environ.get(name, default)
    if value is None:
        raise RuntimeError(f"Missing required env var: {name}")
    return value
