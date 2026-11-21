/* ==========================================================
   Página "Colmena sensorizada" (monitoreo.html). Datos: js/colmena-api.js
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
enlacesConIdioma();

const V = ColmenaAPI.VARIABLES;
const GRUPOS = [
  { id: "interior", titulo: "Interior de la colmena", icono: "🏠" },
  { id: "crias", titulo: "Área de cría", icono: "🐝" },
  { id: "exterior", titulo: "Exterior", icono: "🌤️" }
];
const COLOR = { interior: "#301811", crias: "#d4a300", exterior: "#4f8fbf" };
const formatoHora = (d) => d.toLocaleString(IDIOMAS[LANG].locale, { hour: "2-digit", minute: "2-digit" });
const formatoFechaHora = (d) => d.toLocaleString(IDIOMAS[LANG].locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/* ---------- Valores actuales ---------- */
let ultimaRespuesta = null;

function pintarUltimas(r) {
  const avisoServicio = $("#aviso-servicio");
  if (!r.ok) {
    // La API no respondió: no sabemos nada del dispositivo; se conservan los últimos valores mostrados
    avisoServicio.hidden = false;
    avisoServicio.textContent = r.http === 429
      ? tr("Demasiadas consultas: se actualizará en unos minutos.")
      : tr("Servicio de datos no disponible momentáneamente: se reintentará en unos minutos.");
    if (!ultimaRespuesta) { $("#estado-dispositivo").textContent = tr("Datos no disponibles"); $("#punto-estado").className = "punto-estado"; }
    return;
  }
  avisoServicio.hidden = true;
  ultimaRespuesta = r.datos;
  const { generado, estado, mapa } = r.datos;

  $("#estado-dispositivo").textContent = tr(ColmenaAPI.ESTADOS[estado] || estado);
  $("#punto-estado").className = "punto-estado " + estado;
  const tiempos = Object.values(mapa).map((m) => +m.fecha);
  $("#ultimo-dato").textContent = tiempos.length
    ? "· " + tr("último dato {t}", { t: ColmenaAPI.hace((generado - Math.max(...tiempos)) / 1000) })
    : "";

  const viejo = estado === "offline";
  $("#lecturas").innerHTML = estado === "no_data"
    ? `<p class="sin-datos">${tr("Todavía no hay datos de la colmena.")}</p>`
    : GRUPOS.map((g) => {
        const vars = Object.keys(V).filter((k) => V[k].grupo === g.id);
        const valores = vars.map((k) => {
          const m = mapa[k];
          const tipo = V[k].tipo === "temperatura" ? tr("Temperatura") : tr("Humedad");
          if (!m) return `<div class="lectura-valor"><span>${tipo}</span><b class="sin">${tr("sin dato")}</b></div>`;
          if (m.sinLectura) return `<div class="lectura-valor"><span>${tipo}</span><b class="sin">${tr("sin lectura")}</b></div>`;
          return `<div class="lectura-valor"><span>${tipo}</span><b>${ColmenaAPI.numero(m.value)}<small>${esc(m.unit)}</small></b></div>`;
        }).join("");
        const sinSensor = vars.every((k) => mapa[k] && mapa[k].sinLectura);
        return `
          <article class="lectura lectura-${g.id}${viejo ? " vieja" : ""}">
            <h3><span aria-hidden="true">${g.icono}</span> ${tr(g.titulo)}</h3>
            <div class="lectura-valores">${valores}</div>
            ${sinSensor ? `<p class="lectura-nota">${tr("El sensor exterior no está enviando lecturas válidas.")}</p>` : ""}
          </article>`;
      }).join("");
}

ColmenaAPI.ultimas(pintarUltimas);

/* ---------- Gráficos ---------- */
let horas = 24, ultimoHistorial = null;
const historial = ColmenaAPI.historial(() => horas, (r) => {
  if (r.ok) { ultimoHistorial = r.datos; dibujarGraficos(); }
  else if (!ultimoHistorial) {
    $("#grafico-temperatura").innerHTML = $("#grafico-humedad").innerHTML = `<p class="sin-datos">${tr("Datos no disponibles momentáneamente.")}</p>`;
  }
});

$("#rango").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-horas]");
  if (!b || Number(b.dataset.horas) === horas) return;
  horas = Number(b.dataset.horas);
  $("#rango").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
  historial.ahora();
});

function dibujarGraficos() {
  const h = ultimoHistorial;
  ["temperatura", "humedad"].forEach((tipo) => {
    const series = GRUPOS.map((g) => {
      const clave = Object.keys(V).find((k) => V[k].grupo === g.id && V[k].tipo === tipo);
      return { grupo: g.id, nombre: tr(V[clave].corto), color: COLOR[g.id], puntos: h.series[clave] || [] };
    });
    dibujarGrafico($(`#grafico-${tipo}`), series, tipo === "temperatura" ? "°C" : "%");
  });
  $("#nota-grafico").textContent = h.modo === "aggregated"
    ? tr("Para períodos de más de 24 horas, cada punto es el promedio de 15 minutos.")
    : tr("Cada punto es una lectura del sensor (una cada 5 minutos aproximadamente).");
}

