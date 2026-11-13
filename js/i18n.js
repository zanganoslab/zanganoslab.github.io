/* ==========================================================
   Idiomas: español (original), inglés y portugués.
   - El idioma se elige con el selector ES · EN · PT del encabezado
     y queda en la dirección (?lang=en) y en el navegador.
   - Las traducciones están en js/trad-en.js y js/trad-pt.js.
   - Si un texto no tiene traducción, se muestra en español.
   ========================================================== */

const IDIOMAS = {
  es: { corto: "ES", nombre: "Español", locale: "es-AR" },
  en: { corto: "EN", nombre: "English", locale: "en-US" },
  pt: { corto: "PT", nombre: "Português", locale: "pt-BR" }
};

const LANG = (() => {
  const enUrl = new URLSearchParams(location.search).get("lang");
  if (IDIOMAS[enUrl]) {
    try { localStorage.setItem("idioma", enUrl); } catch (e) { /* navegación privada */ }
    return enUrl;
  }
  let guardado = null;
  try { guardado = localStorage.getItem("idioma"); } catch (e) { /* navegación privada */ }
  return IDIOMAS[guardado] ? guardado : "es";
})();

const normTexto = (s) => String(s).replace(/\s+/g, " ").trim();
const DICC = (LANG !== "es" && window.TRAD && TRAD[LANG]) || {};

/* Traduce un texto. vars reemplaza {n}, {t}, etc. */
function tr(s, vars) {
  if (s == null) return s;
  let out = LANG === "es" ? s : (DICC[normTexto(s)] ?? s);
  if (vars) out = out.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ""));
  return out;
}

/* Fecha larga en el idioma elegido (iso = "2026-08-17") */
function fechaLarga(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString(IDIOMAS[LANG].locale, { day: "numeric", month: "long", year: "numeric" });
}

/* Agrega ?lang= a los enlaces internos para que el idioma se mantenga al navegar */
function enlacesConIdioma(raiz = document) {
  if (LANG === "es") return;
  raiz.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!/^(index|noticia|mapa|juego)\.html/.test(href) || /[?&]lang=/.test(href)) return;
    const [ruta, hash] = href.split("#");
    a.setAttribute("href", ruta + (ruta.includes("?") ? "&" : "?") + "lang=" + LANG + (hash ? "#" + hash : ""));
  });
}

/* Textos fijos del HTML */
(function traducirPagina() {
  document.documentElement.lang = LANG;
  if (LANG !== "es") {
    const t = DICC[normTexto(document.title)];
    if (t) document.title = t;
    document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]').forEach((m) => {
      const v = DICC[normTexto(m.content)];
      if (v) m.content = v;
    });
    const selector = "h1,h2,h3,h4,p,li,a,button,b,span,small,summary,label,figcaption";
    document.querySelectorAll(selector).forEach((el) => {
      if (!el.isConnected) return; // ya reemplazado junto con su contenedor
      const v = DICC[normTexto(el.innerHTML)];
      if (v) el.innerHTML = v;
    });
    document.querySelectorAll("[placeholder],[aria-label],[alt]").forEach((el) => {
      ["placeholder", "aria-label", "alt"].forEach((at) => {
        const v = el.getAttribute(at) && DICC[normTexto(el.getAttribute(at))];
        if (v) el.setAttribute(at, v);
      });
    });
  }

  /* Selector de idioma en el encabezado */
  const nav = document.querySelector(".site-header .nav");
  if (!nav) return;
  const selectorIdioma = document.createElement("div");
  selectorIdioma.className = "idiomas";
  selectorIdioma.setAttribute("role", "group");
  selectorIdioma.setAttribute("aria-label", tr("Elegir idioma"));
  selectorIdioma.innerHTML = Object.entries(IDIOMAS).map(([cod, d]) => {
    const url = new URL(location.href);
    url.searchParams.set("lang", cod);
    return `<a href="${url.pathname.split("/").pop() + url.search + url.hash}" hreflang="${cod}" lang="${cod}" title="${d.nombre}"${cod === LANG ? ' aria-current="true"' : ""}>${d.corto}</a>`;
  }).join("");
  selectorIdioma.addEventListener("click", (e) => {
    const a = e.target.closest("a[hreflang]");
    if (a) { try { localStorage.setItem("idioma", a.getAttribute("hreflang")); } catch (err) { /* sin almacenamiento */ } }
  });
  nav.insertBefore(selectorIdioma, nav.querySelector(".nav-toggle"));
})();
