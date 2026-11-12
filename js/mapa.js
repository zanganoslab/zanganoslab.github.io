/* ==========================================================
   Mapa de ACZ (mapa.html). Los datos están en js/acz.js.
   ========================================================== */

const $ = (sel) => document.querySelector(sel);
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Menú móvil y pie ---------- */
const toggle = $(".nav-toggle");
const menu = $("#menu");
toggle.addEventListener("click", () => {
  const abierto = menu.classList.toggle("abierto");
  toggle.setAttribute("aria-expanded", abierto);
});
$("#anio").textContent = new Date().getFullYear();

/* ---------- Colores de la marca ---------- */
const COLOR = { confirmada: "#f6c401", registrada: "#301811", aproximada: "#a8a8a7" };
const colorDe = (a) => (a.precision === "aproximada" ? COLOR.aproximada : COLOR[a.estado] || COLOR.registrada);
// tr() viene de js/i18n.js (idioma elegido)
const etiquetaEstado = (a) => tr(a.estado === "confirmada" ? "Confirmada" : "Registrada") + (a.precision === "aproximada" ? tr(" · ubicación estimada") : "");

/* ---------- Mapa: solo América Latina y el Caribe ---------- */
const AMERICA = L.latLngBounds([-57, -120], [33, -30]);
const mapa = L.map("mapa", {
  maxBounds: AMERICA.pad(0.1),
  maxBoundsViscosity: 0.8,
  minZoom: 3,
  maxZoom: 13, // no se acerca más allá de la precisión con que se publican las ACZ
  scrollWheelZoom: false, // evita que la página "se quede pegada" al mapa al hacer scroll
  worldCopyJump: false
});
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">colaboradores de OpenStreetMap</a>',
  maxZoom: 19
}).addTo(mapa);
// Vista inicial (Leaflet necesita una antes de dibujar las zonas)
mapa.fitBounds(L.latLngBounds(ACZ.map((a) => [a.lat, a.lng])).pad(0.15));
mapa.on("focus", () => mapa.scrollWheelZoom.enable());
mapa.on("blur", () => mapa.scrollWheelZoom.disable());

/* Marcador hexagonal con los colores de la marca */
const iconoHex = (color) => L.divIcon({
  className: "acz-hex",
  html: `<svg viewBox="0 0 28 32" width="22" height="25" aria-hidden="true"><path d="M14 1 27 8.5v15L14 31 1 23.5v-15z" fill="${color}" stroke="#fff" stroke-width="2"/></svg>`,
  iconSize: [22, 25],
  iconAnchor: [11, 12.5],
  popupAnchor: [0, -12]
});

function popup(a) {
  const f = FUENTES[a.fuente];
  return `
    <div class="acz-popup">
      <span class="acz-estado" style="--c:${colorDe(a)}">${etiquetaEstado(a)}</span>
      <b>${esc(tr(a.sitio))}</b>
      <span>${esc(tr(a.region))}${a.region !== a.pais ? ", " + esc(tr(a.pais)) : ""}${a.anio ? " · " + tr("desde") + " " + a.anio : ""}</span>
      ${a.nota ? `<p>${esc(tr(a.nota))}</p>` : ""}
      ${f ? `<p class="acz-fuente">${tr("Fuente:")} ${f.url ? `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(tr(f.texto))} ↗</a>` : esc(tr(f.texto))}</p>` : ""}
    </div>`;
}

/* Cada ACZ = zona aproximada (círculo) + marcador */
const capas = ACZ.map((a, i) => {
  const radio = (a.precision === "aproximada" ? 3 : PRECISION_KM) * 1000;
  const zona = L.circle([a.lat, a.lng], { radius: radio, color: colorDe(a), weight: 1.5, fillColor: colorDe(a), fillOpacity: 0.18, dashArray: a.precision === "aproximada" ? "4 4" : null });
  const marca = L.marker([a.lat, a.lng], { icon: iconoHex(colorDe(a)), title: a.sitio, keyboard: true }).bindPopup(popup(a));
  const grupo = L.featureGroup([zona, marca]).addTo(mapa);
  grupo.on("click", () => marcarEnLista(i));
  return { a, grupo, marca };
});

/* ---------- Cifras ---------- */
const paises = [...new Set(ACZ.map((a) => a.pais))];
const confirmadas = ACZ.filter((a) => a.estado === "confirmada").length;
$("#mapa-cifras").innerHTML = [
  [ACZ.length, "ACZ registradas"],
  [paises.length, paises.length === 1 ? "país" : "países y territorios"],
  [confirmadas, "confirmadas por revisita"]
].map(([n, t]) => `<div class="stat"><b>${n}</b><span>${tr(t)}</span></div>`).join("");

/* ---------- Lista y filtro por país ---------- */
let filtro = "Todos";
const filtros = $("#mapa-filtros");
filtros.innerHTML = ["Todos", ...paises].map((p) =>
  `<button class="chip" data-pais="${esc(p)}" aria-pressed="${p === "Todos"}">${esc(tr(p))}${p === "Todos" ? "" : ` <small>${ACZ.filter((a) => a.pais === p).length}</small>`}</button>`).join("");

function aplicarFiltro() {
  const visibles = capas.filter((c) => filtro === "Todos" || c.a.pais === filtro);
  capas.forEach((c) => (visibles.includes(c) ? c.grupo.addTo(mapa) : c.grupo.remove()));
  $("#mapa-lista").innerHTML = visibles.map((c) => `
    <li><button data-i="${capas.indexOf(c)}">
      <i class="ley" style="background:${colorDe(c.a)}"></i>
      <span><b>${esc(tr(c.a.sitio))}</b><small>${esc(tr(c.a.region))}${c.a.region !== c.a.pais ? ", " + esc(tr(c.a.pais)) : ""}${c.a.anio ? " · " + c.a.anio : ""}</small></span>
    </button></li>`).join("");
  if (visibles.length) mapa.fitBounds(L.latLngBounds(visibles.map((c) => [c.a.lat, c.a.lng])).pad(0.15), { maxZoom: 9 });
}
filtros.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-pais]");
  if (!b) return;
  filtro = b.dataset.pais;
  filtros.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
  aplicarFiltro();
});
$("#mapa-lista").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-i]");
  if (!b) return;
  const c = capas[Number(b.dataset.i)];
  mapa.setView([c.a.lat, c.a.lng], 12);
  c.marca.openPopup();
  marcarEnLista(Number(b.dataset.i));
  if (window.innerWidth < 900) $("#mapa").scrollIntoView({ behavior: "smooth", block: "center" });
});
function marcarEnLista(i) {
  document.querySelectorAll("#mapa-lista button").forEach((b) => b.classList.toggle("activo", Number(b.dataset.i) === i));
}

aplicarFiltro();
enlacesConIdioma();
