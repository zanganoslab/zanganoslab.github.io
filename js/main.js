/* ==========================================================
   Zánganos Lab — lógica del sitio
   (No hace falta tocar este archivo para cambiar contenido:
   edite js/datos.js)
   ========================================================== */

const $ = (sel) => document.querySelector(sel);
const esc = (s = "") => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Nombres científicos en cursiva (la abreviatura "L." y "sp." quedan en redonda, como indica la norma)
const ESPECIES = /\b(Apis mellifera|A\. mellifera|Varroa destructor|V\. destructor|Nosema|Varroa|Apis)\b/g;
const cursiva = (s = "") => esc(s).replace(ESPECIES, "<i>$1</i>");
const iniciales = (nombre) => nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

/* ---------- Menú móvil ---------- */
const toggle = $(".nav-toggle");
const menu = $("#menu");
toggle.addEventListener("click", () => {
  const abierto = menu.classList.toggle("abierto");
  toggle.setAttribute("aria-expanded", abierto);
});
menu.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    menu.classList.remove("abierto");
    toggle.setAttribute("aria-expanded", "false");
  }
});

/* ---------- Cifras del hero ---------- */
const anios = PUBLICACIONES.map((p) => p.anio);
$("#stats").innerHTML = [
  [PUBLICACIONES.length, "publicaciones científicas"],
  [EQUIPO.length, "integrantes del equipo"],
  [COLABORADORES.length, "colaboradores externos"],
  [`${Math.min(...anios)}`, "primera ACZ reportada en Argentina"]
].map(([n, t]) => `<div class="stat reveal"><b>${n}</b><span>${t}</span></div>`).join("");

/* ---------- Líneas de investigación ---------- */
$("#lineas").innerHTML = LINEAS.map((l) => `
  <article class="card reveal">
    <div class="icono" aria-hidden="true">${l.icono}</div>
    <h3>${esc(l.titulo)}</h3>
    <p>${cursiva(l.texto)}</p>
  </article>`).join("");

/* ---------- Servicios ---------- */
$("#servicios-lista").innerHTML = SERVICIOS.map((s) => `
  <article class="servicio reveal">
    <div class="servicio-cabecera">
      <div class="icono" aria-hidden="true">${s.icono}</div>
      <h3>${cursiva(s.titulo)}</h3>
    </div>
    <p>${cursiva(s.texto)}</p>
    ${s.incluye && s.incluye.length ? `<p class="servicio-sub">El servicio incluye</p>
      <ul>${s.incluye.map((i) => `<li>${cursiva(i)}</li>`).join("")}</ul>` : ""}
    ${s.destinatarios ? `<p class="servicio-para"><b>Dirigido a:</b> ${cursiva(s.destinatarios)}</p>` : ""}
    <div class="servicio-acciones">
      <a class="btn" href="mailto:zanganoslab@gmail.com?subject=${encodeURIComponent("Consulta: " + s.titulo)}">Solicitar información</a>
      <a class="btn btn-ghost" href="https://forms.gle/fyNdcRGHBRVpUUo99" target="_blank" rel="noopener">Completar formulario</a>
    </div>
  </article>`).join("");

/* ---------- Informes técnicos ---------- */
const informesOrdenados = [...INFORMES].sort((a, b) => b.anio - a.anio);
$("#informes-lista").innerHTML = informesOrdenados.map((r, k) => `
  <article class="informe reveal">
    <button class="informe-portada" data-informe="${k}" aria-label="Ver vista previa del informe">
      <img src="${esc(r.paginas[0])}" alt="Portada del informe" loading="lazy">
      <span>Vista previa</span>
    </button>
    <div class="informe-info">
      <span class="informe-meta">${r.anio} · ${esc(r.solicitante)}</span>
      <b>${cursiva(r.titulo)}</b>
      <span class="informe-resumen">${cursiva(r.resumen)}</span>
      <div class="informe-acciones">
        <button class="btn btn-ghost btn-small" data-informe="${k}">Ver ${r.paginas.length} de ${r.totalPaginas} páginas</button>
        <a class="btn btn-small" href="mailto:zanganoslab@gmail.com?subject=${encodeURIComponent("Solicitud de informe: " + r.titulo)}">Solicitar informe completo</a>
      </div>
    </div>
  </article>`).join("");

/* Visor de la vista previa (páginas ampliadas) */
const visor = $("#visor");
const visorImg = visor.querySelector("img");
let paginas = [], actual = 0;
const mostrarPagina = (i) => {
  actual = (i + paginas.length) % paginas.length;
  visorImg.src = paginas[actual];
  visorImg.alt = `Vista previa, página ${actual + 1} de ${paginas.length}`;
  visor.querySelector(".visor-contador").textContent = `Vista previa · página ${actual + 1} de ${paginas.length}`;
};
const cerrarVisor = () => { visor.hidden = true; document.body.style.overflow = ""; };
$("#informes-lista").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-informe]");
  if (!b) return;
  paginas = informesOrdenados[Number(b.dataset.informe)].paginas;
  visor.querySelectorAll(".visor-nav").forEach((n) => (n.hidden = paginas.length < 2));
  mostrarPagina(0);
  visor.hidden = false;
  document.body.style.overflow = "hidden";
  visor.querySelector(".visor-cerrar").focus();
});
visor.querySelector(".visor-cerrar").addEventListener("click", cerrarVisor);
visor.querySelector(".visor-ant").addEventListener("click", () => mostrarPagina(actual - 1));
visor.querySelector(".visor-sig").addEventListener("click", () => mostrarPagina(actual + 1));
visor.addEventListener("click", (e) => { if (e.target === visor) cerrarVisor(); });
document.addEventListener("keydown", (e) => {
  if (visor.hidden) return;
  if (e.key === "Escape") cerrarVisor();
  if (e.key === "ArrowLeft") mostrarPagina(actual - 1);
  if (e.key === "ArrowRight") mostrarPagina(actual + 1);
});

