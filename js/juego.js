/* ==========================================================
   Vuelo nupcial — juego educativo de Zánganos Lab (juego.html)
   La reina debe encontrar el área de congregación de zánganos (ACZ),
   aparearse con zánganos de muchas colonias y volver a la colmena.
   Los textos pasan por tr() (js/i18n.js) para los tres idiomas.
   ========================================================== */

const $ = (sel) => document.querySelector(sel);

/* ---------- Menú móvil y pie ---------- */
const toggle = $(".nav-toggle");
const menu = $("#menu");
toggle.addEventListener("click", () => {
  const abierto = menu.classList.toggle("abierto");
  toggle.setAttribute("aria-expanded", abierto);
});
$("#anio").textContent = new Date().getFullYear();
enlacesConIdioma();

/* ---------- Parámetros del juego ---------- */
const DURACION = 105;          // segundos reales entre las 14:00 y las 17:30
const VEL_REINA = 230;         // px/s (unidades del mundo)
const RADIO_ACZ = 110;
const MAX_APAREAMIENTOS = 20;  // la espermateca se llena
const N_ZANGANOS = 24;
const PROP_HERMANOS = 0.2;
const COLONIAS = ["#c0392b", "#2e86c1", "#27ae60", "#8e44ad", "#e67e22", "#16a085", "#5d4037"];
const HERMANO = "#f6c401";

const lienzo = $("#lienzo");
const ctx = lienzo.getContext("2d");
let W = 1000, H = 700, escala = 1;

/* ---------- Utilidades ---------- */
const azar = (a, b) => a + Math.random() * (b - a);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mezclar = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
let record = 0;
try { record = Number(localStorage.getItem("juego-vuelo-record")) || 0; } catch (e) { /* sin almacenamiento */ }

/* ---------- Avisos educativos ---------- */
const avisoEl = $("#aviso");
let colaAvisos = [], avisoT = 0;
const yaDicho = new Set();
function aviso(clave, texto, vars) {
  if (clave && yaDicho.has(clave)) return;
  if (clave) yaDicho.add(clave);
  colaAvisos.push(tr(texto, vars));
}
function actualizarAvisos(dt) {
  avisoT -= dt;
  if (avisoT <= 0 && colaAvisos.length) {
    avisoEl.textContent = colaAvisos.shift();
    avisoEl.classList.add("visible");
    avisoT = 4.2;
  } else if (avisoT <= 0) {
    avisoEl.classList.remove("visible");
  }
}

/* ---------- Estado ---------- */
let S = null; // estado de la partida
let jugando = false, ultimo = 0;

