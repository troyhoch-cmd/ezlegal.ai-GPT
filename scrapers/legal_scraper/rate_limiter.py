"""Per-host minimum-delay rate limiter."""
from __future__ import annotations

import threading
import time
from collections import defaultdict
from urllib.parse import urlparse


class HostRateLimiter:
    def __init__(self, default_delay_seconds: float = 2.0):
        self.default_delay = default_delay_seconds
        self._last: dict[str, float] = defaultdict(float)
        self._lock = threading.Lock()
        self._overrides: dict[str, float] = {}

    def set_delay(self, url: str, seconds: float) -> None:
        host = urlparse(url).netloc
        self._overrides[host] = seconds

    def wait(self, url: str) -> None:
        host = urlparse(url).netloc
        delay = self._overrides.get(host, self.default_delay)
        with self._lock:
            elapsed = time.monotonic() - self._last[host]
            if elapsed < delay:
                time.sleep(delay - elapsed)
            self._last[host] = time.monotonic()
