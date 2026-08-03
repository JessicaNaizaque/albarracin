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
ARTWORKS_API = f"{API_BASE_URL}/catalog/artworks"

# Fetch just the first page (status=available). The catalog is small and the
# response has no pagination cursor, so a single request is sufficient.
REQUEST_TIMEOUT = 5.0
CACHE_TTL_SECONDS = 60.0

# Keyed by category ("escultura", "instalacion", or None for "all"), so the
# tienda/producto pages can each be cached independently.
_cache: dict[str | None, list[dict]] = {}
_cache_ts: dict[str | None, float] = {}

_obra_cache: dict[str, tuple[dict | None, float]] = {}


def fetch_obras(category: str | None = None) -> list[dict]:
    """Return the list of available obras (``json["data"]``).

    ``category`` (e.g. "escultura" / "instalacion") is forwarded to the
    upstream API as a query param when provided, so the listing can be
    filtered by the menu selection.

    Results are cached in-memory per category for ``CACHE_TTL_SECONDS`` so
    every visitor does not trigger an upstream call. On any error (timeout,
    HTTP error, invalid JSON) the error is logged and an empty list is
    returned.
    """
    now = time.monotonic()
    cached = _cache.get(category)
    if cached is not None and (now - _cache_ts.get(category, 0.0)) < CACHE_TTL_SECONDS:
        return cached

    params = {"status": "available"}
    if category:
        params["category"] = category

    try:
        response = httpx.get(ARTWORKS_API, params=params, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        payload = response.json()
        data = payload.get("data", [])
        if not isinstance(data, list):
            data = []
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("Failed to fetch obras from %s (category=%s): %s", ARTWORKS_API, category, exc)
        # Serve stale cache if we have one; otherwise render an empty carousel.
        return _cache.get(category, [])

    _cache[category] = data
    _cache_ts[category] = now
    return data


def fetch_obra(obra_id: str) -> dict | None:
    """Return a single obra's detail (``json["data"]``) by id.

    Used to resolve an obra's category when arriving from a link that only
    carries the obra id (e.g. the homepage carousel), so ``/producto`` can
    load the listing filtered to that same category.
    """
    now = time.monotonic()
    cached = _obra_cache.get(obra_id)
    if cached is not None and (now - cached[1]) < CACHE_TTL_SECONDS:
        return cached[0]

    url = f"{ARTWORKS_API}/{obra_id}"
    try:
        response = httpx.get(url, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        payload = response.json()
        data = payload.get("data")
        if not isinstance(data, dict):
            data = None
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("Failed to fetch obra %s from %s: %s", obra_id, url, exc)
        return cached[0] if cached is not None else None

    _obra_cache[obra_id] = (data, now)
    return data