function dibujarGrafico(cont, series, unidad) {
  const todos = series.flatMap((s) => s.puntos);
  if (!todos.length) { cont.innerHTML = `<p class="sin-datos">${tr("Sin datos en este período.")}</p>`; return; }

  const ancho = Math.max(280, cont.clientWidth), alto = 240;
  const m = { izq: 44, der: 12, arr: 14, aba: 30 };
  const xs = todos.map((p) => +p.x), ys = todos.map((p) => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  const holgura = Math.max(1, (y1 - y0) * 0.12);
  y0 = Math.floor(y0 - holgura); y1 = Math.ceil(y1 + holgura);
  if (unidad === "%") { y0 = Math.max(0, y0); y1 = Math.min(100, y1); }
  const px = (t) => m.izq + ((t - x0) / Math.max(1, x1 - x0)) * (ancho - m.izq - m.der);
  const py = (v) => alto - m.aba - ((v - y0) / Math.max(1e-9, y1 - y0)) * (alto - m.arr - m.aba);

  // Ejes y cuadrícula
  let svg = "";
  for (let i = 0; i <= 4; i++) {
    const v = y0 + ((y1 - y0) * i) / 4, y = py(v);
    svg += `<line x1="${m.izq}" x2="${ancho - m.der}" y1="${y}" y2="${y}" class="g-rejilla"/>`;
    svg += `<text x="${m.izq - 6}" y="${y + 4}" class="g-eje" text-anchor="end">${ColmenaAPI.numero(v, 0)}</text>`;
  }
  const nTicks = ancho < 420 ? 3 : 5;
  for (let i = 0; i <= nTicks; i++) {
    const t = x0 + ((x1 - x0) * i) / nTicks;
    const etiqueta = (x1 - x0) > 30 * 3600e3 ? formatoFechaHora(new Date(t)) : formatoHora(new Date(t));
    svg += `<text x="${px(t)}" y="${alto - 8}" class="g-eje" text-anchor="${i === 0 ? "start" : i === nTicks ? "end" : "middle"}">${esc(etiqueta)}</text>`;
  }

  // Líneas: se cortan donde faltan datos (más de 40 minutos sin lecturas)
  const HUECO = 40 * 60e3;
  series.forEach((s) => {
    let d = "";
    s.puntos.forEach((p, i) => {
      const nuevo = i === 0 || (+p.x - +s.puntos[i - 1].x) > HUECO;
      d += `${nuevo ? "M" : "L"}${px(+p.x).toFixed(1)},${py(p.y).toFixed(1)}`;
    });
    if (d) svg += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
  });
  svg += `<line class="g-cursor" y1="${m.arr}" y2="${alto - m.aba}" x1="-10" x2="-10"/>`;

  const leyenda = series.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.nombre)}${s.puntos.length ? "" : " (" + tr("sin lectura") + ")"}</span>`).join("");
  cont.innerHTML = `<svg viewBox="0 0 ${ancho} ${alto}" width="100%" height="${alto}" role="img" aria-label="${esc(tr("Gráfico de las últimas horas"))}">${svg}</svg>
    <div class="g-leyenda">${leyenda}</div><div class="g-tooltip" hidden></div>`;

  // Lectura al pasar el dedo o el mouse
  const el = cont.querySelector("svg"), cursor = el.querySelector(".g-cursor"), tip = cont.querySelector(".g-tooltip");
  const mover = (ev) => {
    const r = el.getBoundingClientRect();
    const t = x0 + ((ev.clientX - r.left) / r.width * ancho - m.izq) / (ancho - m.izq - m.der) * (x1 - x0);
    if (t < x0 || t > x1) { tip.hidden = true; return; }
    const filas = series.map((s) => {
      let mejor = null;
      s.puntos.forEach((p) => { if (!mejor || Math.abs(+p.x - t) < Math.abs(+mejor.x - t)) mejor = p; });
      return mejor && Math.abs(+mejor.x - t) < HUECO ? { s, p: mejor } : null;
    }).filter(Boolean);
    if (!filas.length) { tip.hidden = true; return; }
    const tx = px(+filas[0].p.x);
    cursor.setAttribute("x1", tx); cursor.setAttribute("x2", tx);
    tip.innerHTML = `<b>${esc(formatoFechaHora(filas[0].p.x))}</b>` + filas.map((f) => `<span><i style="background:${f.s.color}"></i>${esc(f.s.nombre)}: ${ColmenaAPI.numero(f.p.y)} ${unidad}</span>`).join("");
    tip.hidden = false;
    tip.style.left = Math.min(r.width - 170, Math.max(0, (tx / ancho) * r.width - 85)) + "px";
  };
  el.addEventListener("pointermove", mover);
  el.addEventListener("pointerdown", mover);
  el.addEventListener("pointerleave", () => { tip.hidden = true; cursor.setAttribute("x1", -10); cursor.setAttribute("x2", -10); });
}

let anchoPrevio = 0;
window.addEventListener("resize", () => {
  const a = $("#grafico-temperatura").clientWidth;
  if (ultimoHistorial && Math.abs(a - anchoPrevio) > 20) { anchoPrevio = a; dibujarGraficos(); }
});
