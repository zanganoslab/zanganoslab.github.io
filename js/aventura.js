/* ==========================================================
   La gran aventura de la colmena — juego educativo para chicos
   Zánganos Lab (aventura.html)

   Cinco capítulos cortos que cuentan la reproducción de Apis mellifera:
   1. La familia de la colmena (reina, obreras y zánganos)
   2. ¿Quién nace de cada celda? (huevo fecundado / sin fecundar, jalea real)
   3. El gran vuelo del zángano (miel, ACZ, aves)
   4. El vuelo nupcial de la reina (apareamiento múltiple, hermanos)
   5. ¡Nace una nueva colonia! (diversidad genética + preguntas)
   ========================================================== */
(() => {
  const $ = (s) => document.querySelector(s);
  const T = (s, v) => (typeof tr === "function" ? tr(s, v) : s);

  /* ---------- Menú móvil y pie (igual que el resto del sitio) ---------- */
  const toggle = $(".nav-toggle"), menu = $("#menu");
  if (toggle) toggle.addEventListener("click", () => {
    const a = menu.classList.toggle("abierto");
    toggle.setAttribute("aria-expanded", a);
  });
  const anio = $("#anio");
  if (anio) anio.textContent = new Date().getFullYear();
  if (typeof enlacesConIdioma === "function") enlacesConIdioma();

  /* ---------- Elementos ---------- */
  const cont = $("#av"), lienzo = $("#av-lienzo"), ctx = lienzo.getContext("2d");
  const hud = $("#av-hud"), capa = $("#av-capa"), avisoEl = $("#av-aviso");
  let W = 1000, H = 600, ESC = 1, DPR = 1, reloj = 0;

  /* ---------- Utilidades ---------- */
  const azar = (a, b) => a + Math.random() * (b - a);
  const elegir = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mezclar = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const hash = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  const COLONIAS = ["#e74c3c", "#3498db", "#2ecc71", "#9b59b6", "#ff8c1a", "#1abc9c"];
  const AMARILLO = "#f6c401", CAFE = "#301811";
  const NOMBRE = { obrera: "Obrera", zangano: "Zángano", reina: "Reina" };

  /* ---------- Progreso guardado en el navegador ---------- */
  const CLAVE = "aventura-colmena-v1";
  let prog = { estrellas: [0, 0, 0, 0, 0], padres: [] };
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE));
    if (g && Array.isArray(g.estrellas)) prog = { ...prog, ...g };
  } catch (e) { /* sin almacenamiento */ }
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(prog)); } catch (e) { /* sin almacenamiento */ } };

  /* ---------- Sonido (sintetizado, sin archivos) ---------- */
  let actx = null, sonidoOn = true;
  try { sonidoOn = localStorage.getItem("aventura-sonido") !== "0"; } catch (e) { /* */ }
  function desbloquearAudio() {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      else if (actx.state === "suspended") actx.resume();
    } catch (e) { /* sin audio */ }
  }
  function tono(f1, f2, dur, tipo = "sine", vol = 0.14, ret = 0) {
    if (!sonidoOn || !actx) return;
    const t = actx.currentTime + ret, o = actx.createOscillator(), g = actx.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(actx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  const SON = {
    ok: () => { tono(660, 990, 0.14); tono(990, 1320, 0.12, "sine", 0.1, 0.1); },
    mal: () => tono(300, 170, 0.28, "triangle", 0.16),
    premio: () => { tono(523, 523, 0.14, "sine", 0.14, 0); tono(659, 659, 0.14, "sine", 0.14, 0.12); tono(784, 784, 0.14, "sine", 0.14, 0.24); tono(1047, 1047, 0.35, "sine", 0.14, 0.36); },
    golpe: () => tono(160, 60, 0.3, "square", 0.07),
    clic: () => tono(880, 880, 0.05, "sine", 0.05),
    miel: () => tono(520, 780, 0.12, "sine", 0.12)
  };
  const btnSonido = $("#av-sonido");
  const pintarSonido = () => { btnSonido.textContent = sonidoOn ? "🔊" : "🔇"; btnSonido.setAttribute("aria-label", T(sonidoOn ? "Silenciar" : "Activar sonido")); };
  btnSonido.addEventListener("click", () => {
    sonidoOn = !sonidoOn; pintarSonido();
    try { localStorage.setItem("aventura-sonido", sonidoOn ? "1" : "0"); } catch (e) { /* */ }
  });
  pintarSonido();
  cont.addEventListener("pointerdown", desbloquearAudio);

  /* ---------- Tamaño del lienzo ---------- */
  function ajustar() {
    const full = document.fullscreenElement === cont;
    const cw = cont.clientWidth;
    let ch;
    if (full) ch = cont.clientHeight;
    else if (cw < 640) ch = Math.min(innerHeight * 0.8, cw * 1.45);
    else ch = Math.min(cw * 0.6, innerHeight * 0.85);
    ch = Math.max(ch, 380);
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    lienzo.style.height = ch + "px";
    lienzo.width = Math.round(cw * DPR);
    lienzo.height = Math.round(ch * DPR);
    ESC = Math.min(cw, ch) / 600;
    W = cw / ESC; H = ch / ESC;
    panalCache = null;
    if (escena && escena.redimensionar) escena.redimensionar();
  }
  addEventListener("resize", ajustar);
  document.addEventListener("fullscreenchange", ajustar);

  const btnPantalla = $("#av-pantalla");
  if (!cont.requestFullscreen) btnPantalla.hidden = true;
  btnPantalla.addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else cont.requestFullscreen().catch(() => {});
  });
  $("#av-inicio").addEventListener("click", () => { SON.clic(); irMenu(); });

  /* ---------- Puntero y teclado ---------- */
  const P = { x: 0, y: 0, activo: false };
  function aMundo(e) {
    const r = lienzo.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  }
  lienzo.addEventListener("pointerdown", (e) => {
    const p = aMundo(e);
    P.x = p.x; P.y = p.y; P.activo = true;
    if (e.pointerType !== "mouse") lienzo.setPointerCapture(e.pointerId);
    if (escena && escena.tocar && !document.querySelector(".av-dialogo")) escena.tocar(p.x, p.y);
  });
  lienzo.addEventListener("pointermove", (e) => {
    const p = aMundo(e);
    P.x = p.x; P.y = p.y;
    if (e.pointerType === "mouse") P.activo = true;
  });
  lienzo.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") P.activo = false; });
  lienzo.addEventListener("pointercancel", () => { P.activo = false; });
  lienzo.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") P.activo = false; });
  const TECLAS = new Set();
  addEventListener("keydown", (e) => {
    if (e.key.startsWith("Arrow") && escena && escena.usaTeclas && capa.hidden && !document.querySelector(".av-dialogo")) {
      TECLAS.add(e.key); e.preventDefault();
    }
  });
  addEventListener("keyup", (e) => TECLAS.delete(e.key));

  /* Mueve una abeja hacia el dedo / mouse / flechas, con suavidad */
  function mover(ent, vel, dt, camX = 0) {
    let dx = 0, dy = 0;
    if (TECLAS.size) {
      dx = (TECLAS.has("ArrowRight") ? 1 : 0) - (TECLAS.has("ArrowLeft") ? 1 : 0);
      dy = (TECLAS.has("ArrowDown") ? 1 : 0) - (TECLAS.has("ArrowUp") ? 1 : 0);
      const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
    } else if (P.activo) {
      const tx = P.x + camX, ty = P.y, d = Math.hypot(tx - ent.x, ty - ent.y);
      if (d > 6) { const f = Math.min(1, d / 70); dx = ((tx - ent.x) / d) * f; dy = ((ty - ent.y) / d) * f; }
    }
    const k = Math.min(1, dt * 8);
    ent.vx += (dx * vel - ent.vx) * k;
    ent.vy += (dy * vel - ent.vy) * k;
    ent.x += ent.vx * dt; ent.y += ent.vy * dt;
    if (Math.abs(ent.vx) > 10) ent.dir = Math.sign(ent.vx);
  }

  /* ==========================================================
     Dibujos
     ========================================================== */
  function redondeado(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  function etiqueta(c, txt, x, y, fondo = "rgba(255,255,255,.93)", color = CAFE, tam = 15) {
    txt = T(txt);
    c.save();
    c.font = `700 ${tam}px Jost, sans-serif`;
    const w = c.measureText(txt).width + 20;
    c.fillStyle = fondo;
    redondeado(c, x - w / 2, y - tam * 0.9, w, tam * 1.75, tam * 0.85);
    c.fill();
    c.fillStyle = color; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(txt, x, y - tam * 0.03);
    c.restore();
  }
  function hexPath(c, x, y, r) {
    c.beginPath();
    for (let i = 0; i < 6; i++) { const a = (Math.PI / 3) * i + Math.PI / 6; c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); }
    c.closePath();
  }

  /* Abeja caricaturizada: tipo = obrera | zangano | reina. Mira a la derecha (dir = 1). */
  function abeja(c, tipo, x, y, s = 1, o = {}) {
    const dir = o.dir || 1, t = (o.t ?? reloj) + (o.fase || 0);
    const fr = o.franja || AMARILLO;
    const Z = tipo === "zangano", R = tipo === "reina";
    c.save();
    c.translate(x, y);
    c.scale(s * dir, s);
    if (o.rot) c.rotate(o.rot);
    if (o.alfa != null) c.globalAlpha = Math.max(0, o.alfa);
    const ab = R ? { x: -25, rx: 24, ry: 10.5 } : Z ? { x: -19, rx: 18, ry: 14 } : { x: -17, rx: 15, ry: 10.5 };
    const tor = Z ? 12.5 : R ? 11 : 10;
    const cab = { x: tor + 6, r: Z ? 9.5 : 8 };
    const aleteo = o.quieta ? 0.8 : 0.35 + 0.65 * Math.abs(Math.sin(t * 38));
    const ala = (dx, rot, a) => {
      c.save(); c.translate(dx, -tor + 3); c.rotate(rot); c.scale(1, aleteo);
      c.beginPath(); c.ellipse(-6, -10, Z ? 18 : R ? 13 : 14, 8, 0, 0, Math.PI * 2);
      c.fillStyle = `rgba(225,240,255,${a})`; c.fill();
      c.strokeStyle = "rgba(110,140,175,.75)"; c.lineWidth = 1.2; c.stroke();
      c.restore();
    };
    ala(-3, -0.4, 0.55);
    // patas
    c.strokeStyle = "#2a160f"; c.lineWidth = 2; c.lineCap = "round";
    for (const lx of [-6, 0, 6]) { c.beginPath(); c.moveTo(lx, tor - 3); c.lineTo(lx - 3, tor + 6); c.stroke(); }
    // abdomen con rayas
    c.save();
    c.beginPath(); c.ellipse(ab.x, 1, ab.rx, ab.ry, 0, 0, Math.PI * 2);
    c.fillStyle = fr; c.fill(); c.clip();
    c.fillStyle = "#2b1710";
    const n = R ? 4 : 3, paso = (ab.rx * 2) / (n + 1.2);
    for (let i = 0; i < n; i++) { const sx = ab.x + ab.rx - paso * (i + 1) - paso * 0.1; c.fillRect(sx - paso * 0.22, -20, paso * 0.45, 40); }
    c.fillRect(ab.x - ab.rx - 2, -20, paso * 0.5, 40);
    c.beginPath(); c.ellipse(ab.x + 2, -ab.ry * 0.45, ab.rx * 0.7, ab.ry * 0.25, 0, 0, Math.PI * 2);
    c.fillStyle = "rgba(255,255,255,.25)"; c.fill();
    c.restore();
    c.beginPath(); c.ellipse(ab.x, 1, ab.rx, ab.ry, 0, 0, Math.PI * 2);
    c.strokeStyle = "#2b1710"; c.lineWidth = 1.6; c.stroke();
    // aguijón (solo obreras en el dibujo)
    if (tipo === "obrera") {
      c.beginPath(); c.moveTo(ab.x - ab.rx + 1, -1.5); c.lineTo(ab.x - ab.rx - 7, 1); c.lineTo(ab.x - ab.rx + 1, 3.5);
      c.fillStyle = "#2b1710"; c.fill();
    }
    // tórax peludo
    c.beginPath(); c.arc(0, 0, tor, 0, Math.PI * 2); c.fillStyle = "#8a5a2b"; c.fill();
    c.strokeStyle = "#2b1710"; c.lineWidth = 1.6; c.stroke();
    c.beginPath(); c.arc(-2, -3, tor * 0.55, 0, Math.PI * 2); c.fillStyle = "rgba(255,214,120,.35)"; c.fill();
    // cabeza
    c.beginPath(); c.arc(cab.x, -1, cab.r, 0, Math.PI * 2); c.fillStyle = "#3a2016"; c.fill();
    // antenas
    c.strokeStyle = "#2b1710"; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(cab.x + 3, -cab.r + 1); c.quadraticCurveTo(cab.x + 6, -cab.r - 9, cab.x + 12, -cab.r - 10); c.stroke();
    c.beginPath(); c.arc(cab.x + 12, -cab.r - 10, 1.9, 0, Math.PI * 2); c.fillStyle = "#2b1710"; c.fill();
    // ojos: enormes en el zángano
    if (Z) {
      c.beginPath(); c.ellipse(cab.x + 2, -4, 7.8, 8.4, 0.2, 0, Math.PI * 2); c.fillStyle = "#120806"; c.fill();
      c.beginPath(); c.arc(cab.x + 4.5, -7.5, 2.6, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill();
      c.beginPath(); c.arc(cab.x + 0.5, -2.5, 1.2, 0, Math.PI * 2); c.fill();
    } else {
      c.beginPath(); c.arc(cab.x + 3, -3, 3.7, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill();
      c.beginPath(); c.arc(cab.x + 4, -3, 2.1, 0, Math.PI * 2); c.fillStyle = "#120806"; c.fill();
      if (R) { c.strokeStyle = "#120806"; c.lineWidth = 1; c.beginPath(); c.moveTo(cab.x + 1, -6.5); c.lineTo(cab.x - 1, -8.5); c.moveTo(cab.x + 3.5, -7); c.lineTo(cab.x + 3, -9.5); c.stroke(); }
    }
    // sonrisa
    c.beginPath(); c.arc(cab.x + 4, 2, 2.6, 0.2, Math.PI - 0.6);
    c.strokeStyle = "#f3d9b0"; c.lineWidth = 1.3; c.stroke();
    ala(1, -0.12, 0.72);
    // corona (solo un marcador del juego)
    if (R && o.corona) {
      c.save(); c.translate(cab.x - 2, -cab.r - 7);
      c.beginPath(); c.moveTo(-7, 4); c.lineTo(-7, -3); c.lineTo(-3.5, 1); c.lineTo(0, -5.5); c.lineTo(3.5, 1); c.lineTo(7, -3); c.lineTo(7, 4); c.closePath();
      c.fillStyle = "#ffcf1a"; c.fill(); c.strokeStyle = "#9a6b00"; c.lineWidth = 1; c.stroke();
      c.restore();
    }
    c.restore();
  }

  /* Ave insectívora (inspirada en el benteveo) */
  function ave(c, x, y, s, dir, t) {
    c.save(); c.translate(x, y); c.scale(s * dir, s);
    const al = Math.sin(t * 12);
    c.fillStyle = "#5a3b22";
    c.beginPath(); c.moveTo(-24, -2); c.lineTo(-46, -10); c.lineTo(-44, 7); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(0, 0, 28, 16, 0, 0, Math.PI * 2); c.fillStyle = "#6b4a2b"; c.fill();
    c.beginPath(); c.ellipse(5, 6, 20, 10, 0, 0, Math.PI * 2); c.fillStyle = "#ffd21f"; c.fill();
    c.save();
    c.beginPath(); c.arc(26, -8, 13, 0, Math.PI * 2); c.fillStyle = "#1d1d1d"; c.fill(); c.clip();
    c.fillStyle = "#fff"; c.fillRect(12, -12, 30, 4.5);
    c.restore();
    c.beginPath(); c.arc(31, -4, 2.8, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill();
    c.beginPath(); c.arc(31.8, -4, 1.5, 0, Math.PI * 2); c.fillStyle = "#000"; c.fill();
    c.beginPath(); c.moveTo(37, -9); c.lineTo(52, -4); c.lineTo(37, 0); c.closePath(); c.fillStyle = "#222"; c.fill();
    c.save(); c.translate(-3, -6); c.scale(1, al);
    c.beginPath(); c.moveTo(-16, 0); c.quadraticCurveTo(-2, -34, 16, 0); c.closePath(); c.fillStyle = "#4a3019"; c.fill();
    c.restore();
    c.restore();
  }

  function colmena(c, x, y, s = 1) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = "#5a3b22"; c.fillRect(-54, -14, 9, 14); c.fillRect(45, -14, 9, 14);
    const caja = (yy, h) => {
      c.fillStyle = "#e2a85a"; c.fillRect(-60, yy, 120, h);
      c.strokeStyle = "#9a6a2e"; c.lineWidth = 2; c.strokeRect(-60, yy, 120, h);
      c.fillStyle = "rgba(0,0,0,.08)"; c.fillRect(-60, yy + h - 6, 120, 6);
    };
    caja(-60, 46); caja(-104, 44);
    c.fillStyle = "#7a4a24"; c.fillRect(-68, -118, 136, 15);
    c.fillStyle = "#3a2016"; c.fillRect(-28, -26, 56, 8);
    hexPath(c, 0, -82, 11); c.fillStyle = AMARILLO; c.fill(); c.strokeStyle = "#9a6a2e"; c.lineWidth = 2; c.stroke();
    c.restore();
  }

  function gotaMiel(c, x, y, s = 1) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.beginPath(); c.moveTo(0, -17);
    c.bezierCurveTo(4, -10, 12, -2, 12, 4);
    c.arc(0, 4, 12, 0, Math.PI);
    c.bezierCurveTo(-12, -2, -4, -10, 0, -17);
    const g = c.createLinearGradient(0, -17, 0, 16); g.addColorStop(0, "#ffd84d"); g.addColorStop(1, "#e89a00");
    c.fillStyle = g; c.fill(); c.strokeStyle = "#b36b00"; c.lineWidth = 1.5; c.stroke();
    c.beginPath(); c.ellipse(-4, 2, 2.5, 4.5, 0.3, 0, Math.PI * 2); c.fillStyle = "rgba(255,255,255,.7)"; c.fill();
    c.restore();
  }

  function cielo(c, arriba = "#8fd3ff", abajo = "#e9f7ff") {
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, arriba); g.addColorStop(1, abajo);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  function sol(c, x, y, r) {
    const g = c.createRadialGradient(x, y, r * 0.5, x, y, r * 2.6);
    g.addColorStop(0, "rgba(255,236,140,.75)"); g.addColorStop(1, "rgba(255,236,140,0)");
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 2.6, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = "#ffd84d"; c.fill();
  }
  const NUBES = [{ x: 0.1, y: 0.1, s: 1 }, { x: 0.45, y: 0.06, s: 0.8 }, { x: 0.75, y: 0.16, s: 1.1 }, { x: 1.1, y: 0.05, s: 0.7 }, { x: 1.4, y: 0.13, s: 0.9 }];
  function nubes(c, camX = 0) {
    for (const n of NUBES) {
      const ancho = W + 400;
      const x = ((((n.x * W * 1.3 + reloj * 9 * n.s - camX * 0.2) % ancho) + ancho) % ancho) - 200;
      const y = n.y * H + 20, s = n.s * 1.1;
      c.fillStyle = "rgba(255,255,255,.92)";
      c.beginPath();
      c.ellipse(x, y, 46 * s, 18 * s, 0, 0, Math.PI * 2);
      c.ellipse(x - 30 * s, y + 4 * s, 28 * s, 14 * s, 0, 0, Math.PI * 2);
      c.ellipse(x + 30 * s, y + 3 * s, 30 * s, 15 * s, 0, 0, Math.PI * 2);
      c.ellipse(x + 4 * s, y - 13 * s, 26 * s, 18 * s, 0, 0, Math.PI * 2);
      c.fill();
    }
  }
  function arbol(c, x, base, h) {
    c.fillStyle = "#6b4a2b"; c.fillRect(x - 5, base - h * 0.5, 10, h * 0.5);
    c.fillStyle = "#4f9d3a";
    c.beginPath(); c.arc(x, base - h * 0.62, h * 0.32, 0, Math.PI * 2); c.arc(x - h * 0.22, base - h * 0.48, h * 0.24, 0, Math.PI * 2); c.arc(x + h * 0.22, base - h * 0.5, h * 0.25, 0, Math.PI * 2); c.fill();
    c.fillStyle = "rgba(255,255,255,.12)";
    c.beginPath(); c.arc(x - h * 0.08, base - h * 0.72, h * 0.13, 0, Math.PI * 2); c.fill();
  }
  const COL_FLOR = ["#ff6b8a", "#ffffff", "#b388ff", "#ffd21f", "#ff8c42"];
  function paisaje(c, camX = 0) {
    const suelo = H * 0.88;
    c.fillStyle = "#b5dd96";
    c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W + 20; x += 20) { const wx = x + camX * 0.3; c.lineTo(x, suelo - 70 - 40 * Math.sin(wx / 170) - 18 * Math.sin(wx / 63)); }
    c.lineTo(W, H); c.fill();
    const k = camX * 0.6;
    for (let i = Math.floor(k / 130) - 1; i < (k + W) / 130 + 1; i++) {
      arbol(c, i * 130 - k + hash(i) * 60, suelo + 4, 70 + hash(i + 9) * 50);
    }
    c.fillStyle = "#7cc35b"; c.fillRect(0, suelo, W, H - suelo);
    for (let i = Math.floor(camX / 55) - 1; i < (camX + W) / 55 + 1; i++) {
      const fx = i * 55 - camX + hash(i + 3) * 30, fy = suelo + 10 + hash(i + 5) * Math.max(4, H - suelo - 20);
      c.strokeStyle = "#3f8a2c"; c.lineWidth = 2; c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx, fy - 10); c.stroke();
      c.fillStyle = COL_FLOR[Math.floor(hash(i + 7) * COL_FLOR.length)];
      for (let p = 0; p < 5; p++) { const a = (p / 5) * Math.PI * 2; c.beginPath(); c.arc(fx + Math.cos(a) * 4, fy - 12 + Math.sin(a) * 4, 3.2, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = "#ffd21f"; c.beginPath(); c.arc(fx, fy - 12, 2.4, 0, Math.PI * 2); c.fill();
    }
  }

  /* Panal de fondo (se dibuja una vez y se guarda) */
  let panalCache = null;
  const R_HEX = 26, W_HEX = Math.sqrt(3) * R_HEX;
  function panal(c) {
    if (!panalCache) {
      const cv = document.createElement("canvas");
      cv.width = Math.ceil(W * ESC * DPR); cv.height = Math.ceil(H * ESC * DPR);
      const p = cv.getContext("2d");
      p.setTransform(ESC * DPR, 0, 0, ESC * DPR, 0, 0);
      p.fillStyle = "#b8790f"; p.fillRect(0, 0, W, H);
      for (let fila = -1; fila * R_HEX * 1.5 < H + R_HEX; fila++) {
        for (let col = -1; col * W_HEX < W + W_HEX; col++) {
          const x = col * W_HEX + (fila % 2 ? W_HEX / 2 : 0), y = fila * R_HEX * 1.5;
          hexPath(p, x, y, R_HEX - 2);
          const g = p.createRadialGradient(x - 5, y - 6, 2, x, y, R_HEX);
          g.addColorStop(0, "#ffdc6b"); g.addColorStop(1, "#e9a91c");
          p.fillStyle = g; p.fill();
          p.strokeStyle = "#a96a12"; p.lineWidth = 2.5; p.stroke();
        }
      }
      panalCache = cv;
    }
    c.drawImage(panalCache, 0, 0, W, H);
  }

  function zonaACZ(c, z, texto, fuerte = true) {
    const g = c.createRadialGradient(z.x, z.y, 0, z.x, z.y, z.r * 1.3);
    g.addColorStop(0, fuerte ? "rgba(255,244,170,.55)" : "rgba(255,244,170,.35)");
    g.addColorStop(1, "rgba(255,244,170,0)");
    c.fillStyle = g; c.beginPath(); c.arc(z.x, z.y, z.r * 1.3, 0, Math.PI * 2); c.fill();
    c.save();
    c.setLineDash([10, 9]); c.lineDashOffset = -reloj * 20;
    c.strokeStyle = fuerte ? "rgba(48,24,17,.55)" : "rgba(48,24,17,.3)"; c.lineWidth = 2.5;
    c.beginPath(); c.ellipse(z.x, z.y, z.r, z.r * 0.75, 0, 0, Math.PI * 2); c.stroke();
    c.restore();
    if (texto) etiqueta(c, texto, z.x, z.y - z.r * 0.75 - 18, CAFE, AMARILLO, 16);
  }

  /* Flecha en el borde de la pantalla que señala hacia dónde ir */
  function flechaBorde(c, tx, ty, camX, texto) {
    const sx = tx - camX;
    if (sx > 40 && sx < W - 40) return;
    const der = sx >= W - 40, x = der ? W - 46 : 46, y = H * 0.58;
    c.save(); c.translate(x, y);
    const pul = 1 + 0.08 * Math.sin(reloj * 6); c.scale(pul, pul);
    c.beginPath(); c.arc(0, 0, 28, 0, Math.PI * 2); c.fillStyle = "rgba(48,24,17,.88)"; c.fill();
    const d = der ? 1 : -1;
    c.beginPath(); c.moveTo(14 * d, 0); c.lineTo(-7 * d, -12); c.lineTo(-7 * d, 12); c.closePath(); c.fillStyle = AMARILLO; c.fill();
    c.restore();
    etiqueta(c, texto, x + (der ? -18 : 18), y + 46);
  }

  /* ---------- Chispas y textos que flotan ---------- */
  const chispas = [];
  function chispa(x, y, color = "#ffd21f", n = 10, texto) {
    for (let i = 0; i < n; i++) chispas.push({ x, y, vx: azar(-110, 110), vy: azar(-150, 20), v: azar(0.6, 1), color, r: azar(3, 6) });
    if (texto) chispas.push({ x, y: y - 20, vx: 0, vy: -45, v: 1.5, texto, color });
  }
  function actualizarChispas(dt) {
    for (let i = chispas.length - 1; i >= 0; i--) {
      const p = chispas[i];
      p.v -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (!p.texto) p.vy += 180 * dt;
      if (p.v <= 0) chispas.splice(i, 1);
    }
  }
  function dibujarChispas(c) {
    for (const p of chispas) {
      c.globalAlpha = clamp(p.v, 0, 1);
      if (p.texto) etiqueta(c, p.texto, p.x, p.y, "rgba(255,255,255,.95)", CAFE, 17);
      else {
        c.fillStyle = p.color; c.beginPath();
        for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 - Math.PI / 2, rr = k % 2 ? p.r * 0.45 : p.r; c.lineTo(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr); }
        c.closePath(); c.fill();
      }
    }
    c.globalAlpha = 1;
  }

  /* ---------- Traducción automática de lo que aparece en el juego ----------
     Cada elemento cuyo contenido coincide con una frase de los diccionarios
     (js/trad-en.js, js/trad-pt.js) se reemplaza por su traducción. */
  const DIC = (typeof LANG !== "undefined" && LANG !== "es" && window.TRAD && TRAD[LANG]) || null;
  const SEL_TRAD = "h2,h3,p,li,b,span,button,a,div.av-pildora";
  function traducirDOM(raiz) {
    if (!DIC || !raiz || raiz.nodeType !== 1) return;
    const lista = raiz.matches(SEL_TRAD) ? [raiz, ...raiz.querySelectorAll(SEL_TRAD)] : [...raiz.querySelectorAll(SEL_TRAD)];
    for (const el of lista) {
      if (!el.isConnected) continue;
      const v = DIC[el.innerHTML.replace(/\s+/g, " ").trim()];
      if (v && v !== el.innerHTML) el.innerHTML = v;
    }
    for (const el of [raiz, ...raiz.querySelectorAll("[aria-label]")]) {
      const a = el.getAttribute && el.getAttribute("aria-label");
      const v = a && DIC[a.trim()];
      if (v && v !== a) el.setAttribute("aria-label", v);
    }
  }
  if (DIC) new MutationObserver((cambios) => {
    for (const m of cambios) for (const n of m.addedNodes) traducirDOM(n);
  }).observe(cont, { childList: true, subtree: true });

  /* ==========================================================
     Diálogos, avisos y paneles
     ========================================================== */
  const QUIEN = { meli: ["Meli", "obrera"], zumbo: ["Zumbo", "zangano"], lia: ["Lía", "reina"] };
  function retrato(cv, tipo, franja) {
    const rx = cv.getContext("2d");
    rx.clearRect(0, 0, cv.width, cv.height);
    rx.fillStyle = "#fff4c2"; rx.beginPath(); rx.arc(48, 48, 46, 0, Math.PI * 2); rx.fill();
    if (tipo === "reina") abeja(rx, "reina", 58, 56, 0.9, { quieta: true, corona: true });
    else if (tipo === "zangano") abeja(rx, "zangano", 52, 54, 1.05, { quieta: true, franja });
    else abeja(rx, "obrera", 52, 54, 1.15, { quieta: true });
  }
  function quitarDialogo() { document.querySelectorAll(".av-dialogo").forEach((d) => d.remove()); }
  function dialogo(lineas, fin) {
    quitarDialogo();
    let i = 0;
    const caja = document.createElement("div");
    caja.className = "av-dialogo";
    caja.innerHTML = '<canvas width="96" height="96" class="av-retrato" aria-hidden="true"></canvas><div class="av-dialogo-texto"><b></b><p></p><button class="av-btn"></button></div>';
    cont.appendChild(caja);
    const rc = caja.querySelector("canvas"), b = caja.querySelector("b"), p = caja.querySelector("p"), btn = caja.querySelector("button");
    function mostrar() {
      const l = typeof lineas[i] === "string" ? { q: "meli", t: lineas[i] } : lineas[i];
      const [nom, tipo] = QUIEN[l.q || "meli"];
      b.textContent = nom;
      p.innerHTML = T(l.t);
      btn.textContent = T(i < lineas.length - 1 ? "Siguiente ▶" : (l.boton || "¡Vamos! ▶"));
      retrato(rc, tipo, l.q === "zumbo" ? "#3498db" : undefined);
    }
    btn.addEventListener("click", () => {
      SON.clic(); i++;
      if (i < lineas.length) mostrar();
      else { caja.remove(); if (fin) fin(); }
    });
    mostrar();
    btn.focus({ preventScroll: true });
  }

  let avisoTimer = null;
  function aviso(txt, ms = 3200) {
    avisoEl.innerHTML = T(txt);
    avisoEl.classList.add("visible");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => avisoEl.classList.remove("visible"), ms);
  }
  function panel(html, clase = "") {
    capa.innerHTML = `<div class="av-panel ${clase}">${html}</div>`;
    capa.hidden = false;
    capa.scrollTop = 0;
    return capa.firstElementChild;
  }
  function cerrarPanel() { capa.hidden = true; capa.innerHTML = ""; }
  const estrellasHTML = (n) => `<p class="av-estrellas" aria-label="${T("{n} de 3 estrellas", { n })}">${"★".repeat(n)}<span>${"★".repeat(3 - n)}</span></p>`;

  /* ==========================================================
     Navegación entre capítulos
     ========================================================== */
  let escena = null;
  const CAPITULOS = [
    { titulo: "La familia de la colmena", emoji: "🏠", crear: () => escenaFamilia() },
    { titulo: "¿Quién nace de cada celda?", emoji: "🥚", crear: () => escenaCeldas() },
    { titulo: "El gran vuelo del zángano", emoji: "🐝", crear: () => escenaZangano() },
    { titulo: "El vuelo nupcial de la reina", emoji: "👑", crear: () => escenaReina() },
    { titulo: "¡Nace una nueva colonia!", emoji: "🍯", crear: () => escenaColonia() }
  ];
  function limpiar() {
    cerrarPanel(); quitarDialogo(); hud.innerHTML = ""; chispas.length = 0;
    avisoEl.classList.remove("visible"); TECLAS.clear(); P.activo = false;
  }
  function alaVista() {
    const r = cont.getBoundingClientRect();
    if (!document.fullscreenElement && (r.top < 0 || r.bottom > innerHeight)) cont.scrollIntoView({ behavior: "smooth", block: r.height > innerHeight ? "start" : "center" });
  }
  function irA(i) { limpiar(); escena = CAPITULOS[i].crear(); alaVista(); }
  function irMenu() { limpiar(); escena = escenaMenu(); }

  function completar(i, estrellas, dato) {
    prog.estrellas[i] = Math.max(prog.estrellas[i] || 0, estrellas);
    guardar(); SON.premio();
    hud.innerHTML = "";
    const p = panel(`${estrellasHTML(estrellas)}
      <h2>${T("¡Capítulo {n} completado!", { n: i + 1 })}</h2>
      <div class="av-dato"><b>¿Sabía que…?</b> <span>${dato}</span></div>
      <div class="av-acciones">
        <button class="av-btn av-btn-grande" data-a="sig">Siguiente capítulo ▶</button>
        <button class="av-btn av-btn-claro" data-a="rep">↺ Repetir</button>
        <button class="av-btn av-btn-claro" data-a="menu">Capítulos</button>
      </div>`);
    p.addEventListener("click", (e) => {
      const a = e.target.closest("[data-a]")?.dataset.a;
      if (!a) return;
      SON.clic();
      if (a === "sig") irA(i + 1);
      else if (a === "rep") irA(i);
      else irMenu();
    });
    p.querySelector("button").focus({ preventScroll: true });
  }

  /* ==========================================================
     Portada
     ========================================================== */
  function escenaMenu() {
    const abejas = Array.from({ length: 8 }, (_, k) => ({
      tipo: k === 0 ? "reina" : k < 4 ? "zangano" : "obrera",
      x: azar(0, W), y: azar(H * 0.12, H * 0.62), v: azar(35, 70) * (Math.random() < 0.5 ? -1 : 1),
      fase: azar(0, 9), franja: k > 0 && k < 4 ? elegir(COLONIAS) : AMARILLO
    }));
    const total = prog.estrellas.reduce((a, b) => a + b, 0);
    let sig = prog.estrellas.findIndex((e) => !e);
    const p = panel(`
      <p class="av-eyebrow">Zánganos Lab presenta</p>
      <h2 class="av-titulo">La gran aventura de la colmena</h2>
      <p class="av-sub">Descubra cómo nacen las reinas y los zánganos… ¡y qué pasa en el vuelo nupcial!</p>
      <button class="av-btn av-btn-grande" data-c="${sig < 0 ? 0 : sig}">▶ ${T(sig === 0 ? "Empezar la aventura" : sig < 0 ? "Jugar de nuevo" : "Seguir jugando")}</button>
      <div class="av-capitulos">
        ${CAPITULOS.map((k, i) => `<button class="av-cap${i === sig ? " sig" : ""}" data-c="${i}">
          <span class="av-cap-emoji" aria-hidden="true">${k.emoji}</span>
          <span class="av-cap-n">${T("Capítulo {n}", { n: i + 1 })}</span>
          <b>${T(k.titulo)}</b>
          <span class="av-cap-est" aria-label="${T("{n} estrellas", { n: prog.estrellas[i] })}">${"★".repeat(prog.estrellas[i])}<i>${"★".repeat(3 - prog.estrellas[i])}</i></span>
        </button>`).join("")}
      </div>
      <p class="av-total">${T("⭐ {n} de 15 estrellas", { n: total })}</p>`, "av-panel-menu");
    p.addEventListener("click", (e) => {
      const b = e.target.closest("[data-c]");
      if (b) { SON.clic(); irA(Number(b.dataset.c)); }
    });
    return {
      actualizar(dt) {
        for (const b of abejas) {
          b.x += b.v * dt;
          if (b.x > W + 60) b.x = -60; if (b.x < -60) b.x = W + 60;
        }
      },
      dibujar(c) {
        cielo(c); sol(c, W * 0.86, H * 0.14, 36); nubes(c); paisaje(c);
        colmena(c, W * 0.12, H * 0.88, 1);
        for (const b of abejas) abeja(c, b.tipo, b.x, b.y + Math.sin(reloj * 2 + b.fase) * 10, 0.8, { dir: Math.sign(b.v), fase: b.fase, franja: b.franja, corona: true });
      }
    };
  }

  /* ==========================================================
     Capítulo 1 — La familia de la colmena
     ========================================================== */
  function escenaFamilia() {
    let fase = "intro", errores = 0, erroresTarea = 0, hallados = 0;
    const S = 1.5, META = 3;
    const abejas = [];
    const destino = (b) => { b.tx = azar(W * 0.1, W * 0.9); b.ty = azar(H * 0.18, H * 0.88); };
    ["reina", "zangano", "zangano", "zangano", ...Array(8).fill("obrera")].forEach((tipo) => {
      const b = { tipo, x: azar(W * 0.1, W * 0.9), y: azar(H * 0.15, H * 0.88), dir: 1, fase: azar(0, 9), vel: tipo === "reina" ? 26 : azar(30, 50), hallada: false, sacude: 0 };
      destino(b); abejas.push(b);
    });
    const centro = (b) => ({ x: b.x - (b.tipo === "reina" ? 10 : 4) * b.dir, y: b.y });

    function pildora() {
      hud.innerHTML = fase === "reina"
        ? '<div class="av-pildora">👑 Toque a la <b>reina</b>: es la abeja más larga</div>'
        : `<div class="av-pildora">${T("👀 Toque a los <b>zánganos</b>: ojos enormes y cuerpo redondo · <b>{a} / {b}</b>", { a: hallados, b: META })}</div>`;
    }
    dialogo([
      "¡Hola! Soy <b>Meli</b>, una abeja obrera. ¡Bienvenidos a nuestra colmena!",
      "En una colmena viven <b>tres tipos de abejas</b>. Conozcámoslas."
    ], tarjetas);

    function tarjetas() {
      const datos = [
        ["reina", "La reina", "Hay <b>una sola</b>. Es la <b>mamá de toda la colonia</b>: pone todos los huevos. Su abdomen es <b>largo</b>."],
        ["obrera", "Las obreras", "Son <b>miles</b> y todas son <b>hembras</b>. Limpian, cuidan a las crías, hacen la miel y defienden la colmena con su <b>aguijón</b>."],
        ["zangano", "Los zánganos", "Son los <b>machos</b>. Tienen <b>ojos enormes</b>, cuerpo redondo y <b>no tienen aguijón</b>. Su misión: aparearse con una reina."]
      ];
      const p = panel(`<h2>La familia de la colmena</h2>
        <div class="av-tarjetas">${datos.map(([t, n, d]) => `<div class="av-tarjeta"><canvas width="170" height="100" data-t="${t}" aria-hidden="true"></canvas><h3>${n}</h3><p>${d}</p></div>`).join("")}</div>
        <button class="av-btn av-btn-grande" data-a="ok">¡A buscarlas! ▶</button>`, "av-panel-ancho");
      p.querySelectorAll("canvas").forEach((cv) => {
        const t = cv.dataset.t, x = cv.getContext("2d");
        abeja(x, t, t === "reina" ? 98 : 88, 54, t === "reina" ? 1.25 : 1.3, { quieta: true });
      });
      p.querySelector("[data-a]").addEventListener("click", () => { SON.clic(); cerrarPanel(); fase = "reina"; pildora(); });
    }

    return {
      tocar(x, y) {
        if (fase !== "reina" && fase !== "zanganos") return;
        let mejor = null, md = 44 * S;
        for (const b of abejas) { const d = dist(centro(b), { x, y }); if (d < md) { md = d; mejor = b; } }
        if (!mejor) return;
        if (fase === "reina") {
          if (mejor.tipo === "reina") {
            mejor.hallada = true; SON.ok(); chispa(mejor.x, mejor.y, "#ffd21f", 14, "¡La reina!");
            aviso("¡Muy bien! Le ponemos una corona para no perderla de vista (las reinas de verdad no tienen).", 4200);
            fase = "zanganos"; erroresTarea = 0; pildora();
          } else {
            errores++; erroresTarea++; SON.mal(); mejor.sacude = 0.5;
            aviso(mejor.tipo === "zangano" ? "Ese es un zángano: mire sus ojos enormes. La reina es más larga." : "Esa es una obrera. La reina es más grande y su abdomen es más largo.");
          }
        } else if (fase === "zanganos") {
          if (mejor.tipo === "zangano" && !mejor.hallada) {
            mejor.hallada = true; hallados++; SON.ok(); chispa(mejor.x, mejor.y, "#2ecc71", 12, "¡Zángano!");
            pildora();
            if (hallados === META) {
              fase = "fin";
              setTimeout(() => dialogo([
                "¡Excelente! Ya conoce a toda la familia: <b>una reina</b>, <b>miles de obreras</b> y, en primavera y verano, <b>cientos de zánganos</b>."
              ], () => completar(0, errores <= 1 ? 3 : errores <= 3 ? 2 : 1,
                "En una colmena fuerte puede haber entre <b>20 000 y 60 000 obreras</b>, algunos cientos o miles de zánganos… ¡y una sola reina!")), 700);
            }
          } else if (mejor.tipo === "obrera") {
            errores++; erroresTarea++; SON.mal(); mejor.sacude = 0.5;
            aviso("Esa es una obrera: es más chica y tiene aguijón. Los zánganos tienen ojos enormes.");
          }
        }
      },
      actualizar(dt) {
        for (const b of abejas) {
          b.sacude = Math.max(0, b.sacude - dt);
          if (b.hallada && b.tipo === "zangano") continue;
          const d = Math.hypot(b.tx - b.x, b.ty - b.y);
          if (d < 8) destino(b);
          else { b.x += ((b.tx - b.x) / d) * b.vel * dt; b.y += ((b.ty - b.y) / d) * b.vel * dt; if (Math.abs(b.tx - b.x) > 3) b.dir = Math.sign(b.tx - b.x); }
        }
      },
      dibujar(c) {
        panal(c);
        c.fillStyle = "rgba(60,30,10,.42)"; c.fillRect(0, 0, W, H);
        const pista = erroresTarea >= 2;
        for (const b of abejas) {
          const objetivo = (fase === "reina" && b.tipo === "reina") || (fase === "zanganos" && b.tipo === "zangano" && !b.hallada);
          if (pista && objetivo) {
            const cc = centro(b);
            c.beginPath(); c.arc(cc.x, cc.y, 40 * S + 6 * Math.sin(reloj * 6), 0, Math.PI * 2);
            c.fillStyle = "rgba(255,255,255,.35)"; c.fill();
          }
          const sac = b.sacude > 0 ? Math.sin(b.sacude * 50) * 0.25 : 0;
          c.beginPath(); c.ellipse(b.x - 6 * b.dir, b.y + 22 * S, (b.tipo === "reina" ? 34 : 26) * S, 6 * S, 0, 0, Math.PI * 2);
          c.fillStyle = "rgba(30,15,5,.3)"; c.fill();
          abeja(c, b.tipo, b.x, b.y, S, { dir: b.dir, fase: b.fase, quieta: true, corona: b.hallada, rot: Math.sin(reloj * 9 + b.fase) * 0.05 + sac });
          if (b.hallada) {
            const cc = centro(b);
            c.beginPath(); c.arc(cc.x, cc.y, 40 * S, 0, Math.PI * 2);
            c.strokeStyle = b.tipo === "reina" ? "#ffcf1a" : "#2ecc71"; c.lineWidth = 4; c.stroke();
            etiqueta(c, b.tipo === "reina" ? "👑 Reina" : "✓ Zángano", cc.x, cc.y + 48 * S, b.tipo === "reina" ? "#ffcf1a" : "#2ecc71", b.tipo === "reina" ? CAFE : "#fff", 14);
          }
        }
        dibujarChispas(c);
      }
    };
  }

  /* ==========================================================
     Capítulo 2 — ¿Quién nace de cada celda?
     ========================================================== */
  function escenaCeldas() {
    const rondas = mezclar(["obrera", "obrera", "zangano", "zangano", "reina", "reina"]);
    let r = 0, aciertos = 0, fase = "intro", ani = 0, actual = rondas[0];
    const CELDA = { obrera: "Celda chica", zangano: "Celda grande", reina: "Celda real (con forma de maní)" };
    const DIAS = { obrera: [0, 3, 9, 21], zangano: [0, 3, 10, 24], reina: [0, 3, 8, 16] };
    const EXPLICA = {
      obrera: "En las <b>celdas chicas</b> la reina pone un <b>huevo fecundado</b> (con papá). De él nace una <b>obrera</b>, que es hembra. Tarda <b>21 días</b>.",
      zangano: "En las <b>celdas grandes</b> la reina pone un <b>huevo sin fecundar</b> (sin papá). De él nace un <b>zángano</b>, que es macho. Tarda <b>24 días</b>. ¡Los zánganos tienen mamá, pero no papá!",
      reina: "La <b>celda real</b> tiene un huevo fecundado, igual que una obrera. Pero la larva come <b>mucha jalea real</b>… ¡y se convierte en <b>reina</b>! Tarda solo <b>16 días</b>."
    };

    dialogo([
      "La reina pone <b>un huevo en cada celda</b> del panal. Pero las celdas no son todas iguales…",
      "Según la celda, nace una abeja distinta. ¿Adivinamos qué abeja nacerá en cada una?"
    ], pregunta);

    function pregunta() {
      actual = rondas[r]; ani = 0; fase = "pregunta";
      hud.innerHTML = `<div class="av-pildora">${T("Celda {a} de {b}", { a: r + 1, b: rondas.length })}</div>
        <div class="av-pregunta"><p>¿Qué abeja nacerá de esta celda?</p>
        <div class="av-opciones">${["obrera", "zangano", "reina"].map((t) => `<button class="av-opcion" data-t="${t}"><canvas width="120" height="76" aria-hidden="true"></canvas><span>${NOMBRE[t]}</span></button>`).join("")}</div></div>`;
      hud.querySelectorAll(".av-opcion").forEach((btn) => {
        const t = btn.dataset.t, cx = btn.querySelector("canvas").getContext("2d");
        abeja(cx, t, t === "reina" ? 70 : 64, 42, t === "reina" ? 0.95 : 1, { quieta: true });
        btn.addEventListener("click", () => responder(t));
      });
    }
    function responder(t) {
      if (fase !== "pregunta") return;
      const bien = t === actual;
      if (bien) { aciertos++; SON.ok(); } else SON.mal();
      fase = "crece"; ani = 0;
      hud.innerHTML = `<div class="av-pildora">${T("Celda {a} de {b}", { a: r + 1, b: rondas.length })}</div>
        <div class="av-explica ${bien ? "bien" : "mal"}"><b>${bien ? T("¡Correcto! 🎉") : T("¡Casi! Era: {x}", { x: T(NOMBRE[actual]) })}</b>
        <p>${EXPLICA[actual]}</p>
        <button class="av-btn">${r < rondas.length - 1 ? "Siguiente celda ▶" : "Terminar ▶"}</button></div>`;
      const b = hud.querySelector(".av-explica button");
      b.focus({ preventScroll: true });
      b.addEventListener("click", () => {
        SON.clic(); r++;
        if (r < rondas.length) pregunta();
        else {
          fase = "fin"; hud.innerHTML = "";
          completar(1, aciertos >= 6 ? 3 : aciertos >= 4 ? 2 : 1,
            "La reina y las obreras nacen del <b>mismo tipo de huevo</b>. Lo que convierte a una larva en reina es la <b>jalea real</b>, un alimento especial que preparan las obreras jóvenes.");
        }
      });
    }

    function contenido(c, tipo, cx, cy, R, etapa) {
      if (etapa === 0) { // huevo
        c.save(); c.translate(cx, cy); c.rotate(-0.25);
        c.beginPath(); c.ellipse(0, 0, R * 0.07, R * 0.2, 0, 0, Math.PI * 2);
        c.fillStyle = "#fffdf5"; c.fill(); c.strokeStyle = "#d8cfb5"; c.lineWidth = 1.5; c.stroke();
        c.restore();
      } else if (etapa === 1) { // larva en jalea
        c.beginPath(); c.ellipse(cx, cy, R * (tipo === "reina" ? 0.5 : 0.38), R * (tipo === "reina" ? 0.42 : 0.3), 0, 0, Math.PI * 2);
        c.fillStyle = tipo === "reina" ? "rgba(255,250,225,.95)" : "rgba(255,250,225,.6)"; c.fill();
        c.beginPath(); c.arc(cx, cy, R * 0.22, 0.4, Math.PI * 1.75);
        c.strokeStyle = "#fffaf0"; c.lineWidth = R * 0.14; c.lineCap = "round"; c.stroke();
        c.strokeStyle = "#e6dcc4"; c.lineWidth = 1.5; c.stroke();
        c.lineCap = "butt";
      } else if (etapa === 2) { // celda tapada
        c.save();
        if (tipo === "reina") { c.restore(); return; }
        hexPath(c, cx, cy, R * 0.86);
        const g = c.createRadialGradient(cx - R * 0.2, cy - R * 0.25, 2, cx, cy, R * (tipo === "zangano" ? 0.95 : 1.4));
        g.addColorStop(0, tipo === "zangano" ? "#fff3c8" : "#f6dc95"); g.addColorStop(1, "#d9aa45");
        c.fillStyle = g; c.fill();
        c.restore();
        etiqueta(c, tipo === "zangano" ? "Tapa abombada" : "Tapa de cera", cx, cy, "rgba(48,24,17,.75)", "#fff", 13);
      }
    }

    return {
      actualizar(dt) { if (fase === "crece") ani = Math.min(1, ani + dt / 3.4); },
      dibujar(c) {
        panal(c);
        c.fillStyle = "rgba(48,24,17,.45)"; c.fillRect(0, 0, W, H);
        const cx = W / 2, cy = H * 0.31, R = Math.min(W * 0.18, H * 0.2);
        // tarjeta
        c.fillStyle = "rgba(255,250,235,.96)";
        redondeado(c, cx - R * 2.1, cy - R * 1.45, R * 4.2, R * 2.75, 26); c.fill();
        const tipo = actual;
        const etapa = fase === "crece" ? Math.min(3, Math.floor(ani * 4)) : 0;
        if (tipo === "reina") {
          // borde del panal y celda real colgando
          c.fillStyle = "#e9a91c"; c.fillRect(cx - R * 1.6, cy - R * 1.3, R * 3.2, R * 0.35);
          c.beginPath();
          c.moveTo(cx - R * 0.42, cy - R * 0.95);
          c.bezierCurveTo(cx - R * 0.75, cy - R * 0.3, cx - R * 0.35, cy + R * 0.2, cx - R * 0.5, cy + R * 0.65);
          c.bezierCurveTo(cx - R * 0.5, cy + R * 1.05, cx + R * 0.5, cy + R * 1.05, cx + R * 0.5, cy + R * 0.65);
          c.bezierCurveTo(cx + R * 0.35, cy + R * 0.2, cx + R * 0.75, cy - R * 0.3, cx + R * 0.42, cy - R * 0.95);
          c.closePath();
          c.fillStyle = etapa >= 2 ? "#d9a441" : "rgba(233,190,95,.55)"; c.fill();
          c.strokeStyle = "#a96a12"; c.lineWidth = 3; c.stroke();
          c.fillStyle = "rgba(169,106,18,.35)";
          for (let k = 0; k < 9; k++) { c.beginPath(); c.arc(cx + (hash(k) - 0.5) * R * 0.7, cy - R * 0.6 + hash(k + 4) * R * 1.4, 3.5, 0, Math.PI * 2); c.fill(); }
          if (etapa < 2) contenido(c, tipo, cx, cy + R * 0.25, R, etapa);
        } else {
          const rc = tipo === "zangano" ? R * 0.92 : R * 0.66;
          // comparación de tamaños: celda chica (obrera) y grande (zángano)
          const bx = cx + R * 1.45, by = cy + R * 0.55;
          [["chica", R * 0.2, -R * 0.3, "obrera"], ["grande", R * 0.27, R * 0.22, "zangano"]].forEach(([txt, rr, dx, t]) => {
            hexPath(c, bx + dx, by, rr);
            c.fillStyle = t === tipo ? "#ffe9a6" : "rgba(233,184,74,.35)"; c.fill();
            c.strokeStyle = t === tipo ? CAFE : "rgba(169,106,18,.6)"; c.lineWidth = t === tipo ? 3 : 2; c.stroke();
            c.font = "600 12px Jost, sans-serif"; c.fillStyle = CAFE; c.textAlign = "center";
            c.fillText(T(txt), bx + dx, by + R * 0.27 + 14);
          });
          hexPath(c, cx, cy, rc);
          const g = c.createRadialGradient(cx, cy, 2, cx, cy, rc);
          g.addColorStop(0, "#fff6d8"); g.addColorStop(1, "#e7b84a");
          c.fillStyle = g; c.fill(); c.strokeStyle = "#a96a12"; c.lineWidth = 4; c.stroke();
          if (etapa < 3) contenido(c, tipo, cx, cy, rc, etapa);
        }
        if (etapa === 3) {
          const k = clamp((ani - 0.75) / 0.25, 0, 1);
          abeja(c, tipo, cx + (tipo === "reina" ? 10 : 6), cy + (1 - k) * 18, (0.5 + 0.9 * k) * (R / 90), { corona: tipo === "reina" });
        }
        // rótulos
        etiqueta(c, CELDA[tipo], cx, cy - R * 1.2, CAFE, AMARILLO, 16);
        if (fase === "crece") {
          const nombres = ["Huevo", "Larva", "Pupa (celda tapada)", "¡Nació!"];
          const d = DIAS[tipo];
          const dia = Math.round(ani < 0.75 ? d[etapa] + (d[etapa + 1] - d[etapa]) * ((ani * 4) % 1) : d[3]);
          etiqueta(c, `${T(nombres[etapa])} · ${T("día {n}", { n: dia })}`, cx, cy + R * 1.12, "#fff", CAFE, 15);
        }
        dibujarChispas(c);
      }
    };
  }

  /* ==========================================================
     Capítulo 3 — El gran vuelo del zángano
     ========================================================== */
  function escenaZangano() {
    let fase = "intro", golpes = 0, miel = 0, energia = 0.25, inv = 0, avisoLimite = 0;
    const COLOR = "#3498db";
    let casa, z, gotas, acz, aves, enjambre;
    function armar() {
      casa = { x: W * 0.14, y: H * 0.88 };
      acz = { x: W * 0.78, y: H * 0.22, r: Math.min(W, H) * 0.14 };
      gotas = [{ x: casa.x - 55, y: casa.y - 165 }, { x: casa.x + 95, y: casa.y - 135 }, { x: casa.x + 25, y: casa.y - 225 }].map((g) => ({ ...g, ok: false }));
      aves = [{ x: W * 0.3, y: H * 0.47, v: 105, dir: 1, f: 0 }, { x: W * 0.75, y: H * 0.3, v: 135, dir: -1, f: 2 }];
    }
    function alInicio() { z = { x: casa.x + 20, y: casa.y - 90, vx: 0, vy: 0, dir: 1 }; }
    armar(); alInicio();
    enjambre = Array.from({ length: 15 }, () => ({ ang: azar(0, 6.3), rad: azar(0.15, 1), v: azar(0.7, 1.5) * (Math.random() < 0.5 ? -1 : 1), color: elegir(COLONIAS), fase: azar(0, 9) }));
    const limite = () => Math.min(H * 0.5, casa.y - 270);

    dialogo([
      { q: "zumbo", t: "¡Hola! Soy <b>Zumbo</b>, un zángano. Ya tengo 12 días y estoy listo para mi gran vuelo." },
      "Los zánganos salen en las <b>tardes de sol</b>, cuando hace calor y hay poco viento.",
      "Antes de salir, comen <b>miel</b> de la colmena para tener energía. Primero, ayudemos a Zumbo a comer <b>3 gotas de miel</b>.",
      { q: "zumbo", t: "Después volaré alto, hasta un <b>área de congregación de zánganos (ACZ)</b>: un lugar del cielo donde nos juntamos zánganos de muchas colmenas." },
      "Mueva a Zumbo con el <b>dedo</b>, el <b>mouse</b> o las <b>flechas</b> del teclado. ¡Cuidado con los pájaros!"
    ], () => { fase = "juego"; montarHud(); });

    let hMiel, hEnergia;
    function montarHud() {
      hud.innerHTML = `<div class="av-hud-fila"><span class="av-chip">🍯 <span>Miel</span> <b id="h-miel">${miel} / 3</b></span><span class="av-chip">⚡ <span>Energía</span> <span class="av-barra"><i id="h-energia"></i></span></span></div>`;
      hMiel = $("#h-miel"); hEnergia = $("#h-energia");
    }

    return {
      usaTeclas: true,
      redimensionar() { armar(); if (z) { z.x = clamp(z.x, 30, W - 30); z.y = clamp(z.y, 30, H * 0.88 - 30); } },
      actualizar(dt) {
        enjambre.forEach((e) => { e.ang += e.v * dt; });
        for (const a of aves) {
          a.x += a.v * a.dir * dt; a.f += dt;
          if (a.x > W + 80) a.x = -80; if (a.x < -80) a.x = W + 80;
        }
        if (fase !== "juego") return;
        inv = Math.max(0, inv - dt);
        mover(z, 255, dt);
        z.x = clamp(z.x, 25, W - 25); z.y = clamp(z.y, 25, casa.y - 30);
        if (miel < 3 && z.y < limite()) {
          z.y = limite(); z.vy = Math.max(0, z.vy);
          if (reloj - avisoLimite > 3) { avisoLimite = reloj; aviso("¡Todavía no! Primero hay que comer las 3 gotas de miel 🍯"); }
        }
        for (const g of gotas) {
          if (!g.ok && dist(g, z) < 40) {
            g.ok = true; miel++; energia = Math.min(1, energia + 0.25); SON.miel();
            chispa(g.x, g.y, "#ffb300", 10, "+ miel");
            if (miel === 3) aviso("¡Panza llena! Ahora, ¡a volar alto hasta la ACZ! ↗", 3800);
          }
        }
        if (miel >= 3 && z.y < casa.y - 120) energia -= dt * 0.011;
        if (energia <= 0) {
          aviso("Zumbo se quedó sin energía y volvió a la colmena. ¡A comer más miel!", 4000);
          miel = 0; energia = 0.25; gotas.forEach((g) => { g.ok = false; }); alInicio();
        }
        for (const a of aves) {
          const pa = { x: a.x, y: a.y + Math.sin(a.f * 2) * 18 };
          if (inv <= 0 && dist(pa, z) < 40) {
            golpes++; SON.golpe(); inv = 1.5;
            aviso("¡Uy, un pájaro! Algunas aves cazan zánganos en el aire. Zumbo se asustó y volvió a casa.", 4200);
            alInicio();
          }
        }
        if (miel >= 3 && dist(z, acz) < acz.r * 0.75) {
          fase = "fin"; SON.premio(); chispa(z.x, z.y, "#ffd21f", 22, "¡Llegó a la ACZ!");
          hud.innerHTML = "";
          setTimeout(() => dialogo([
            { q: "zumbo", t: "¡Llegué a la ACZ! Hay zánganos de colmenas de todos lados. Ahora, a esperar que pase una reina…" },
            "Solo algunos zánganos logran aparearse. Los demás vuelven a la colmena al atardecer y lo intentan otro día."
          ], () => completar(2, 3 - Math.min(2, golpes),
            "Las ACZ están a entre <b>10 y 40 metros de altura</b> y los zánganos las usan <b>año tras año</b>. En una sola ACZ se pueden juntar <b>miles de zánganos</b> de muchas colmenas.")), 900);
        }
        if (hEnergia) { hEnergia.style.width = Math.round(energia * 100) + "%"; hMiel.textContent = `${miel} / 3`; }
      },
      dibujar(c) {
        cielo(c); sol(c, W * 0.9, H * 0.1, 30); nubes(c); paisaje(c);
        zonaACZ(c, acz, "ACZ");
        for (const e of enjambre) {
          const x = acz.x + Math.cos(e.ang) * e.rad * acz.r * 0.85, y = acz.y + Math.sin(e.ang) * e.rad * acz.r * 0.6;
          abeja(c, "zangano", x, y, 0.55, { dir: e.v > 0 ? -Math.sign(Math.sin(e.ang)) || 1 : Math.sign(Math.sin(e.ang)) || 1, franja: e.color, fase: e.fase });
        }
        colmena(c, casa.x, casa.y, 1.05);
        for (const g of gotas) if (!g.ok) {
          gotaMiel(c, g.x, g.y + Math.sin(reloj * 3 + g.x) * 5, 1.15);
          if (fase === "juego" && miel < 3) { c.beginPath(); c.arc(g.x, g.y, 26 + 4 * Math.sin(reloj * 5), 0, Math.PI * 2); c.strokeStyle = "rgba(255,255,255,.8)"; c.lineWidth = 2.5; c.stroke(); }
        }
        if (fase === "juego" && miel < 3) {
          c.save(); c.setLineDash([8, 8]); c.strokeStyle = "rgba(48,24,17,.25)"; c.lineWidth = 2;
          c.beginPath(); c.moveTo(0, limite()); c.lineTo(W, limite()); c.stroke(); c.restore();
        }
        for (const a of aves) ave(c, a.x, a.y + Math.sin(a.f * 2) * 18, 0.95, a.dir, a.f);
        if (!(inv > 0 && Math.floor(reloj * 10) % 2)) {
          abeja(c, "zangano", z.x, z.y, 0.95, { dir: z.dir, franja: COLOR });
          if (fase === "juego") etiqueta(c, "Zumbo", z.x, z.y - 40, "rgba(255,255,255,.85)", CAFE, 13);
        }
        if (fase === "juego" && miel >= 3) {
          const a = Math.atan2(acz.y - z.y, acz.x - z.x);
          c.save(); c.translate(z.x + Math.cos(a) * 60, z.y + Math.sin(a) * 60); c.rotate(a);
          c.globalAlpha = 0.6 + 0.4 * Math.sin(reloj * 6);
          c.beginPath(); c.moveTo(14, 0); c.lineTo(-6, -10); c.lineTo(-6, 10); c.closePath(); c.fillStyle = CAFE; c.fill();
          c.restore();
        }
        dibujarChispas(c);
      }
    };
  }

  /* ==========================================================
     Capítulo 4 — El vuelo nupcial de la reina
     ========================================================== */
  function escenaReina() {
    const META = 12, TIEMPO = 170;
    let fase = "intro", vidas = 3, inv = 0, t = 0, apareos = [], camX = 0, llena = false, repone = 0, avisoTarde = false, avisoHermano = 0, primerApareo = true;
    let WW, casa, cerca, acz, reina, zanganos, aves;
    const suelo = () => H * 0.88;

    function layout() {
      WW = Math.max(W * 2.6, 2300);
      casa = { x: 150, y: suelo() };
      cerca = { x: Math.max(W * 0.72, 620), y: H * 0.34, r: Math.min(W, H) * 0.14 };
      acz = { x: WW - W * 0.5, y: H * 0.32, r: Math.min(W, H) * 0.21 };
    }
    function nuevoZangano(zona, hermano, entra) {
      const a = azar(0, 6.28);
      const z = { zona, hermano, color: hermano ? AMARILLO : elegir(COLONIAS), ang: a, rad: azar(0.25, 1) * zona.r, vang: azar(0.6, 1.3) * (Math.random() < 0.5 ? -1 : 1), x: 0, y: 0, vx: 0, vy: 0, dir: 1, fase: azar(0, 9), estado: "orbita", cd: 0, alfa: 1, rot: 0, rapidez: azar(215, 250) };
      if (entra) { z.x = zona.x + (Math.random() < 0.5 ? -1 : 1) * W * 0.7; z.y = azar(H * 0.1, H * 0.6); z.estado = "llega"; }
      else { z.x = zona.x + Math.cos(a) * z.rad; z.y = zona.y + Math.sin(a) * z.rad * 0.7; }
      zanganos.push(z);
    }
    function reiniciar() {
      layout();
      vidas = 3; inv = 0; t = 0; apareos = []; llena = false; avisoTarde = false; primerApareo = true;
      reina = { x: casa.x + 40, y: casa.y - 170, vx: 0, vy: 0, dir: 1 };
      camX = 0; zanganos = [];
      for (let i = 0; i < 7; i++) nuevoZangano(cerca, true);
      nuevoZangano(cerca, false);
      for (let i = 0; i < 18; i++) nuevoZangano(acz, Math.random() < 0.1);
      aves = [
        { x0: cerca.x + cerca.r * 2, x1: acz.x - acz.r * 1.5, x: (cerca.x + acz.x) / 2, y: H * 0.24, v: 115, dir: 1, f: 0 },
        { x0: acz.x - acz.r * 1.6, x1: acz.x + acz.r * 1.6, x: acz.x, y: H * 0.62, v: 120, dir: -1, f: 2 }
      ];
    }
    reiniciar();

    dialogo([
      { q: "lia", t: "¡Hola! Soy <b>Lía</b>, una reina joven. Nací hace 6 días y hoy salgo por primera vez: ¡es mi <b>vuelo nupcial</b>!" },
      "Cerca de casa hay una ACZ con muchos de sus <b>hermanos</b> (los de rayas <b>amarillas</b>). Por eso las reinas suelen volar <b>más lejos</b>.",
      "En la <b>ACZ lejana</b> hay zánganos de muchas colmenas: <b>cada color es una colmena distinta</b>.",
      { q: "lia", t: "Mi misión: aparearme con <b>12 zánganos</b> de otras colmenas y <b>volver a casa</b> antes de que se haga tarde." },
      "Los zánganos la encuentran por su <b>olor</b> (una feromona) y la ven con sus <b>ojos enormes</b>. ¡Cuidado con los pájaros!"
    ], () => { fase = "juego"; montarHud(); });

    let hV, hA, hD, hS;
    function montarHud() {
      hud.innerHTML = `<div class="av-hud-fila">
        <span class="av-chip" id="h-vidas" aria-label="${T("Vidas")}"></span>
        <span class="av-chip">🫙 <span>Espermateca</span> <b id="h-ap">0 / ${META}</b><span class="av-puntos" id="h-dots"></span></span>
        <span class="av-chip">☀️ <span>Tarde</span> <span class="av-barra sol"><i id="h-sol"></i></span></span></div>`;
      hV = $("#h-vidas"); hA = $("#h-ap"); hD = $("#h-dots"); hS = $("#h-sol");
      pintarHud();
    }
    function pintarHud() {
      if (!hV) return;
      hV.textContent = "❤️".repeat(vidas) + "🤍".repeat(3 - vidas);
      hA.textContent = `${apareos.length} / ${META}`;
      hD.innerHTML = apareos.map((col) => `<i style="background:${col}"></i>`).join("");
    }
    function fallar(msg) {
      fase = "fin"; SON.mal(); hud.innerHTML = "";
      const p = panel(`<h2>¡Uy!</h2><p>${msg}</p><div class="av-acciones"><button class="av-btn av-btn-grande" data-a="otra">↺ Intentar de nuevo</button><button class="av-btn av-btn-claro" data-a="menu">Capítulos</button></div>`);
      p.addEventListener("click", (e) => {
        const a = e.target.closest("[data-a]")?.dataset.a;
        if (!a) return;
        SON.clic();
        if (a === "menu") return irMenu();
        cerrarPanel(); reiniciar(); fase = "juego"; montarHud();
      });
    }

    return {
      usaTeclas: true,
      depurar: () => ({ zanganos, reina, acz, cerca, camX, WW }),
      redimensionar() {
        const fx = reina.x / WW, ax = zanganos.map((z) => z.x / WW);
        const zonas = { cerca, acz };
        layout();
        zanganos.forEach((z, i) => { z.zona = z.zona === zonas.cerca ? cerca : acz; z.x = ax[i] * WW; });
        reina.x = fx * WW; reina.y = clamp(reina.y, 40, suelo() - 40);
        if (aves) { aves[0].x0 = cerca.x + cerca.r * 2; aves[0].x1 = acz.x - acz.r * 1.5; aves[0].y = H * 0.24; aves[1].x0 = acz.x - acz.r * 1.6; aves[1].x1 = acz.x + acz.r * 1.6; aves[1].y = H * 0.62; }
      },
      actualizar(dt) {
        for (const a of aves) {
          a.f += dt; a.x += a.v * a.dir * dt;
          if (a.x > a.x1) { a.x = a.x1; a.dir = -1; }
          if (a.x < a.x0) { a.x = a.x0; a.dir = 1; }
        }
        const jugando = fase === "juego";
        if (jugando) {
          t += dt; inv = Math.max(0, inv - dt);
          mover(reina, 250, dt, camX);
          reina.x = clamp(reina.x, 30, WW - 30); reina.y = clamp(reina.y, 40, suelo() - 40);
        }
        camX += (clamp(reina.x - W * 0.45, 0, WW - W) - camX) * Math.min(1, dt * 5);
        // zánganos
        for (let i = zanganos.length - 1; i >= 0; i--) {
          const z = zanganos[i];
          z.cd = Math.max(0, z.cd - dt);
          if (z.estado === "cae") {
            z.vy += 220 * dt; z.y += z.vy * dt; z.alfa -= dt * 0.9; z.rot += dt * 2.5;
            if (z.alfa <= 0) zanganos.splice(i, 1);
            continue;
          }
          const d = dist(z, reina);
          let tx, ty, vel;
          if (jugando && !llena && d < 240 && z.cd <= 0) {
            tx = reina.x; ty = reina.y; vel = z.rapidez;
          } else if (z.estado === "llega") {
            z.ang += z.vang * dt;
            tx = z.zona.x + Math.cos(z.ang) * z.rad; ty = z.zona.y + Math.sin(z.ang) * z.rad * 0.7; vel = 150;
            if (Math.hypot(tx - z.x, ty - z.y) < 30) z.estado = "orbita";
          } else {
            z.ang += z.vang * dt;
            tx = z.zona.x + Math.cos(z.ang) * z.rad; ty = z.zona.y + Math.sin(z.ang) * z.rad * 0.7; vel = 120;
          }
          const dd = Math.hypot(tx - z.x, ty - z.y) || 1;
          const k = Math.min(1, dt * 6);
          z.vx += (((tx - z.x) / dd) * Math.min(vel, dd * 3) - z.vx) * k;
          z.vy += (((ty - z.y) / dd) * Math.min(vel, dd * 3) - z.vy) * k;
          z.x += z.vx * dt; z.y += z.vy * dt;
          if (Math.abs(z.vx) > 8) z.dir = Math.sign(z.vx);
          if (!jugando || llena || d > 40) continue;
          if (z.hermano) {
            if (z.cd <= 0) {
              z.cd = 2.5; z.vx = ((z.x - reina.x) / (d || 1)) * 320; z.vy = ((z.y - reina.y) / (d || 1)) * 320;
              if (reloj - avisoHermano > 4) { avisoHermano = reloj; SON.clic(); aviso("Ese zángano de rayas amarillas es su <b>hermano</b> 💛. ¡Busquemos zánganos de otras colmenas!", 3600); }
            }
          } else {
            z.estado = "cae"; z.vy = -50; apareos.push(z.color); SON.ok();
            chispa(z.x, z.y, z.color, 12, `${apareos.length} / ${META}`);
            if (primerApareo) { primerApareo = false; aviso("¡Apareamiento! El zángano le entrega sus espermatozoides a la reina… y ahí termina su vida: cumplió su misión.", 5000); }
            pintarHud();
            if (apareos.length >= META) {
              llena = true; SON.premio();
              aviso("¡La espermateca está llena! Ahora, ¡de vuelta a casa! 🏠", 4500);
            }
          }
        }
        // que no se amontonen todos en el mismo punto
        for (let i = 0; i < zanganos.length; i++) {
          const a = zanganos[i];
          if (a.estado === "cae") continue;
          for (let j = i + 1; j < zanganos.length; j++) {
            const b = zanganos[j];
            if (b.estado === "cae") continue;
            const dx = b.x - a.x, dy = b.y - a.y, dd = Math.hypot(dx, dy);
            if (dd > 0 && dd < 26) { const em = ((26 - dd) / dd) * 0.5; a.x -= dx * em; a.y -= dy * em; b.x += dx * em; b.y += dy * em; }
          }
        }
        // reponer zánganos en la ACZ lejana
        repone -= dt;
        if (repone <= 0) {
          repone = 1.5;
          const enACZ = zanganos.filter((z) => z.zona === acz && z.estado !== "cae").length;
          if (enACZ < 14) nuevoZangano(acz, Math.random() < 0.1, true);
        }
        if (!jugando) return;
        // aves
        for (const a of aves) {
          const pa = { x: a.x, y: a.y + Math.sin(a.f * 2) * 22 };
          if (inv <= 0 && dist(pa, reina) < 42) {
            vidas--; inv = 2; SON.golpe(); pintarHud();
            const d = dist(pa, reina) || 1;
            reina.vx = ((reina.x - pa.x) / d) * 500; reina.vy = ((reina.y - pa.y) / d) * 500;
            if (vidas <= 0) return fallar("Los pájaros asustaron mucho a Lía y tuvo que volver a la colmena. Las reinas corren peligros en su vuelo nupcial. ¡Probemos otra vez!");
            aviso("¡Cuidado, un pájaro! Las aves cazan abejas en el aire.");
          }
        }
        hS.style.width = Math.round(Math.max(0, 1 - t / TIEMPO) * 100) + "%";
        if (!avisoTarde && t > TIEMPO * 0.72) { avisoTarde = true; aviso("¡Se está haciendo tarde! ☀️ Las reinas vuelven a casa antes de que refresque."); }
        if (t > TIEMPO) return fallar("Se hizo tarde y empezó a refrescar. Las reinas vuelan solo en las horas cálidas de la tarde. ¡Probemos otra vez!");
        if (llena && dist(reina, { x: casa.x, y: casa.y - 70 }) < 90) {
          fase = "fin"; prog.padres = apareos.slice(); guardar();
          const colonias = new Set(apareos).size;
          const est = 1 + (vidas >= 2 ? 1 : 0) + (colonias >= 4 ? 1 : 0);
          hud.innerHTML = ""; SON.premio(); chispa(reina.x, reina.y, "#ffd21f", 24, "¡En casa!");
          setTimeout(() => dialogo([
            { q: "lia", t: T("¡Lo logramos! Me apareé con <b>{a} zánganos</b> de <b>{b} colmenas distintas</b>. ¡Ya puedo ser la mamá de una gran colonia!", { a: apareos.length, b: colonias }) }
          ], () => completar(3, est,
            "En la vida real, una reina se aparea con <b>unos 12 a 20 zánganos</b>, en uno o pocos vuelos. Guarda sus espermatozoides en la <b>espermateca</b> y los usa <b>toda su vida</b>, que puede durar varios años.")), 900);
        }
      },
      dibujar(c) {
        const k = clamp(t / TIEMPO, 0, 1);
        const mezcla = (a, b) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",")})`;
        cielo(c, mezcla([143, 211, 255], [246, 168, 110]), mezcla([233, 247, 255], [255, 222, 170]));
        sol(c, W * 0.85, H * (0.1 + k * 0.45), 32);
        nubes(c, camX); paisaje(c, camX);
        c.save(); c.translate(-camX, 0);
        zonaACZ(c, cerca, "ACZ cercana", false);
        zonaACZ(c, acz, "ACZ lejana");
        colmena(c, casa.x, casa.y, 1.05);
        if (llena) etiqueta(c, "🏠 ¡Casa!", casa.x, casa.y - 140, CAFE, AMARILLO, 16);
        for (const z of zanganos) abeja(c, "zangano", z.x, z.y, 0.62, { dir: z.dir, franja: z.color, fase: z.fase, alfa: z.alfa, rot: z.rot });
        for (const a of aves) ave(c, a.x, a.y + Math.sin(a.f * 2) * 22, 1, a.dir, a.f);
        if (!(inv > 0 && Math.floor(reloj * 10) % 2)) abeja(c, "reina", reina.x, reina.y, 0.95, { dir: reina.dir, corona: true });
        if (fase === "juego") etiqueta(c, "Lía", reina.x, reina.y - 40, "rgba(255,255,255,.85)", CAFE, 13);
        dibujarChispas(c);
        c.restore();
        if (fase === "juego") {
          if (llena) flechaBorde(c, casa.x, casa.y - 80, camX, "Casa");
          else flechaBorde(c, acz.x, acz.y, camX, "ACZ lejana");
        }
      }
    };
  }

  /* ==========================================================
     Capítulo 5 — ¡Nace una nueva colonia! + preguntas
     ========================================================== */
  function escenaColonia() {
    let fase = "intro", k = 0, espera = 0, rapido = 1, fin = 0;
    const padres = prog.padres && prog.padres.length ? prog.padres : mezclar([...COLONIAS, ...COLONIAS]).slice(0, 12);
    let celdas = [];
    const reina = { x: 0, y: 0, dir: 1 };
    function armar() {
      celdas = [];
      const filas = [];
      for (let fila = 0; fila * R_HEX * 1.5 < H + R_HEX; fila++) {
        const y = fila * R_HEX * 1.5;
        if (y < H * 0.24 || y > H * 0.86) continue;
        const fil = [];
        for (let col = 0; col * W_HEX < W + W_HEX; col++) {
          const x = col * W_HEX + (fila % 2 ? W_HEX / 2 : 0);
          if (x < W * 0.08 || x > W * 0.92) continue;
          fil.push(x);
        }
        filas.push({ y, xs: filas.length % 2 ? fil.reverse() : fil });
      }
      for (const f of filas) for (const x of f.xs) {
        const tipo = Math.random() < 0.12 ? "zangano" : "obrera";
        celdas.push({ x, y: f.y, t: -1, tipo, color: tipo === "zangano" ? AMARILLO : elegir(padres), rot: azar(-0.5, 0.5), dir: Math.random() < 0.5 ? -1 : 1 });
      }
      k = Math.min(k, celdas.length);
      if (celdas[0]) { reina.x = celdas[0].x; reina.y = celdas[0].y; }
    }
    armar();
    const POR_CELDA = Math.max(0.03, 7 / Math.max(1, celdas.length));

    dialogo([
      { q: "lia", t: "¡Volví a casa! Guardé los espermatozoides de mis zánganos en un saquito llamado <b>espermateca</b>. ¡Me alcanzan para toda la vida!" },
      "A los pocos días, la reina empieza a poner huevos: ¡<b>hasta 2000 por día</b>! Miremos cómo crece la colonia."
    ], () => {
      fase = "pone";
      const unicos = [...new Set(padres)];
      hud.innerHTML = `<div class="av-hud-fila"><span class="av-chip"><span>Papás de las obreras:</span> <span class="av-puntos">${unicos.map((c) => `<i style="background:${c}"></i>`).join("")}</span></span>
        <span class="av-chip"><span>Zánganos: solo mamá</span> <span class="av-puntos"><i style="background:${AMARILLO}"></i></span></span>
        <button class="av-chip av-chip-btn" id="h-rapido">⏩ Más rápido</button></div>`;
      $("#h-rapido").addEventListener("click", (e) => { rapido = rapido === 1 ? 3 : 1; e.currentTarget.textContent = T(rapido === 1 ? "⏩ Más rápido" : "▶ Normal"); });
    });

    function cuento() {
      hud.innerHTML = "";
      dialogo([
        "¿Vio los colores? Cada obrera tiene los colores de <b>su papá</b>. Como la reina se apareó con muchos zánganos, ¡la colonia es muy variada!",
        "Esa variedad hace a la colonia <b>más fuerte</b>: resiste mejor las enfermedades y los cambios del clima.",
        "Y los zánganos nuevos (rayas amarillas) nacieron de <b>huevos sin fecundar</b>: solo tienen mamá. En primavera volarán a una ACZ… ¡y la historia vuelve a empezar!",
        { q: "meli", t: "¿Jugamos a las preguntas? 🤓", boton: "¡Sí! ▶" }
      ], preguntas);
    }

    const PREG = [
      { p: "¿De qué huevo nace un zángano?", o: ["De un huevo sin fecundar (sin papá)", "De un huevo fecundado (con papá)", "De un huevo con jalea real"], b: 0, e: "Los zánganos nacen de huevos sin fecundar: tienen mamá, pero no papá." },
      { p: "¿Dónde se aparean la reina y los zánganos?", o: ["Dentro de la colmena", "En el aire, en un área de congregación de zánganos (ACZ)", "Sobre las flores"], b: 1, e: "Se aparean en pleno vuelo, en las ACZ, a entre 10 y 40 metros de altura." },
      { p: "¿Con cuántos zánganos se aparea una reina?", o: ["Con uno solo", "Con ninguno", "Con muchos: unos 12 a 20"], b: 2, e: "Se aparea con muchos zánganos de distintas colmenas y guarda sus espermatozoides en la espermateca." },
      { p: "¿Qué convierte a una larva en reina?", o: ["Comer mucha jalea real", "El color de la celda", "Nacer primero que las demás"], b: 0, e: "Reinas y obreras nacen del mismo tipo de huevo, pero la futura reina come mucha jalea real." },
      { p: "¿Por qué es bueno que las obreras tengan papás distintos?", o: ["Porque así son más lindas", "Porque la colonia es más fuerte y resiste mejor las enfermedades", "No importa"], b: 1, e: "La diversidad genética ayuda a la colonia a enfrentar enfermedades y cambios del ambiente." }
    ];
    function preguntas() {
      let q = 0, bien = 0;
      function mostrar() {
        const P_ = PREG[q];
        const p = panel(`<p class="av-eyebrow">${T("Pregunta {a} de {b}", { a: q + 1, b: PREG.length })}</p><h2>${P_.p}</h2>
          <div class="av-respuestas">${P_.o.map((o, i) => `<button class="av-resp" data-i="${i}">${o}</button>`).join("")}</div>
          <div class="av-feedback" hidden></div>`);
        p.querySelectorAll(".av-resp").forEach((btn) => btn.addEventListener("click", () => {
          if (p.dataset.listo) return;
          p.dataset.listo = "1";
          const i = Number(btn.dataset.i), ok = i === P_.b;
          if (ok) { bien++; SON.ok(); } else SON.mal();
          p.querySelectorAll(".av-resp").forEach((b, j) => { b.disabled = true; if (j === P_.b) b.classList.add("bien"); else if (j === i) b.classList.add("mal"); });
          const fb = p.querySelector(".av-feedback");
          fb.hidden = false;
          fb.innerHTML = `<b>${T(ok ? "¡Correcto! 🎉" : "¡Casi!")}</b> <span>${T(P_.e)}</span><br><button class="av-btn av-btn-grande">${T(q < PREG.length - 1 ? "Siguiente pregunta ▶" : "Ver mi diploma 🏅")}</button>`;
          const sig = fb.querySelector("button");
          sig.focus({ preventScroll: true });
          sig.addEventListener("click", () => { SON.clic(); q++; if (q < PREG.length) mostrar(); else diploma(bien); });
        }));
      }
      mostrar();
    }
    function diploma(bien) {
      const est = bien >= 5 ? 3 : bien >= 3 ? 2 : 1;
      prog.estrellas[4] = Math.max(prog.estrellas[4] || 0, est); guardar(); SON.premio();
      const total = prog.estrellas.reduce((a, b) => a + b, 0);
      const p = panel(`<div class="av-diploma">
        <p class="av-medalla" aria-hidden="true">🏅</p>
        <p class="av-eyebrow">Diploma de la colmena</p>
        <h2>¡Experto o experta en reinas y zánganos!</h2>
        ${estrellasHTML(est)}
        <p>${T("Respondió bien <b>{a} de {b}</b> preguntas · Total de la aventura: <b>⭐ {c} de 15</b>", { a: bien, b: PREG.length, c: total })}</p>
        <ul class="av-aprendido">
          <li>👑 Hay <b>una reina</b>, la mamá de toda la colonia.</li>
          <li>🥚 Huevo <b>con papá</b> → hembra (obrera o reina). Huevo <b>sin papá</b> → zángano.</li>
          <li>🍯 La <b>jalea real</b> convierte a una larva en reina.</li>
          <li>☁️ Reinas y zánganos se aparean <b>en el aire</b>, en las <b>ACZ</b>.</li>
          <li>🌈 La reina se aparea con <b>muchos zánganos</b>: así la colonia es más fuerte.</li>
        </ul>
        <div class="av-acciones">
          <button class="av-btn av-btn-grande" data-a="menu">↺ Volver a jugar</button>
          <a class="av-btn av-btn-claro" href="mapa.html">📍 Ver las ACZ reales en el mapa</a>
        </div></div>`, "av-panel-ancho");
      if (typeof enlacesConIdioma === "function") enlacesConIdioma(p);
      p.querySelector("[data-a]").addEventListener("click", () => { SON.clic(); irMenu(); });
    }

    return {
      redimensionar() { const hechos = celdas.filter((c) => c.t >= 0).length; armar(); celdas.forEach((c, i) => { if (i < hechos) c.t = 5; }); k = hechos; },
      actualizar(dt) {
        if (fase !== "pone") return;
        const d = dt * rapido;
        for (const c of celdas) if (c.t >= 0) c.t += d;
        if (k < celdas.length) {
          const obj = celdas[k];
          const dd = Math.hypot(obj.x - reina.x, obj.y - reina.y);
          if (Math.abs(obj.x - reina.x) > 2) reina.dir = Math.sign(obj.x - reina.x);
          const paso = Math.min(dd, 650 * d);
          if (dd > 0) { reina.x += ((obj.x - reina.x) / dd) * paso; reina.y += ((obj.y - reina.y) / dd) * paso; }
          espera -= d;
          if (dd < 4 && espera <= 0) { obj.t = 0; k++; espera = POR_CELDA; }
        } else {
          fin += d;
          if (fin > 3.6) { fase = "cuento"; cuento(); }
        }
      },
      dibujar(c) {
        panal(c);
        c.fillStyle = "rgba(60,30,10,.4)"; c.fillRect(0, 0, W, H);
        for (const cel of celdas) {
          if (cel.t < 0) continue;
          hexPath(c, cel.x, cel.y, R_HEX - 3);
          c.fillStyle = cel.t >= 3.3 ? cel.color + "aa" : "#f5c95a"; c.fill();
          if (cel.t < 1.1) { // huevo
            c.beginPath(); c.ellipse(cel.x, cel.y, 3, 8, cel.rot, 0, Math.PI * 2); c.fillStyle = "#fffdf5"; c.fill();
          } else if (cel.t < 2.2) { // larva
            c.beginPath(); c.arc(cel.x, cel.y, 9, 0.4, Math.PI * 1.75); c.strokeStyle = "#fffaf0"; c.lineWidth = 6; c.lineCap = "round"; c.stroke(); c.lineCap = "butt";
          } else if (cel.t < 3.3) { // tapada
            hexPath(c, cel.x, cel.y, R_HEX - 3);
            c.fillStyle = cel.tipo === "zangano" ? "#f1d27e" : "#e8c068"; c.fill();
            if (cel.tipo === "zangano") { c.beginPath(); c.arc(cel.x - 3, cel.y - 4, 7, 0, Math.PI * 2); c.fillStyle = "rgba(255,255,255,.35)"; c.fill(); }
          } else {
            const s = cel.tipo === "zangano" ? 0.6 : 0.55;
            abeja(c, cel.tipo, cel.x + 4 * cel.dir, cel.y, s, { dir: cel.dir, franja: cel.color, quieta: true, rot: cel.rot * 0.4 + Math.sin(reloj * 4 + cel.x) * 0.05 });
          }
        }
        abeja(c, "reina", reina.x, reina.y - 6, 0.85, { dir: reina.dir, corona: true, quieta: true, rot: Math.sin(reloj * 10) * 0.04 });
        dibujarChispas(c);
      }
    };
  }

  /* ---------- Arranque ---------- */
  let ultimo = performance.now();
  function bucle(ahora) {
    const dt = Math.min(0.05, (ahora - ultimo) / 1000);
    ultimo = ahora; reloj += dt;
    actualizarChispas(dt);
    ctx.setTransform(ESC * DPR, 0, 0, ESC * DPR, 0, 0);
    if (escena) { escena.actualizar && escena.actualizar(dt); escena.dibujar(ctx); }
    requestAnimationFrame(bucle);
  }
  ajustar();
  escena = escenaMenu();
  requestAnimationFrame(bucle);

  // Para probar el equilibrio sin pantalla visible (no afecta el juego)
  window.__aventura = { irA, irMenu, get escena() { return escena; }, paso: (dt) => { reloj += dt; actualizarChispas(dt); escena.actualizar(dt); } };
})();
