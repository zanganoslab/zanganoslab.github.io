/* ==========================================================
   Página de una noticia: noticia.html?id=<id de la noticia>
   Toma el contenido de NOTICIAS en js/datos.js.
   ========================================================== */

const $ = (sel) => document.querySelector(sel);
const esc = (s = "") => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ESPECIES = /\b(Apis mellifera|A\. mellifera|Varroa destructor|V\. destructor|Nosema|Varroa|Apis)\b/g; // nombres científicos en cursiva
const cursiva = (s = "") => esc(s).replace(ESPECIES, "<i>$1</i>");
const fechaLarga = (iso) => {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
};

/* ---------- Menú móvil ---------- */
const toggle = $(".nav-toggle");
const menu = $("#menu");
toggle.addEventListener("click", () => {
  const abierto = menu.classList.toggle("abierto");
  toggle.setAttribute("aria-expanded", abierto);
});
$("#anio").textContent = new Date().getFullYear();

/* ---------- Noticia ---------- */
const ordenadas = [...NOTICIAS].sort((a, b) => b.fecha.localeCompare(a.fecha));
const id = new URLSearchParams(location.search).get("id");
const n = NOTICIAS.find((x) => x.id === id);

if (!n) {
  $("#articulo").innerHTML = `
    <h1>Noticia no encontrada</h1>
    <p>Puede que el enlace esté incompleto. Consulte las últimas noticias más abajo.</p>`;
} else {
  document.title = `${n.titulo} | Zánganos Lab`;
  document.querySelector('meta[name="description"]').setAttribute("content", n.resumen);
  const fotos = n.fotos || [];

  $("#articulo").innerHTML = `
    <p class="eyebrow">Noticias y eventos</p>
    <h1>${cursiva(n.titulo)}</h1>
    <time class="articulo-fecha" datetime="${esc(n.fecha)}">${fechaLarga(n.fecha)}</time>
    ${fotos[0] ? `<button class="articulo-portada" data-i="0" aria-label="Ampliar foto"><img src="${esc(fotos[0])}" alt="Foto principal de la noticia"></button>` : ""}
    <div class="articulo-texto">
      ${n.cuerpo.map((p) => `<p>${cursiva(p)}</p>`).join("")}
    </div>
    ${fotos.length > 1 ? `
      <h2 class="galeria-titulo">Galería <span>${fotos.length} fotos</span></h2>
      <div class="galeria">
        ${fotos.map((f, i) => `<button data-i="${i}" aria-label="Ampliar foto ${i + 1}"><img src="${esc(f)}" alt="Foto ${i + 1} de ${fotos.length}" loading="lazy"></button>`).join("")}
      </div>` : ""}
    ${n.instagram ? `<a class="ig-cta" href="${esc(n.instagram)}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4.3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.6" cy="6.4" r="1.3" fill="currentColor"/></svg>
        <span><b>Ver la publicación en Instagram</b>Comente y comparta en @zanganoslab.ier</span>
        <span class="ig-flecha" aria-hidden="true">↗</span>
      </a>` : ""}`;

  /* ---------- Visor de fotos ---------- */
  const visor = $("#visor");
  const visorImg = visor.querySelector("img");
  let actual = 0;
  const mostrar = (i) => {
    actual = (i + fotos.length) % fotos.length;
    visorImg.src = fotos[actual];
    visorImg.alt = `Foto ${actual + 1} de ${fotos.length}`;
    visor.querySelector(".visor-contador").textContent = `${actual + 1} / ${fotos.length}`;
  };
  const abrir = (i) => { mostrar(i); visor.hidden = false; document.body.style.overflow = "hidden"; visor.querySelector(".visor-cerrar").focus(); };
  const cerrar = () => { visor.hidden = true; document.body.style.overflow = ""; };
  visor.querySelectorAll(".visor-nav").forEach((b) => (b.hidden = fotos.length < 2));

  $("#articulo").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]");
    if (b) abrir(Number(b.dataset.i));
  });
  visor.querySelector(".visor-cerrar").addEventListener("click", cerrar);
  visor.querySelector(".visor-ant").addEventListener("click", () => mostrar(actual - 1));
  visor.querySelector(".visor-sig").addEventListener("click", () => mostrar(actual + 1));
  visor.addEventListener("click", (e) => { if (e.target === visor) cerrar(); });
  document.addEventListener("keydown", (e) => {
    if (visor.hidden) return;
    if (e.key === "Escape") cerrar();
    if (e.key === "ArrowLeft") mostrar(actual - 1);
    if (e.key === "ArrowRight") mostrar(actual + 1);
  });
  // Deslizar con el dedo en el celular
  let x0 = null;
  visor.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
  visor.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) mostrar(actual + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

/* ---------- Otras noticias ---------- */
$("#otras-noticias").innerHTML = ordenadas.filter((x) => x.id !== id).slice(0, 3).map((x) => `
  <a class="nota" href="noticia.html?id=${encodeURIComponent(x.id)}">
    ${x.fotos && x.fotos[0] ? `<img class="nota-portada" src="${esc(x.fotos[0])}" alt="" loading="lazy">` : `<div class="franja"></div>`}
    <div class="nota-body">
      <time datetime="${esc(x.fecha)}">${fechaLarga(x.fecha)}</time>
      <h3>${cursiva(x.titulo)}</h3>
      <span class="nota-mas">Leer nota →</span>
    </div>
  </a>`).join("");
