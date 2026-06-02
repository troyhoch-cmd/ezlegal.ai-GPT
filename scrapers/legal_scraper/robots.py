"""robots.txt compliance check."""
from __future__ import annotations

import logging
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

log = logging.getLogger(__name__)

_cache: dict[str, RobotFileParser] = {}


def _parser_for(host_url: str) -> RobotFileParser:
    if host_url in _cache:
        return _cache[host_url]
    rp = RobotFileParser()
    rp.set_url(host_url.rstrip("/") + "/robots.txt")
    try:
        rp.read()
    except Exception as exc:
        log.warning("robots.txt fetch failed for %s: %s", host_url, exc)
    _cache[host_url] = rp
    return rp


def can_fetch(url: str, user_agent: str) -> bool:
    parsed = urlparse(url)
    host_url = f"{parsed.scheme}://{parsed.netloc}"
    try:
        return _parser_for(host_url).can_fetch(user_agent, url)
    except Exception:
        return True