function nuevaPartida() {
  // Paisaje vertical en pantallas altas (celular), horizontal en las demás
  const vertical = lienzo.parentElement.clientWidth < 640;
  W = vertical ? 700 : 1000;
  H = vertical ? 1000 : 700;
  ajustarTamano();

  const colmena = vertical ? { x: 0.5 * W, y: 0.9 * H } : { x: 0.11 * W, y: 0.82 * H };
  const huecos = vertical
    ? [{ x: 0.5 * W, y: 0.17 * H }, { x: 0.26 * W, y: 0.5 * H }, { x: 0.74 * W, y: 0.53 * H }]
    : [{ x: 0.8 * W, y: 0.27 * H }, { x: 0.42 * W, y: 0.25 * H }, { x: 0.72 * W, y: 0.74 * H }];
  const tipos = mezclar(["acz", "abierto", "cerrado"]);
  const claros = huecos.map((p, i) => ({ ...p, tipo: tipos[i] }));
  const acz = claros.find((c) => c.tipo === "acz");

  // Árboles: anillo alrededor de la ACZ, bosque cerrado y manchones de monte
  const arboles = [];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + azar(-0.08, 0.08);
    const r = RADIO_ACZ + azar(38, 62);
    arboles.push({ x: acz.x + Math.cos(a) * r, y: acz.y + Math.sin(a) * r * 0.9, r: azar(17, 24) });
  }
  const cerrado = claros.find((c) => c.tipo === "cerrado");
  for (let i = 0; i < 70; i++) {
    const a = azar(0, Math.PI * 2), r = azar(55, 135);
    arboles.push({ x: cerrado.x + Math.cos(a) * r, y: cerrado.y + Math.sin(a) * r, r: azar(15, 22) });
  }
  const lejos = (x, y) => dist({ x, y }, colmena) > 110 && claros.every((c) => dist({ x, y }, c) > 240);
  for (let m = 0; m < 4; m++) {
    let cx, cy, intentos = 0;
    do { cx = azar(60, W - 60); cy = azar(60, H - 60); intentos++; } while (!lejos(cx, cy) && intentos < 60);
    if (intentos >= 60) continue;
    for (let i = 0; i < 14; i++) {
      const x = cx + azar(-70, 70), y = cy + azar(-55, 55);
      if (lejos(x, y)) arboles.push({ x, y, r: azar(14, 21) });
    }
  }

  // Zánganos en el área de congregación (20 % son hermanos de la reina)
  const zanganos = [];
  for (let i = 0; i < N_ZANGANOS; i++) zanganos.push(nuevoZangano(acz));

  S = {
    vertical, colmena, claros, acz, arboles, zanganos,
    reina: { x: colmena.x, y: colmena.y - 30, vx: 0, vy: 0, inv: 0, espera: 0, aleteo: 0 },
    aves: [], viento: { t: azar(14, 20), activo: 0, ang: 0 },
    t: 0, energia: 100, apareamientos: 0, hermanos: 0, colonias: new Set(),
    enACZ: false, visitoACZ: false, reponer: 0, fin: null
  };
  objetivo = null;
  colaAvisos = []; avisoT = 0; yaDicho.clear(); avisoEl.classList.remove("visible");
  aviso("inicio", "Son las 14:00: en las horas cálidas de la tarde salen las reinas y los zánganos a sus vuelos de apareamiento.");
  aviso("pista", "Pista: las ACZ se forman en claros abiertos, rodeados de árboles que las protegen del viento.");
}

function nuevoZangano(acz, enBorde) {
  const hermano = Math.random() < PROP_HERMANOS;
  const a = azar(0, Math.PI * 2), r = enBorde ? RADIO_ACZ * 0.95 : azar(10, RADIO_ACZ * 0.9);
  return {
    x: acz.x + Math.cos(a) * r, y: acz.y + Math.sin(a) * r, vx: 0, vy: 0,
    ang: a, rad: r, giro: azar(0.6, 1.4) * (Math.random() < 0.5 ? -1 : 1), fase: azar(0, 6),
    hermano, color: hermano ? HERMANO : COLONIAS[Math.floor(Math.random() * COLONIAS.length)]
  };
}

/* ---------- Controles ---------- */
let objetivo = null;
const teclas = new Set();
function puntoDelMundo(e) {
  const r = lienzo.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
}
lienzo.addEventListener("pointerdown", (e) => { if (!jugando) return; lienzo.setPointerCapture(e.pointerId); objetivo = puntoDelMundo(e); });
lienzo.addEventListener("pointermove", (e) => { if (jugando && (e.buttons || e.pointerType === "mouse")) objetivo = puntoDelMundo(e); });
lienzo.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") objetivo = null; });
lienzo.addEventListener("pointerleave", () => { objetivo = null; });
const TECLAS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
document.addEventListener("keydown", (e) => {
  if (!jugando || !TECLAS[e.key]) return;
  teclas.add(e.key); objetivo = null; e.preventDefault();
});
document.addEventListener("keyup", (e) => teclas.delete(e.key));