/* ---------- Equipo ---------- */
function tarjetaPersona(p) {
  const avatar = p.foto
    ? `<img class="avatar" src="${esc(p.foto)}" alt="Foto de ${esc(p.nombre)}" loading="lazy">`
    : `<div class="avatar" aria-hidden="true">${iniciales(p.nombre)}</div>`;
  const links = [
    p.email && `<a href="mailto:${esc(p.email)}">✉ ${esc(p.email)}</a>`,
    p.researchgate && `<a href="${esc(p.researchgate)}" target="_blank" rel="noopener">ResearchGate ↗</a>`
  ].filter(Boolean).join("");
  return `
    <article class="persona reveal">
      ${avatar}
      <div>
        <h4>${esc(p.nombre)}</h4>
        <p class="rol">${esc(p.rol)}</p>
        <p>${cursiva(p.texto)}</p>
        <div class="links">${links}</div>
      </div>
    </article>`;
}
$("#equipo-principal").innerHTML = EQUIPO.filter((p) => p.grupo === "principal").map(tarjetaPersona).join("");
$("#equipo-activos").innerHTML = EQUIPO.filter((p) => p.grupo === "activos").map(tarjetaPersona).join("");
const itemColaborador = (c) => c.perfil
  ? `<li class="reveal"><a href="${esc(c.perfil)}" target="_blank" rel="noopener"><b>${esc(c.nombre)} ↗</b><span>${esc(c.inst)}</span></a></li>`
  : `<li class="reveal"><b>${esc(c.nombre)}</b><span>${esc(c.inst)}</span></li>`;
$("#colaboradores").innerHTML = COLABORADORES.map(itemColaborador).join("");
$("#instituciones").innerHTML = INSTITUCIONES.map(itemColaborador).join("");
$("#productores").innerHTML = PRODUCTORES.map(itemColaborador).join("");

/* ---------- Publicaciones (búsqueda + filtro por año) ---------- */
let anioActivo = "todos";
const aniosUnicos = [...new Set(anios)].sort((a, b) => b - a);
const chips = $("#pub-anios");
chips.innerHTML = ["todos", ...aniosUnicos].map((a) =>
  `<button class="chip" data-anio="${a}" aria-pressed="${a === "todos"}">${a === "todos" ? "Todos" : a}</button>`).join("");
chips.addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  anioActivo = b.dataset.anio;
  chips.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === b));
  renderPubs();
});
$("#pub-buscar").addEventListener("input", renderPubs);

function renderPubs() {
  const q = $("#pub-buscar").value.trim().toLowerCase();
  const lista = PUBLICACIONES
    .filter((p) => anioActivo === "todos" || String(p.anio) === anioActivo)
    .filter((p) => !q || `${p.titulo} ${p.autores} ${p.revista}`.toLowerCase().includes(q))
    .sort((a, b) => b.anio - a.anio);

  $("#pub-lista").innerHTML = lista.map((p) => `
    <li class="pub">
      <div class="pub-anio">${p.anio}</div>
      <div>
        <h3>${cursiva(p.titulo)}</h3>
        <p class="autores">${esc(p.autores)}</p>
        <p class="revista">${esc(p.revista)}</p>
        ${p.resumen ? `<details><summary>Ver resumen</summary><p>${cursiva(p.resumen)}</p></details>` : ""}
        ${p.doi ? `<div class="acciones"><a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">Leer el artículo ↗</a><span>DOI: ${esc(p.doi)}</span></div>` : ""}
      </div>
    </li>`).join("");
  $("#pub-vacio").hidden = lista.length > 0;
}
renderPubs();

/* ---------- Noticias ---------- */
function fechaLarga(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
}
$("#noticias-lista").innerHTML = [...NOTICIAS].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((n) => `
  <a class="nota reveal" href="noticia.html?id=${encodeURIComponent(n.id)}">
    ${n.fotos && n.fotos.length
      ? `<img class="nota-portada" src="${esc(n.fotos[0])}" alt="" loading="lazy">`
      : `<div class="franja"></div>`}
    <div class="nota-body">
      <time datetime="${esc(n.fecha)}">${fechaLarga(n.fecha)}</time>
      <h3>${cursiva(n.titulo)}</h3>
      <p>${cursiva(n.resumen)}</p>
      <span class="nota-mas">Leer nota${n.fotos && n.fotos.length > 1 ? ` · ${n.fotos.length} fotos` : ""} →</span>
    </div>
  </a>`).join("");

/* ---------- Pie y resaltado del menú ---------- */
$("#anio").textContent = new Date().getFullYear();

const enlaces = [...menu.querySelectorAll("a[href^='#']")];
const secciones = enlaces.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
const obsMenu = new IntersectionObserver((entradas) => {
  entradas.forEach((en) => {
    if (en.isIntersecting) {
      enlaces.forEach((a) => a.classList.toggle("activo", a.getAttribute("href") === `#${en.target.id}`));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
secciones.forEach((s) => obsMenu.observe(s));

/* ---------- Aparición suave al hacer scroll ---------- */
const obsReveal = new IntersectionObserver((entradas) => {
  entradas.forEach((en) => {
    if (en.isIntersecting) {
      en.target.classList.add("visible");
      obsReveal.unobserve(en.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => obsReveal.observe(el));
