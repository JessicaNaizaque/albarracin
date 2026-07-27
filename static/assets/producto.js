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
    const sizesWrap = document.getElementById("Medida");
    const tamanoLabel = detalle.querySelector(".tamanno label");
    const stockLabel = detalle.querySelector(".stock label");
    const colorSelector = document.getElementById("colorSelector");
    const colorDisable = document.getElementById("colorDisable");
    const addToCart = document.getElementById("addToCart");
    const guideTable = document.getElementById("guideTable");
    const openGuide = document.getElementById("openGuide");
    const sizeGuide = document.getElementById("sizeGuide");
    const closeDetalle = document.getElementById("closeDetalle");

    const state = {
        obra: null,
        sizes: [],
        size: null,
        variant: null,
        color: null,
        qty: 1,
    };

    // ---------- Helpers ----------

    function uniq(arr) {
        return [...new Set(arr)];
    }

    // Each size maps to its own variant, and colors are independent per
    // variant (available_colors / sold_units never mix across variants).
    function variantForSize(size) {
        if (!state.obra) return null;
        return (state.obra.variants || []).find((v) => v.size === size) || null;
    }

    function availableColorsFor(variant) {
        return (variant && variant.available_colors) || [];
    }

    function soldUnitsFor(variant) {
        const units = (variant && variant.sold_units) || [];
        return units
            .slice()
            .sort((a, b) => new Date(b.purchased_at) - new Date(a.purchased_at));
    }

    function isSameColor(a, b) {
        if (!a || !b) return false;
        if (a.id != null && b.id != null) return a.id === b.id;
        return (a.hex || "") === (b.hex || "") && (a.label || "") === (b.label || "");
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

    // Colors now arrive as { id, hex, label }; prefer the hex, falling back
    // to the label lookup for older/partial data.
    function colorCss(color) {
        if (!color) return "#999999";
        if (color.hex) return color.hex;
        return colorToCss(color.label || color.name || "");
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
        if (!sizesWrap) return;
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
                state.variant = variantForSize(size);
                sizesWrap.querySelectorAll("button").forEach(resetSizeBtn);
                markSizeBtn(btn);

                ensureColorForVariant();
                renderColors();
                renderGuide();
                updateAddToCart();
            });

            sizesWrap.appendChild(btn);
        });
    }

    // ---------- Tamaño / Stock ----------

    function renderSizeStock() {
        if (tamanoLabel) {
            tamanoLabel.textContent = state.size != null ? `${state.size} cm` : "";
        }
        if (stockLabel) {
            // Stock reflects the currently selected size's variant.
            const variant = state.variant;
            const total = variant ? Number(variant.quantity_available) || 0 : 0;
            stockLabel.textContent = `${total} disponible${total === 1 ? "" : "s"}`;
        }
    }

    // ---------- Colores ----------

    function ensureColorForVariant() {
        const colors = availableColorsFor(state.variant);
        if (colors.some((c) => isSameColor(c, state.color))) return;
        state.color = colors[0] || null;
    }

    function buildColorBtn(color) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "color-btn";
        btn.style.background = colorCss(color);
        btn.title = (color && color.label) || "";
        return btn;
    }

    function buildSoldColorBtn(unit) {
        const color = unit && unit.color;
        const btn = buildColorBtn(color);
        btn.classList.add("agotado");
        btn.disabled = true;

        const label = (color && color.label) || "";
        const date = unit && unit.purchased_at
            ? new Date(unit.purchased_at).toLocaleDateString("es-CO")
            : "";
        btn.title = [label, date].filter(Boolean).join(" · ");

        return btn;
    }

    function renderColors() {
        renderSizeStock();

        if (colorSelector) colorSelector.innerHTML = "";
        if (colorDisable) colorDisable.innerHTML = "";

        // Colors available for purchase on this specific size/variant.
        availableColorsFor(state.variant).forEach((color) => {
            const btn = buildColorBtn(color);

            if (isSameColor(color, state.color)) {
                btn.classList.add("active");
            }

            btn.addEventListener("click", () => {
                state.color = color;
                if (colorSelector) {
                    colorSelector
                        .querySelectorAll(".color-btn")
                        .forEach((b) => b.classList.remove("active"));
                }
                btn.classList.add("active");

                categoria.textContent = color.label || "";
                updateAddToCart();
            });

            if (colorSelector) colorSelector.appendChild(btn);
        });

        // Already-sold units for this variant, most recently purchased first.
        soldUnitsFor(state.variant).forEach((unit) => {
            const btn = buildSoldColorBtn(unit);
            if (colorDisable) colorDisable.appendChild(btn);
        });

        categoria.textContent = (state.color && state.color.label) || "";
    }

    // ---------- Guia de tamano (dinamica) ----------

    function renderGuide() {
        if (!guideTable) return;
        guideTable.innerHTML = "";

        state.sizes.forEach((size) => {
            const variant = variantForSize(size);
            const stock = variant
                ? Number(variant.quantity_available ?? variant.stock) || 0
                : 0;

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

    if (openGuide && sizeGuide) {
        openGuide.addEventListener("click", () => {
            sizeGuide.classList.toggle("active");
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

        const colorLabel = (state.color && state.color.label) || "";

        setText("cartTitle", obra.title || "");
        setText("cartArtist", (obra.artist && obra.artist.name) || "Christian Albarracín");
        setText("cartCategory", colorLabel);
        setText("cartQty", state.qty);
        setText("cartSize", state.size != null ? `${state.size} cm` : "");
        setText("cartColor", colorLabel);
        setText("cartPrice", unitStr);
        setText("cartSubtotal", lineStr);
        setText("cartTotal", lineStr);

        const cartImage = document.getElementById("cartImage");
        if (cartImage) cartImage.src = obra.cover_image || FALLBACK_IMG;
    }

    function updateAddToCart() {
        if (!addToCart) return;

        const obra = state.obra;
        const variant = state.variant;
        const obraOk = !!obra && obra.is_available !== false;
        const variantOk = !!variant && variant.is_available !== false;
        const variantQty = variant ? Number(variant.quantity_available) || 0 : 0;
        const needsColor = availableColorsFor(variant).length > 0 && !state.color;

        addToCart.disabled = !(obraOk && variantOk && variantQty > 0) || needsColor;
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
        state.size = state.sizes[0] || null;
        state.variant = variantForSize(state.size);
        state.color = availableColorsFor(state.variant)[0] || null;
        state.qty = 1;

        if (sizeGuide) sizeGuide.classList.remove("active");

        artista.textContent = (obra.artist && obra.artist.name) || "Christian Albarracin";
        titulo.textContent = obra.title || "";
        precio.textContent = money(obra);

        buildGallery(obra);
        renderSizes();
        renderColors();
        renderGuide();
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