/* ---------- Actualización ---------- */
function actualizar(dt) {
  const R = S.reina;
  S.t += dt;
  R.aleteo += dt * 40;
  R.inv = Math.max(0, R.inv - dt);
  R.espera = Math.max(0, R.espera - dt);

  // Movimiento de la reina: hacia el dedo/ratón o con el teclado
  let dx = 0, dy = 0;
  teclas.forEach((k) => { dx += TECLAS[k][0]; dy += TECLAS[k][1]; });
  if (dx || dy) {
    const n = Math.hypot(dx, dy); R.vx = (dx / n) * VEL_REINA; R.vy = (dy / n) * VEL_REINA;
  } else if (objetivo) {
    const d = Math.hypot(objetivo.x - R.x, objetivo.y - R.y);
    const v = Math.min(VEL_REINA, d * 4);
    R.vx = d > 2 ? ((objetivo.x - R.x) / d) * v : 0;
    R.vy = d > 2 ? ((objetivo.y - R.y) / d) * v : 0;
  } else { R.vx *= 0.85; R.vy *= 0.85; }

  // Viento: ráfagas periódicas; los árboles que rodean la ACZ las frenan
  const V = S.viento;
  V.t -= dt;
  if (V.activo > 0) V.activo -= dt;
  else if (V.t <= 0) {
    V.activo = 3.5; V.ang = azar(0, Math.PI * 2); V.t = azar(16, 22);
    aviso("viento", "¡Ráfaga de viento! El viento desvía el vuelo; dentro de la ACZ, los árboles la protegen.");
  }
  let vientoX = 0, vientoY = 0;
  if (V.activo > 0) {
    const reparo = dist(R, S.acz) < RADIO_ACZ + 45 ? 0.15 : 1;
    vientoX = Math.cos(V.ang) * 120 * reparo; vientoY = Math.sin(V.ang) * 120 * reparo;
  }
  R.x = Math.min(W - 12, Math.max(12, R.x + (R.vx + vientoX) * dt));
  R.y = Math.min(H - 12, Math.max(12, R.y + (R.vy + vientoY) * dt));

  // Energía y hora
  S.energia -= dt * 0.35;
  const minutos = 14 * 60 + (S.t / DURACION) * 210;
  if (minutos >= 17 * 60 + 10) aviso("tarde", "Se acaba la tarde: vuelva a la colmena.");

  // Claros: ¿la ACZ o un lugar donde no se forma?
  S.claros.forEach((c) => {
    if (dist(R, c) > RADIO_ACZ + 10) return;
    if (c.tipo === "abierto") aviso("abierto", "Este campo abierto está expuesto al viento: aquí no se forma una ACZ.");
    if (c.tipo === "cerrado") aviso("cerrado", "Este claro es demasiado cerrado: los zánganos necesitan espacio abierto para volar.");
  });
  S.enACZ = dist(R, S.acz) < RADIO_ACZ + 20;
  if (S.enACZ && !S.visitoACZ) {
    S.visitoACZ = true;
    aviso("acz", "¡Encontró la ACZ! Aquí se reúnen miles de zánganos de muchas colonias.");
    aviso("hermanos", "Los zánganos amarillos son sus hermanos: evítelos para que la colonia tenga más diversidad genética.");
    S.aves.push(nuevaAve(0), nuevaAve(Math.PI));
  }
  if (S.visitoACZ && S.apareamientos >= 6 && !S.aveExtra) { S.aveExtra = true; S.aves.push(nuevaAve(Math.PI / 2)); }

  // Zánganos: vuelan en círculos en la ACZ y persiguen a la reina cuando se acerca
  const cerca = dist(R, S.acz) < RADIO_ACZ + 140;
  for (let i = S.zanganos.length - 1; i >= 0; i--) {
    const z = S.zanganos[i];
    z.fase += dt * 30;
    let deseadoX, deseadoY;
    const dz = dist(z, R);
    if (cerca && dz < 280 && S.apareamientos + S.hermanos < MAX_APAREAMIENTOS) {
      // Cometa: persiguen a la reina, cada uno con un pequeño desvío, y forman una estela
      const ox = Math.cos(z.fase * 0.05) * 18, oy = Math.sin(z.fase * 0.05) * 18;
      const dd = Math.hypot(R.x + ox - z.x, R.y + oy - z.y) || 1;
      const vel = dz < 60 ? 245 : 280;
      deseadoX = ((R.x + ox - z.x) / dd) * vel; deseadoY = ((R.y + oy - z.y) / dd) * vel;
    } else {
      z.ang += z.giro * dt;
      const tx = S.acz.x + Math.cos(z.ang) * z.rad, ty = S.acz.y + Math.sin(z.ang) * z.rad * 0.8;
      deseadoX = (tx - z.x) * 2.5; deseadoY = (ty - z.y) * 2.5;
    }
    z.vx += (deseadoX - z.vx) * Math.min(1, dt * 3);
    z.vy += (deseadoY - z.vy) * Math.min(1, dt * 3);
    z.x += z.vx * dt; z.y += z.vy * dt;

    // Apareamiento: el zángano muere después de aparearse
    if (dz < 16 && R.espera <= 0 && S.apareamientos + S.hermanos < MAX_APAREAMIENTOS) {
      S.zanganos.splice(i, 1);
      R.espera = 1.2; // cada apareamiento dura unos instantes
      S.reponer += 1;
      if (z.hermano) {
        S.hermanos++;
        aviso("hermano1", "Se apareó con un hermano: eso reduce la diversidad genética de la colonia.");
      } else {
        S.apareamientos++;
        S.colonias.add(z.color);
        aviso("primero", "¡Primer apareamiento! El zángano muere después de aparearse.");
      }
      if (S.apareamientos + S.hermanos >= MAX_APAREAMIENTOS) aviso("lleno", "¡La espermateca está llena! Vuelva a la colmena.");
      else if (S.apareamientos === 10) aviso("diez", "Una reina se aparea con 12 a 20 zánganos en promedio, ¡y se registraron hasta 70!");
    }
  }
  // Siguen llegando zánganos a la ACZ
  if (S.reponer > 0 && Math.random() < dt * 0.8) { S.zanganos.push(nuevoZangano(S.acz, true)); S.reponer--; }

  // Aves insectívoras que cazan en la ACZ
  S.aves.forEach((b) => actualizarAve(b, dt));

  // Fin de la partida
  if (S.energia <= 0) return terminar("energia");
  if (minutos >= 17 * 60 + 30) return terminar("tarde");
  if (dist(R, S.colmena) < 40 && S.t > 3) {
    if (S.apareamientos + S.hermanos > 0) return terminar("exito");
    aviso("sinAparear", "Todavía no se apareó: busque el área de congregación.");
  }
}

