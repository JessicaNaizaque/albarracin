/* ============================================
   PRODUCTO.JS
   Drives the producto detail panel from the obras
   data embedded server-side (#obras-data). No extra
   API calls: the catalog list already carries the
   full detail (artist, variants, images).
============================================ */

(function () {
    const dataEl = document.getElementById("obras-data");
    const detalle = document.getElementById("obra-detalle");

    if (!dataEl || !detalle) return;

    const FALLBACK_IMG = "assets/img/sujeto-ciudad-35.png";

    let obras = [];
    try {
        obras = JSON.parse(dataEl.textContent) || [];
    } catch (err) {
        console.error("No se pudo leer obras-data:", err);
        obras = [];
    }

    const obrasById = {};
    obras.forEach((o) => {
        obrasById[String(o.id)] = o;
    });

    // ---------- Referencias ----------

    const viewer = document.getElementById("viewer");
    const thumbGrid = detalle.querySelector(".thumb-grid");
    const artista = detalle.querySelector(".artista");
    const titulo = detalle.querySelector("h2");
    const categoria = detalle.querySelector(".categoria");
    const precio = detalle.querySelector(".precio");
    const sizesWrap = detalle.querySelector(".sizes");
    const colorSelector = document.getElementById("colorSelector");
    const qtyWrap = detalle.querySelector(".qty");
    const qtyValue = qtyWrap ? qtyWrap.querySelector("span") : null;
    const qtyButtons = qtyWrap ? qtyWrap.querySelectorAll("button") : [];
    const addToCart = document.getElementById("addToCart");
    const guideTable = document.getElementById("guideTable");
    const closeDetalle = document.getElementById("closeDetalle");

    const state = {
        obra: null,
        sizes: [],
        colors: [],
        size: null,
        color: null,
        qty: 1,
    };

    // ---------- Helpers ----------

    function uniq(arr) {
        return [...new Set(arr)];
    }

    function variantFor(size, color) {
        if (!state.obra) return null;
        return (state.obra.variants || []).find(
            (v) => v.size === size && v.color === color
        ) || null;
    }

    function stockOf(size, color) {
        const v = variantFor(size, color);
        return v ? Number(v.stock) || 0 : 0;
    }

    function money(obra) {
        return `${obra.price} ${obra.currency || ""}`.trim();
    }

    // Color names come as Spanish labels (e.g. "Amarillo"); map the common
    // ones to CSS colors, otherwise try the raw value, else fall back to grey.
    const COLOR_MAP = {
        amarillo: "#f2c200",
        negro: "#111111",
        blanco: "#f5f5f5",
        gris: "#7d7d7d",
        rojo: "#c0392b",
        azul: "#1b3a8f",
        verde: "#1e7d32",
        cedro: "#9a6b3f",
        cafe: "#6f4e37",
        marron: "#6f4e37",
        naranja: "#e67e22",
        rosa: "#e91e63",
        morado: "#6a1b9a",
        purpura: "#6a1b9a",
        violeta: "#7b2ff7",
        dorado: "#c9a227",
        plateado: "#bdc3c7",
        beige: "#e0cda9",
    };

    function isValidCssColor(str) {
        const probe = new Option().style;
        probe.color = "";
        probe.color = str;
        return probe.color !== "";
    }

    function colorToCss(name) {
        if (!name) return "#999999";
        const key = name
            .toString()
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        if (COLOR_MAP[key]) return COLOR_MAP[key];
        if (isValidCssColor(name)) return name;
        return "#999999";
    }

    // ---------- Galeria ----------

    function setViewerImage(src) {
        viewer.innerHTML = `<img src="${src}" alt="">`;
    }

    function buildGallery(obra) {
        thumbGrid.innerHTML = "";

        const cover = obra.cover_image || FALLBACK_IMG;
        const images = uniq(
            [cover].concat((obra.images || []).map((im) => im && im.url).filter(Boolean))
        );

        setViewerImage(images[0]);

        images.forEach((src, index) => {
            const thumb = document.createElement("button");
            thumb.type = "button";
            thumb.className = "thumb" + (index === 0 ? " active" : "");
            thumb.innerHTML = `<img src="${src}" alt="">`;

            thumb.addEventListener("click", () => {
                setViewerImage(src);
                thumbGrid
                    .querySelectorAll(".thumb")
                    .forEach((t) => t.classList.remove("active"));
                thumb.classList.add("active");
            });

            thumbGrid.appendChild(thumb);
        });
    }

    // ---------- Tallas ----------

    function resetSizeBtn(btn) {
        btn.style.background = "none";
        btn.style.color = "";
        btn.style.borderColor = "#7d7d7d";
    }

    function markSizeBtn(btn) {
        btn.style.background = "#595552";
        btn.style.color = "#fff";
        btn.style.borderColor = "#595552";
    }

    function renderSizes() {
        sizesWrap.innerHTML = "";

        state.sizes.forEach((size) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = `${size} cm`;

            if (size === state.size) {
                markSizeBtn(btn);
            } else {
                resetSizeBtn(btn);
            }

            btn.addEventListener("click", () => {
                state.size = size;
                sizesWrap.querySelectorAll("button").forEach(resetSizeBtn);
                markSizeBtn(btn);

                ensureColorForSize();
                renderColors();
                renderGuide();
                clampQty();
                updateAddToCart();
            });

            sizesWrap.appendChild(btn);
        });
    }

    // ---------- Colores ----------

    function ensureColorForSize() {
        if (stockOf(state.size, state.color) > 0) return;
        const alt = state.colors.find((c) => stockOf(state.size, c) > 0);
        if (alt) state.color = alt;
    }

    function renderColors() {
        colorSelector.innerHTML = "";

        state.colors.forEach((color) => {
            const stock = stockOf(state.size, color);

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "color-btn";
            btn.style.background = colorToCss(color);
            btn.title = color;

            const num = document.createElement("span");
            num.className = "color-num";
            num.textContent = stock;
            btn.appendChild(num);

            if (stock <= 0) {
                btn.classList.add("agotado");
                btn.disabled = true;
            }

            if (color === state.color && stock > 0) {
                btn.classList.add("active");
            }

            btn.addEventListener("click", () => {
                if (stock <= 0) return;
                state.color = color;
                colorSelector
                    .querySelectorAll(".color-btn")
                    .forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");

                categoria.textContent = color;
                renderGuide();
                clampQty();
                updateAddToCart();
            });

            colorSelector.appendChild(btn);
        });

        categoria.textContent = state.color || "";
    }

    // ---------- Cantidad ----------

    function clampQty() {
        const max = stockOf(state.size, state.color);
        if (max <= 0) {
            state.qty = 1;
        } else {
            state.qty = Math.min(Math.max(1, state.qty), max);
        }
        if (qtyValue) qtyValue.textContent = state.qty;
    }

    function setQty(next) {
        const max = stockOf(state.size, state.color);
        if (max <= 0) return;
        state.qty = Math.min(Math.max(1, next), max);
        if (qtyValue) qtyValue.textContent = state.qty;
    }

    if (qtyButtons.length === 2) {
        qtyButtons[0].addEventListener("click", () => setQty(state.qty - 1));
        qtyButtons[1].addEventListener("click", () => setQty(state.qty + 1));
    }

    // ---------- Guia de tamano (dinamica) ----------

    function renderGuide() {
        if (!guideTable) return;
        guideTable.innerHTML = "";

        state.sizes.forEach((size) => {
            const stock = stockOf(size, state.color);

            const fila = document.createElement("div");
            fila.className = "guide-row";
            fila.innerHTML =
                `<div class="guide-size">${size} cm</div>` +
                `<div class="guide-boxes"></div>`;

            const cajas = fila.querySelector(".guide-boxes");

            if (stock > 0) {
                for (let i = 0; i < stock; i++) {
                    const box = document.createElement("div");
                    box.className = "guide-item disponible";
                    box.textContent = i + 1;
                    cajas.appendChild(box);
                }
            } else {
                const box = document.createElement("div");
                box.className = "guide-item vendido";
                box.textContent = "0";
                cajas.appendChild(box);
            }

            guideTable.appendChild(fila);
        });
    }

    // ---------- Carrito ----------

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function populateCart() {
        const obra = state.obra;
        if (!obra) return;

        const unit = Number(obra.price) || 0;
        const line = unit * state.qty;
        const unitStr = `${unit} ${obra.currency || ""}`.trim();
        const lineStr = `${line} ${obra.currency || ""}`.trim();

        setText("cartTitle", obra.title || "");
        setText("cartArtist", (obra.artist && obra.artist.name) || "Christian Albarracín");
        setText("cartCategory", state.color || "");
        setText("cartQty", state.qty);
        setText("cartSize", state.size != null ? `${state.size} cm` : "");
        setText("cartColor", state.color || "");
        setText("cartPrice", unitStr);
        setText("cartSubtotal", lineStr);
        setText("cartTotal", lineStr);

        const cartImage = document.getElementById("cartImage");
        if (cartImage) cartImage.src = obra.cover_image || FALLBACK_IMG;
    }

    function updateAddToCart() {
        if (!addToCart) return;
        addToCart.disabled = stockOf(state.size, state.color) <= 0;
    }

    if (addToCart) {
        addToCart.addEventListener("click", () => {
            if (addToCart.disabled) return;
            populateCart();
        });
    }

    // ---------- Abrir / cerrar detalle ----------

    function openObra(obra) {
        state.obra = obra;
        state.sizes = uniq(
            (obra.variants || [])
                .map((v) => v.size)
                .filter((v) => v !== null && v !== undefined && v !== "")
        );
        state.colors = uniq(
            (obra.variants || [])
                .map((v) => v.color)
                .filter((v) => v !== null && v !== undefined && v !== "")
        );
        state.size = state.sizes[0] || null;
        state.color =
            state.colors.find((c) => stockOf(state.size, c) > 0) ||
            state.colors[0] ||
            null;
        state.qty = 1;

        artista.textContent = (obra.artist && obra.artist.name) || "Christian Albarracin";
        titulo.textContent = obra.title || "";
        precio.textContent = money(obra);

        buildGallery(obra);
        renderSizes();
        renderColors();
        renderGuide();
        clampQty();
        updateAddToCart();
    }

    document.querySelectorAll(".obra-item").forEach((item) => {
        item.addEventListener("click", () => {
            const obra = obrasById[String(item.dataset.id)];
            if (!obra) return;

            openObra(obra);

            detalle.classList.add("active");
            detalle.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    if (closeDetalle) {
        closeDetalle.addEventListener("click", () => {
            detalle.classList.remove("active");
        });
    }

    // Auto-open a specific obra when arriving from /producto?obra={id}.
    const selectedId = new URLSearchParams(window.location.search).get("obra");

    if (selectedId && obrasById[String(selectedId)]) {
        openObra(obrasById[String(selectedId)]);
        detalle.classList.add("active");
        window.addEventListener("load", () => {
            detalle.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }
})();
