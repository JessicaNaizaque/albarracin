# Albarracin (FastAPI, server-rendered obras)

Serves the Christian Albarracin site through FastAPI with clean URLs (no `.html`
extension). Here the obras are fetched **server-side** and rendered into the HTML 
via a Jinja2 loop, so the cards are present in the initial HTML response.

## Routes

| URL | Page |
| --- | --- |
| `/` | index |
| `/tienda` | tienda |
| `/producto` | producto |
| `/contacto` | contacto |
| `/cartografias` | cartografias |

Old `*.html` URLs 301-redirect to their clean equivalents (e.g. `/tienda.html` -> `/tienda`).
Assets are served from `/assets` via `StaticFiles`.

## Server-rendered obras

On each request to `/`, `app/obras.py` calls the catalog API with `httpx`:

```
GET {API_BASE_URL}/catalog/artworks?status=available
```

and returns `json["data"]`, which the html template loops over and show needed information.

Notes:

- **Caching:** the response is cached in-memory for ~60s so not every visitor
  triggers an upstream call.
- **Resilience:** on timeout / HTTP error / invalid JSON the error is logged and
  the page renders with an empty obras list (a stale cache is reused if present).
- **Pagination:** only the available (`status=available`) is fetched. The
  catalog is small and the response exposes no pagination cursor, so a single
  request is sufficient.

## Structure

```
albarracin/
  app/
    main.py        # FastAPI app: clean page routes + /assets mount + obras injection
    obras.py       # httpx fetch of catalog API, 60s in-memory cache, graceful fallback
  templates/       # Jinja2 templates (index.html renders obras via {% for %})
  static/
    assets/        # fonts, img, style.css, script.js, obras.js, (img ignored by .gitignore since those are large files)
  requirements.txt
  Dockerfile
```

## Run locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Then open http://localhost:8000/

## Run with Docker

```bash
docker build -t albarracin-python .
docker run -p 8000:8000 albarracin-python
```

Then open http://localhost:8000/