function nuevaAve(fase) {
  return { x: S.acz.x + Math.cos(fase) * 230, y: S.acz.y + Math.sin(fase) * 230, ang: fase, dir: 0, modo: "patrulla", t: 0, vx: 0, vy: 0 };
}
function actualizarAve(b, dt) {
  const R = S.reina;
  b.t -= dt;
  if (b.modo === "patrulla") {
    b.ang += dt * 0.7;
    const tx = S.acz.x + Math.cos(b.ang) * 230, ty = S.acz.y + Math.sin(b.ang) * 200;
    b.vx += ((tx - b.x) * 3 - b.vx) * Math.min(1, dt * 2);
    b.vy += ((ty - b.y) * 3 - b.vy) * Math.min(1, dt * 2);
    if (b.t <= 0 && dist(b, R) < 200) {
      b.modo = "picada"; b.t = 1.1;
      aviso("ave", "¡Cuidado! Aves insectívoras, como la tijereta, aprovechan las ACZ para cazar.");
    }
  } else if (b.modo === "picada") {
    const d = dist(b, R) || 1;
    b.vx += (((R.x - b.x) / d) * 280 - b.vx) * Math.min(1, dt * 4);
    b.vy += (((R.y - b.y) / d) * 280 - b.vy) * Math.min(1, dt * 4);
    if (b.t <= 0) { b.modo = "patrulla"; b.t = 4; }
  }
  b.x += b.vx * dt; b.y += b.vy * dt;
  b.dir = Math.atan2(b.vy, b.vx);
  if (R.inv <= 0 && dist(b, R) < 22) {
    S.energia -= 20; R.inv = 1.5; b.modo = "patrulla"; b.t = 4;
  }
}

