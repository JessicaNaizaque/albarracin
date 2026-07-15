"""Server-side fetching of the "obras" catalog for the homepage.

The homepage carousel is rendered server-side, so we fetch the available
artworks here (with httpx), cache them briefly in-memory, and fall back to an
empty list if the upstream API is unavailable so the page still loads.
"""

from __future__ import annotations

import logging
import os
import time

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

API_BASE_URL = os.environ["API_BASE_URL"].rstrip("/")
OBRAS_API = f"{API_BASE_URL}/catalog/artworks?status=available"

# Fetch just the first page (status=available). The catalog is small and the
# response has no pagination cursor, so a single request is sufficient.
REQUEST_TIMEOUT = 5.0
CACHE_TTL_SECONDS = 60.0

_cache: list[dict] | None = None
_cache_ts: float = 0.0


def fetch_obras() -> list[dict]:
    """Return the list of available obras (``json["data"]``).

    Results are cached in-memory for ``CACHE_TTL_SECONDS`` so every visitor
    does not trigger an upstream call. On any error (timeout, HTTP error,
    invalid JSON) the error is logged and an empty list is returned.
    """
    global _cache, _cache_ts

    now = time.monotonic()
    if _cache is not None and (now - _cache_ts) < CACHE_TTL_SECONDS:
        return _cache

    try:
        response = httpx.get(OBRAS_API, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        payload = response.json()
        data = payload.get("data", [])
        if not isinstance(data, list):
            data = []
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("Failed to fetch obras from %s: %s", OBRAS_API, exc)
        # Serve stale cache if we have one; otherwise render an empty carousel.
        return _cache if _cache is not None else []

    _cache = data
    _cache_ts = now
    return data
