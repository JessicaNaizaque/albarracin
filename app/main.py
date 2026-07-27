from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.obras import fetch_obras

app = FastAPI(title="Albarracin")

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"

templates = Jinja2Templates(directory=TEMPLATES_DIR)

# Pages that can be served via /{page} (index is served at /).
PAGES = {"tienda", "producto", "contacto", "cartografias", "legales"}

app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")


@app.get("/", include_in_schema=False)
def home(request: Request):
    """Homepage with the obras carousel rendered server-side."""
    return templates.TemplateResponse(
        "index.html", {"request": request, "obras": fetch_obras()}
    )


@app.get("/{page}.html", include_in_schema=False)
def legacy_html(page: str):
    """Redirect old .html URLs to their clean equivalents (301)."""
    if page == "index":
        return RedirectResponse("/", status_code=301)
    return RedirectResponse(f"/{page}", status_code=301)


@app.get("/{page}", include_in_schema=False)
def page(request: Request, page: str):
    if page not in PAGES:
        raise HTTPException(status_code=404)
    context = {"request": request}
    if page == "producto":
        context["obras"] = fetch_obras()
    return templates.TemplateResponse(f"{page}.html", context)
