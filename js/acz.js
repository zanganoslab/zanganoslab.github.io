/* ==========================================================
   MAPA DE ÁREAS DE CONGREGACIÓN DE ZÁNGANOS (ACZ)
   Para agregar una ACZ, copie un bloque { ... } y complete:
     sitio     → nombre del lugar
     region    → provincia, departamento o municipio
     pais      → "Argentina", "Bolivia", "Puerto Rico"…
     lat, lng  → coordenadas en grados decimales (sur y oeste en negativo)
     anio      → año del primer registro (opcional)
     estado    → "confirmada": revisitada en años siguientes con más de 50 zánganos en cada visita
                 "registrada": identificada, a la espera de nuevas revisitas
     precision → "aproximada" si la ubicación se estimó (por ejemplo, desde una figura publicada)
     fuente    → publicación o informe que la respalda (opcional)
   PRIVACIDAD: este archivo es público. Cargue las coordenadas redondeadas a 2 decimales
   (unos 1,1 km); las exactas quedan en la planilla interna y se comparten a pedido.
   ========================================================== */

const PRECISION_KM = 1; // radio de la zona que se dibuja alrededor de cada ACZ

const FUENTES = {
  arg2017: { texto: "Galindo-Cardona et al. (2017). Revista de la Sociedad Entomológica Argentina", url: "https://doi.org/10.25085/rsea.761207" },
  arg2020: { texto: "Galindo-Cardona et al. (2020). Frontiers in Ecology and Evolution", url: "https://doi.org/10.3389/fevo.2020.590345" },
  bol2024: { texto: "Escalante et al. (2024). Journal of Apicultural Research", url: "https://doi.org/10.1080/00218839.2024.2417478" },
  pr2012:  { texto: "Galindo-Cardona et al. (2012). Journal of Insect Science", url: "https://doi.org/10.1673/031.012.12201" },
  lab:     { texto: "Registros de campo de Zánganos Lab", url: "" },
  coopsol: { texto: "Informe técnico para la Cooperativa Coopsol (2019)", url: "" }
};

