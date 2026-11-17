/* ==========================================================
   Datos en vivo de la colmena (Kit Apícola IoT, Edgardo Díaz)
   API pública de solo lectura: https://monitoreo-apis-iot.duckdns.org/api/public
   Reglas de uso (guía de la API): /latest como máximo cada 60 s, /history cada 5 min,
   pausar con la pestaña oculta y esperar cada vez más ante errores.
   ========================================================== */

const ColmenaAPI = (() => {
  // En la vista previa local (localhost) el servidor de pruebas reenvía /api/public a la API real,
  // porque la API solo acepta pedidos desde https://zanganoslab.github.io
  const API = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
    ? "/api/public"
    : "https://monitoreo-apis-iot.duckdns.org/api/public";

  const VARIABLES = {
    temperatura_interior_colmena: { grupo: "interior", tipo: "temperatura", nombre: "Temperatura interior de la colmena", corto: "Interior" },
    humedad_interior_colmena: { grupo: "interior", tipo: "humedad", nombre: "Humedad interior de la colmena", corto: "Interior" },
    temperatura_crias: { grupo: "crias", tipo: "temperatura", nombre: "Temperatura de las crías", corto: "Crías" },
    humedad_crias: { grupo: "crias", tipo: "humedad", nombre: "Humedad de las crías", corto: "Crías" },
    temperatura_exterior_ambiente: { grupo: "exterior", tipo: "temperatura", nombre: "Temperatura exterior", corto: "Exterior" },
    humedad_exterior_ambiente: { grupo: "exterior", tipo: "humedad", nombre: "Humedad exterior", corto: "Exterior" }
  };

  // Las fechas vienen en UTC con hasta 6 decimales: se recortan a milisegundos
  const parseFecha = (texto) => new Date(String(texto).replace(/(\.\d{3})\d+/, "$1"));

  async function pedir(ruta) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const r = await fetch(API + ruta, { signal: ctrl.signal });
      if (!r.ok) {
        const retry = Number(r.headers.get("Retry-After"));
        return { ok: false, http: r.status, retryAfter: Number.isFinite(retry) && retry > 0 ? retry : null };
      }
      return { ok: true, datos: await r.json() };
    } catch (e) {
      return { ok: false, http: null, retryAfter: null }; // red, tiempo agotado o bloqueo
    } finally {
      clearTimeout(timer);
    }
  }

  /* El sensor exterior, cuando falla, informa temperatura 0 y humedad 0 a la vez.
     Esa combinación se trata como "sin lectura" (una humedad de 0 % no es posible). */
  const exteriorEnCero = (t, h) => t === 0 && h === 0;

  function limpiarUltimas(datos) {
    const mapa = {};
    (datos.measurements || []).forEach((m) => { mapa[m.variable] = { ...m, fecha: parseFecha(m.time) }; });
    const t = mapa.temperatura_exterior_ambiente, h = mapa.humedad_exterior_ambiente;
    if (t && h && exteriorEnCero(t.value, h.value)) { t.sinLectura = true; h.sinLectura = true; }
    return { generado: parseFecha(datos.generated_at), estado: datos.status, mapa };
  }

  function limpiarHistorial(datos) {
    const series = {};
    (datos.series || []).forEach((s) => { series[s.variable] = s.points.map((p) => ({ x: parseFecha(p.time), y: p.value })); });
    const t = series.temperatura_exterior_ambiente || [], h = series.humedad_exterior_ambiente || [];
    const ceros = new Set(t.filter((p, i) => h[i] && +h[i].x === +p.x && exteriorEnCero(p.y, h[i].y)).map((p) => +p.x));
    if (ceros.size) {
      series.temperatura_exterior_ambiente = t.filter((p) => !ceros.has(+p.x));
      series.humedad_exterior_ambiente = h.filter((p) => !ceros.has(+p.x));
    }
    return { modo: datos.range && datos.range.mode, recortado: datos.truncated, series };
  }

  /* Consulta periódica con pausa en pestaña oculta y espera creciente ante errores.
     alRecibir(resultado) recibe { ok, datos } o { ok: false, http }. */
  function sondear(ruta, intervaloMs, alRecibir, limpiar) {
    let temporizador = null, enCurso = false, proximo = 0, fallos = 0, detenido = false;
    async function ciclo() {
      temporizador = null; enCurso = true;
      const r = await pedir(ruta());
      enCurso = false;
      if (r.ok) { fallos = 0; alRecibir({ ok: true, datos: limpiar(r.datos) }); }
      else { fallos++; alRecibir(r); }
      const espera = r.ok ? intervaloMs
        : Math.max(Math.min(intervaloMs * 2 ** (fallos - 1), 300000), (r.retryAfter || 0) * 1000);
      proximo = Date.now() + espera * (1 + Math.random() * 0.1);
      programar();
    }
    function programar() {
      if (detenido || document.hidden || enCurso || temporizador !== null) return;
      temporizador = setTimeout(ciclo, Math.max(0, proximo - Date.now()));
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { clearTimeout(temporizador); temporizador = null; } else programar();
    });
    programar();
    return {
      ahora() { if (enCurso) return; clearTimeout(temporizador); temporizador = null; proximo = 0; programar(); },
      detener() { detenido = true; clearTimeout(temporizador); }
    };
  }

  /* "hace 5 min" en el idioma de la página (usa tr() de js/i18n.js) */
  function hace(segundos) {
    if (segundos < 90) return tr("hace instantes");
    const min = Math.round(segundos / 60);
    if (min < 90) return tr("hace {n} min", { n: min });
    const h = Math.round(min / 60);
    return h < 36 ? tr("hace {n} h", { n: h }) : tr("hace {n} días", { n: Math.round(h / 24) });
  }

  const ESTADOS = { online: "En línea", delayed: "Con retraso", offline: "Sin conexión", no_data: "Sin datos" };
  const numero = (v, dec = 1) => v.toLocaleString(IDIOMAS[LANG].locale, { minimumFractionDigits: dec, maximumFractionDigits: dec });

  return {
    VARIABLES, ESTADOS, parseFecha, hace, numero,
    ultimas: (alRecibir) => sondear(() => "/latest", 60000, alRecibir, limpiarUltimas),
    historial: (horas, alRecibir) => sondear(() => `/history?horas=${horas()}`, 300000, alRecibir, limpiarHistorial)
  };
})();
