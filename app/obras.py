"""Server-side fetching of the "obras" catalog for the homepage.

The homepage carousel is rendered server-side, so we fetch the available
artworks here (with httpx) on every request, and fall back to an empty list
if the upstream API is unavailable so the page still loads.
"""

from __future__ import annotations

import logging
import os

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

API_BASE_URL = os.environ["API_BASE_URL"].rstrip("/")
ARTWORKS_API = f"{API_BASE_URL}/catalog/artworks"

# Fetch just the first page (status=available). The catalog is small and the
# response has no pagination cursor, so a single request is sufficient.
REQUEST_TIMEOUT = 5.0


def fetch_obras(category: str | None = None) -> list[dict]:
    """Return the list of available obras (``json["data"]``).

    ``category`` (e.g. "escultura" / "instalacion") is forwarded to the
    upstream API as a query param when provided, so the listing can be
    filtered by the menu selection.

    Always fetches fresh data from the upstream API (no caching). On any error (timeout, HTTP error,
    invalid JSON) the error is logged and an empty list is returned.
    """
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
        return []

    return data


def fetch_obra(obra_id: str) -> dict | None:
    """Return a single obra's detail (``json["data"]``) by id.

    Used to resolve an obra's category when arriving from a link that only
    carries the obra id (e.g. the homepage carousel), so ``/producto`` can
    load the listing filtered to that same category.

    Always fetches fresh data from the upstream API (no caching).
    """
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
        return None

    return data
