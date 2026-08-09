from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

from app.contact import ContactSubmissionError, send_contact_message
from app.obras import fetch_obra, fetch_obras

app = FastAPI(title="Albarracin")

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"

templates = Jinja2Templates(directory=TEMPLATES_DIR)

# Pages that can be served via /{page} (index is served at /).
PAGES = {"tienda", "producto", "contacto", "cartografias", "legales"}

# Categories the "Tienda" mega menu can filter the producto listing by.
CATEGORIES = {"escultura", "instalacion"}

app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")


class ContactMessage(BaseModel):
    """Payload submitted by the "contacto" page form."""

    name: str = Field(min_length=1)
    email: str = Field(min_length=1)
    subject: str = Field(min_length=1)
    message: str = Field(min_length=1)


@app.post("/api/contact", include_in_schema=False)
def submit_contact(payload: ContactMessage):
    """Forward the contact form submission to the upstream contact-messages API."""
    try:
        send_contact_message(payload.name, payload.email, payload.subject, payload.message)
    except ContactSubmissionError as exc:
        raise HTTPException(
            status_code=502, detail="No se pudo enviar el mensaje. Inténtalo de nuevo más tarde."
        ) from exc
    return {"ok": True}


@app.get("/", include_in_schema=False)
def home(request: Request):
    """Homepage with the obras carousel rendered server-side."""
    return templates.TemplateResponse(
        "index.html", {"request": request, "obras": fetch_obras()}
    )


@app.get("/{page}.html", include_in_schema=False)
def legacy_html(request: Request, page: str):
    """Redirect old .html URLs to their clean equivalents (301)."""
    target = "/" if page == "index" else f"/{page}"
    if request.url.query:
        target = f"{target}?{request.url.query}"
    return RedirectResponse(target, status_code=301)


@app.get("/{page}", include_in_schema=False)
def page(request: Request, page: str):
    if page not in PAGES:
        raise HTTPException(status_code=404)
    context = {"request": request}
    if page == "producto":
        category = (request.query_params.get("category") or "").strip().lower()
        if category not in CATEGORIES:
            category = None

        obra_id = request.query_params.get("obra")
        if category is None and obra_id:
            # Coming from a link that only carries the obra id (e.g. the
            # homepage carousel): resolve its category so the listing shown
            # matches the artwork the visitor picked.
            obra = fetch_obra(obra_id)
            obra_category = (obra or {}).get("category") or ""
            obra_category = obra_category.strip().lower()
            if obra_category in CATEGORIES:
                category = obra_category

        context["obras"] = fetch_obras(category=category)
    return templates.TemplateResponse(f"{page}.html", context)