const ACZ = [
  // ---------- Argentina · Buenos Aires ----------
  { sitio: "Castelar (Alimentos)", region: "Buenos Aires", pais: "Argentina", lat: -34.59, lng: -58.68, estado: "confirmada", fuente: "arg2020" },
  { sitio: "Castelar (IGEAF)", region: "Buenos Aires", pais: "Argentina", lat: -34.62, lng: -58.65, estado: "confirmada", fuente: "arg2020" },
  { sitio: "Areco I", region: "Buenos Aires", pais: "Argentina", lat: -34.18, lng: -59.44, estado: "confirmada", fuente: "arg2020" },
  { sitio: "Areco II", region: "Buenos Aires", pais: "Argentina", lat: -34.18, lng: -59.44, estado: "confirmada", fuente: "arg2020" },
  // ---------- Argentina · Entre Ríos ----------
  { sitio: "San Salvador I", region: "Entre Ríos", pais: "Argentina", lat: -31.62, lng: -58.41, anio: 2019, estado: "confirmada", fuente: "lab" },
  { sitio: "San Salvador II", region: "Entre Ríos", pais: "Argentina", lat: -31.61, lng: -58.40, anio: 2019, estado: "confirmada", fuente: "lab" },
  { sitio: "San Salvador III", region: "Entre Ríos", pais: "Argentina", lat: -31.61, lng: -58.41, anio: 2019, estado: "confirmada", fuente: "lab" },
  // ---------- Argentina · Santiago del Estero ----------
  { sitio: "Bandera Bajada", region: "Santiago del Estero", pais: "Argentina", lat: -27.29, lng: -63.52, anio: 2019, estado: "confirmada", fuente: "coopsol", nota: "Primera ACZ hallada por el equipo en bosque chaqueño; más de mil zánganos atraídos al señuelo." },
  // ---------- Argentina · Tucumán ----------
  { sitio: "Alberdi", region: "Tucumán", pais: "Argentina", lat: -27.60, lng: -65.63, anio: 2017, estado: "confirmada", fuente: "arg2017", nota: "Primera ACZ reportada en Argentina." },
  { sitio: "Horco Molle", region: "Tucumán", pais: "Argentina", lat: -26.79, lng: -65.32, estado: "confirmada", fuente: "lab" },
  { sitio: "Horco Molle (Escuela)", region: "Tucumán", pais: "Argentina", lat: -26.78, lng: -65.32, estado: "confirmada", fuente: "lab" },
  { sitio: "Río Muerto", region: "Tucumán", pais: "Argentina", lat: -26.79, lng: -65.33, estado: "confirmada", fuente: "lab" },
  { sitio: "Manantial", region: "Tucumán", pais: "Argentina", lat: -26.84, lng: -65.28, estado: "confirmada", fuente: "lab" },
  { sitio: "La Rinconada", region: "Tucumán", pais: "Argentina", lat: -26.82, lng: -65.34, estado: "confirmada", fuente: "lab" },
  { sitio: "Malvinas", region: "Tucumán", pais: "Argentina", lat: -26.93, lng: -65.27, estado: "confirmada", fuente: "lab" },
  { sitio: "Benjamín Paz", region: "Tucumán", pais: "Argentina", lat: -26.37, lng: -65.27, estado: "confirmada", fuente: "lab" },
  { sitio: "Río Nío", region: "Tucumán", pais: "Argentina", lat: -26.45, lng: -65.01, estado: "confirmada", fuente: "lab" },
  // ---------- Bolivia · Tarija (coordenadas publicadas en el artículo) ----------
  { sitio: "Pirity I (Villa Montes)", region: "Tarija", pais: "Bolivia", lat: -21.34, lng: -63.40, anio: 2023, estado: "confirmada", fuente: "bol2024", nota: "Primeras ACZ registradas en Bolivia; más de 100 zánganos observados." },
  { sitio: "Pirity II (Villa Montes)", region: "Tarija", pais: "Bolivia", lat: -21.35, lng: -63.40, anio: 2023, estado: "confirmada", fuente: "bol2024", nota: "Primeras ACZ registradas en Bolivia; más de 100 zánganos observados." },
  // ---------- Puerto Rico (2008-2009) ----------
  // El artículo no publica coordenadas: ubicación estimada desde la Figura 1B (error de algunos km).
  { sitio: "Costa norte", region: "Puerto Rico", pais: "Puerto Rico", lat: 18.47, lng: -66.22, anio: 2008, estado: "confirmada", precision: "aproximada", fuente: "pr2012" },
  { sitio: "Oeste I", region: "Puerto Rico", pais: "Puerto Rico", lat: 18.11, lng: -67.20, anio: 2008, estado: "confirmada", precision: "aproximada", fuente: "pr2012" },
  { sitio: "Oeste II", region: "Puerto Rico", pais: "Puerto Rico", lat: 18.12, lng: -67.17, anio: 2008, estado: "confirmada", precision: "aproximada", fuente: "pr2012" },
  { sitio: "Este I", region: "Puerto Rico", pais: "Puerto Rico", lat: 18.37, lng: -66.08, anio: 2008, estado: "confirmada", precision: "aproximada", fuente: "pr2012" },
  { sitio: "Este II", region: "Puerto Rico", pais: "Puerto Rico", lat: 18.34, lng: -66.01, anio: 2008, estado: "confirmada", precision: "aproximada", fuente: "pr2012" },
  { sitio: "Este III", region: "Puerto Rico", pais: "Puerto Rico", lat: 18.32, lng: -65.98, anio: 2008, estado: "confirmada", precision: "aproximada", fuente: "pr2012" },
  { sitio: "Noreste I", region: "Puerto Rico", pais: "Puerto Rico", lat: 18.39, lng: -65.77, anio: 2008, estado: "confirmada", precision: "aproximada", fuente: "pr2012" },
  { sitio: "Noreste II", region: "Puerto Rico", pais: "Puerto Rico", lat: 18.31, lng: -65.68, anio: 2008, estado: "confirmada", precision: "aproximada", fuente: "pr2012" }
];