/* ---------- Dibujo ---------- */
function dibujar() {
  ctx.setTransform(escala, 0, 0, escala, 0, 0);
  // Pastizal
  ctx.fillStyle = "#cfe3a3"; ctx.fillRect(0, 0, W, H);
  // Claros
  S.claros.forEach((c) => {
    if (c.tipo === "abierto") {
      ctx.fillStyle = "#ece4a6";
      ctx.fillRect(c.x - 130, c.y - 90, 260, 180);
      ctx.strokeStyle = "rgba(160, 140, 60, .35)"; ctx.lineWidth = 2;
      for (let y = c.y - 80; y < c.y + 90; y += 14) { ctx.beginPath(); ctx.moveTo(c.x - 125, y); ctx.lineTo(c.x + 125, y); ctx.stroke(); }
    } else {
      ctx.fillStyle = c.tipo === "acz" ? "#dbeeb5" : "#c5dd96";
      ctx.beginPath(); ctx.ellipse(c.x, c.y, c.tipo === "acz" ? RADIO_ACZ + 30 : 50, c.tipo === "acz" ? RADIO_ACZ + 20 : 46, 0, 0, Math.PI * 2); ctx.fill();
    }
  });
  // Árboles
  S.arboles.forEach((a) => {
    ctx.fillStyle = "#3f6b2e"; ctx.beginPath(); ctx.arc(a.x, a.y + 3, a.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#5b8c3e"; ctx.beginPath(); ctx.arc(a.x - a.r * 0.25, a.y - a.r * 0.2, a.r * 0.72, 0, Math.PI * 2); ctx.fill();
  });
  // Colmena (hexágono)
  const c = S.colmena;
  ctx.fillStyle = "#301811"; ctx.strokeStyle = "#f6c401"; ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; ctx.lineTo(c.x + Math.cos(a) * 28, c.y + Math.sin(a) * 28); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#f6c401"; ctx.beginPath(); ctx.ellipse(c.x, c.y + 8, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.font = "600 15px Jost, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#301811";
  ctx.fillText(tr("Colmena"), c.x, c.y + 48);

  // Zánganos: se ven al acercarse a la ACZ
  const visible = Math.max(0, Math.min(1, (420 - dist(S.reina, S.acz)) / 160));
  if (visible > 0) {
    // Halo dorado: la "nube" de zánganos que vuela sobre la ACZ
    const halo = ctx.createRadialGradient(S.acz.x, S.acz.y, 10, S.acz.x, S.acz.y, RADIO_ACZ + 10);
    halo.addColorStop(0, `rgba(246,196,1,${0.28 * visible})`);
    halo.addColorStop(1, "rgba(246,196,1,0)");
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(S.acz.x, S.acz.y, RADIO_ACZ + 10, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = visible;
    S.zanganos.forEach((z) => dibujarAbeja(z.x, z.y, Math.atan2(z.vy, z.vx), 1, z.color, z.fase, false));
    ctx.globalAlpha = 1;
  }
  // Reina
  const R = S.reina;
  if (!(R.inv > 0 && Math.floor(R.inv * 10) % 2)) dibujarAbeja(R.x, R.y, Math.atan2(R.vy, R.vx || 0.0001), 1.15, null, R.aleteo, true);
  // Aves
  S.aves.forEach(dibujarAve);
  // Objetivo del dedo
  if (objetivo) { ctx.strokeStyle = "rgba(48,24,17,.35)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(objetivo.x, objetivo.y, 10, 0, Math.PI * 2); ctx.stroke(); }
}

function dibujarAbeja(x, y, ang, tam, color, fase, reina) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(tam, tam);
  // Alas
  const ala = 0.35 + Math.abs(Math.sin(fase)) * 0.65;
  ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.strokeStyle = "rgba(48,24,17,.35)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(-2, -9 * ala, 9, 6 * ala + 1, -0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-2, 9 * ala, 9, 6 * ala + 1, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Cuerpo: la reina tiene abdomen largo; el zángano es más ancho y de ojos grandes
  ctx.fillStyle = reina ? "#c98a1b" : "#3b2a1a";
  ctx.beginPath(); ctx.ellipse(-9, 0, reina ? 14 : 10, reina ? 6 : 7.5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = reina ? "#301811" : "#6b4a2a";
  for (let k = 0; k < 3; k++) ctx.fillRect(-16 + k * 5, -5, 2, 10);
  ctx.fillStyle = "#3b2a1a"; ctx.beginPath(); ctx.ellipse(3, 0, 6, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = reina ? "#3b2a1a" : "#5a3d22";
  ctx.beginPath(); ctx.arc(10, 0, reina ? 4.5 : 6, 0, Math.PI * 2); ctx.fill();
  // Marca de color: colonia del zángano, o corona dorada de la reina
  if (color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(3, 0, 3.6, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  if (reina) {
    ctx.fillStyle = "#f6c401"; ctx.strokeStyle = "#301811"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x - 9, y - 18); ctx.lineTo(x - 9, y - 26); ctx.lineTo(x - 4.5, y - 21); ctx.lineTo(x, y - 28);
    ctx.lineTo(x + 4.5, y - 21); ctx.lineTo(x + 9, y - 26); ctx.lineTo(x + 9, y - 18); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}

function dibujarAve(b) {
  ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.dir);
  ctx.fillStyle = "#1e1e2a";
  const batido = Math.sin(S.t * 14) * 4;
  ctx.beginPath(); // ave tipo tijereta: alas en V y cola ahorquillada
  ctx.moveTo(14, 0); ctx.lineTo(0, -16 - batido); ctx.lineTo(-4, -2); ctx.lineTo(-22, -9); ctx.lineTo(-14, 0);
  ctx.lineTo(-22, 9); ctx.lineTo(-4, 2); ctx.lineTo(0, 16 + batido); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* ---------- Indicadores ---------- */
function actualizarHUD() {
  const min = Math.min(17 * 60 + 30, 14 * 60 + Math.floor((S.t / DURACION) * 210));
  $("#hud-hora").textContent = `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;
  const e = Math.max(0, S.energia);
  const barra = $("#hud-energia");
  barra.style.width = e + "%";
  barra.style.background = e < 25 ? "#c0392b" : "#f6c401";
  $("#hud-aparea").textContent = `${S.apareamientos + S.hermanos} / ${MAX_APAREAMIENTOS}`;
  $("#hud-colonias").textContent = `${S.colonias.size} / ${COLONIAS.length}`;
  const v = $("#hud-viento");
  v.hidden = !(S.viento.activo > 0);
  $("#hud-viento-flecha").style.transform = `rotate(${S.viento.ang}rad)`;
}

/* ---------- Bucle principal ---------- */
function bucle(ahora) {
  if (!jugando) return;
  const dt = Math.min(0.05, (ahora - ultimo) / 1000 || 0);
  ultimo = ahora;
  actualizar(dt);
  if (!jugando) return;
  actualizarAvisos(dt);
  dibujar();
  actualizarHUD();
  requestAnimationFrame(bucle);
}

function empezar() {
  nuevaPartida();
  $("#panel-inicio").hidden = true;
  $("#panel-final").hidden = true;
  $("#hud").hidden = false;
  $("#juego").classList.remove("con-panel");
  jugando = true;
  ultimo = performance.now();
  if (window.innerWidth < 900) $("#juego").scrollIntoView({ behavior: "smooth", block: "center" });
  requestAnimationFrame(bucle);
}

function terminar(motivo) {
  jugando = false;
  dibujar();
  $("#hud").hidden = true;
  avisoEl.classList.remove("visible");
  const colonias = S.colonias.size;
  const diversidad = Math.round((colonias / COLONIAS.length) * 100);
  const exito = motivo === "exito";
  const puntos = exito ? Math.max(0, S.apareamientos * 10 + colonias * 30 - S.hermanos * 20 + Math.round(S.energia / 2)) : 0;
  const estrellas = exito ? 1 + (colonias >= 4 ? 1 : 0) + (colonias >= 6 && S.hermanos <= 1 ? 1 : 0) : 0;
  const nuevoRecord = puntos > record;
  if (nuevoRecord) { record = puntos; try { localStorage.setItem("juego-vuelo-record", String(puntos)); } catch (e) { /* sin almacenamiento */ } }

  let titulo, mensaje;
  if (motivo === "energia") {
    titulo = tr("La reina se quedó sin energía");
    mensaje = tr("Los vuelos nupciales son exigentes y arriesgados: no todas las reinas regresan a la colmena.");
  } else if (motivo === "tarde") {
    titulo = tr("Se hizo tarde");
    mensaje = tr("Al caer la tarde baja la temperatura y terminan los vuelos de apareamiento. La reina no logró volver a tiempo.");
  } else {
    titulo = tr("¡La reina volvió a la colmena!");
    mensaje = colonias >= 5
      ? tr("Su colonia tendrá una gran diversidad genética: obreras con distintas habilidades y más resistencia a enfermedades como la varroosis.")
      : colonias >= 2
        ? tr("Buen vuelo. Con zánganos de más colonias, su descendencia habría sido todavía más diversa.")
        : tr("La reina se apareó, pero con zánganos de pocas colonias: su descendencia tendrá poca diversidad genética.");
    if (S.hermanos > 0) mensaje += " " + tr("Se apareó con {n} hermanos: en la naturaleza, las reinas vuelan a ACZ alejadas de su colmena para evitarlo.", { n: S.hermanos });
  }
  $("#final-estrellas").textContent = exito ? "★".repeat(estrellas) + "☆".repeat(3 - estrellas) : "";
  $("#final-titulo").textContent = titulo;
  $("#final-mensaje").textContent = mensaje;
  $("#final-cifras").innerHTML = [
    [S.apareamientos, tr("apareamientos")],
    [`${colonias} / ${COLONIAS.length}`, tr("colonias distintas")],
    [`${diversidad} %`, tr("diversidad genética")],
    [S.hermanos, tr("hermanos")],
    [puntos, nuevoRecord && puntos > 0 ? tr("¡nuevo récord!") : tr("puntos (récord: {r})", { r: record })]
  ].map(([n, t]) => `<div><b>${n}</b><span>${t}</span></div>`).join("");
  const datos = [
    "Una reina se aparea en pleno vuelo con 12 a 20 zánganos en promedio, y se registraron hasta 70.",
    "La reina guarda los espermatozoides en la espermateca y los usa durante toda su vida, que puede durar varios años.",
    "Las ACZ se mantienen en el mismo lugar año tras año, aunque cada temporada nacen zánganos nuevos que nunca las visitaron.",
    "Una ACZ puede reunir miles de zánganos llegados de colonias que están a varios kilómetros.",
    "Los zánganos mueren después de aparearse: su único rol en la colonia es reproductivo.",
    "Zánganos Lab confirmó 27 ACZ en Argentina, Bolivia y Puerto Rico."
  ];
  $("#final-dato").innerHTML = `<b>${tr("¿Sabía que…?")}</b> ${tr(datos[Math.floor(Math.random() * datos.length)])}`;
  $("#panel-final").hidden = false;
  $("#juego").classList.add("con-panel");
  $("#btn-otra").focus();
}

/* ---------- Tamaño del lienzo ---------- */
function ajustarTamano() {
  const ancho = lienzo.parentElement.clientWidth;
  const alto = Math.min(ancho * (H / W), window.innerHeight * 0.82);
  const anchoReal = alto * (W / H);
  const dpr = window.devicePixelRatio || 1;
  lienzo.style.width = anchoReal + "px";
  lienzo.style.height = alto + "px";
  lienzo.width = Math.round(anchoReal * dpr);
  lienzo.height = Math.round(alto * dpr);
  escala = (anchoReal * dpr) / W;
  if (S) dibujar();
}
window.addEventListener("resize", ajustarTamano);
document.addEventListener("visibilitychange", () => { if (!document.hidden) ultimo = performance.now(); });

$("#btn-jugar").addEventListener("click", empezar);
$("#btn-otra").addEventListener("click", empezar);

// Vista inicial del paisaje detrás de la pantalla de inicio
nuevaPartida();
dibujar();
