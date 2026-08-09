"""Server-side submission of the "contacto" form to the backend API."""

from __future__ import annotations

import logging

import httpx

from app.obras import API_BASE_URL

logger = logging.getLogger(__name__)

CONTACT_MESSAGES_API = f"{API_BASE_URL}/contact-messages"

REQUEST_TIMEOUT = 5.0


class ContactSubmissionError(Exception):
    """Raised when the upstream API rejects or fails to process a contact message."""


def send_contact_message(name: str, email: str, subject: str, message: str) -> None:
    """Forward the contact form data to the upstream contact-messages API.

    Raises ``ContactSubmissionError`` if the upstream request fails (timeout,
    network error, or a non-2xx response) so the caller can report the
    failure back to the visitor.
    """
    payload = {"name": name, "email": email, "subject": subject, "message": message}
    try:
        response = httpx.post(CONTACT_MESSAGES_API, json=payload, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        logger.warning("Failed to submit contact message to %s: %s", CONTACT_MESSAGES_API, exc)
        raise ContactSubmissionError from exc
