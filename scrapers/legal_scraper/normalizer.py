"""Content cleaning + standard record shape matching legal_content schema."""
from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass, field, asdict
from datetime import date

_WHITESPACE = re.compile(r"\s+")
_CITATION = re.compile(r"([A-Z]{2,}\s?§\s?\d+[\w\.\-]*)")


def clean_text(raw: str) -> str:
    if not raw:
        return ""
    return _WHITESPACE.sub(" ", raw).strip()


def hash_version(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def extract_citations(text: str) -> list[str]:
    return sorted(set(_CITATION.findall(text)))


@dataclass
class LegalRecord:
    """Matches the legal_content row shape."""
    source_key: str
    jurisdiction: str
    content_type: str
    section_number: str
    section_title: str = ""
    title_number: str = ""
    title_name: str = ""
    content: str = ""
    summary: str = ""
    url: str = ""
    effective_date: date | None = None
    last_amended: date | None = None
    practice_areas: list[str] = field(default_factory=list)
    keywords: list[str] = field(default_factory=list)
    related_sections: list[str] = field(default_factory=list)
    is_active: bool = True
    version_hash: str = ""

    def finalize(self) -> None:
        self.content = clean_text(self.content)
        self.section_title = clean_text(self.section_title)
        if not self.version_hash and self.content:
            self.version_hash = hash_version(self.content)
        if self.content and not self.related_sections:
            self.related_sections = extract_citations(self.content)

    def to_row(self) -> dict:
        d = asdict(self)
        for k in ("effective_date", "last_amended"):
            if d[k]:
                d[k] = d[k].isoformat()
        return d

    def is_valid(self) -> bool:
        return bool(self.source_key and self.section_number and self.content)
