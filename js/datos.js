/* ==========================================================
   CONTENIDO DEL SITIO
   Para actualizar la web solo es necesario editar este archivo:
   agregar una persona, una publicación o una noticia es
   copiar un bloque { ... }, pegarlo y cambiar los textos.
   ========================================================== */

/* ---------- Líneas de investigación ---------- */
const LINEAS = [
  {
    icono: "📍",
    titulo: "Áreas de congregación de zánganos",
    texto: "Localizamos y caracterizamos las áreas de congregación de zánganos (ACZ), donde zánganos y reinas se aparean, usando globos, barriletes y drones con feromonas."
  },
  {
    icono: "🧲",
    titulo: "Magnetorrecepción",
    texto: "Estudiamos la relación entre el campo magnético terrestre, la magnetita en el abdomen de los zánganos y la ubicación de las ACZ."
  },
  {
    icono: "🔬",
    titulo: "Sanidad apícola",
    texto: "Evaluamos varroosis, nosemosis y virus en apiarios y ACZ, y el papel de los zánganos en la dispersión de enfermedades."
  },
  {
    icono: "📐",
    titulo: "Morfometría",
    texto: "Medimos la forma y el tamaño de alas y cuerpo de los zánganos colectados en las ACZ para estimar su origen, el grado de africanización y la calidad reproductiva de las poblaciones."
  },
  {
    icono: "🧬",
    titulo: "Genética e hibridación",
    texto: "Analizamos la diversidad genética y la hibridación entre linajes africanizados y europeos de Apis mellifera en Argentina."
  },
  {
    icono: "📡",
    titulo: "Tecnología y monitoreo",
    texto: "Desarrollamos herramientas como RFID, sensores ambientales, magnetómetros de bajo costo y un Kit Apícola IoT para el monitoreo remoto de colmenas."
  },
  {
    icono: "🤝",
    titulo: "Etnobiología y divulgación",
    texto: "Indagamos qué saben la comunidad científica y apícola sobre los zánganos, y compartimos el conocimiento a través de cursos y encuentros."
  }
];

/* ---------- Servicios al público ----------
   Para sumar un servicio, copie un bloque { ... } y complete los campos.
   incluye: lista de lo que comprende el servicio (una línea por elemento). */
const SERVICIOS = [
  {
    icono: "📍",
    titulo: "Identificación de áreas de congregación de zánganos (ACZ)",
    texto: "Localizamos y caracterizamos las ACZ cercanas a su apiario o criadero de reinas. Conocer dónde se aparean las reinas permite planificar la reproducción, conservar los ecotipos locales y vigilar la sanidad de los zánganos de la zona.",
    incluye: [
      "Análisis previo del paisaje con imágenes satelitales",
      "Muestreo en campo con drones y señuelos con feromona",
      "Georreferenciación y mapa de las ACZ encontradas",
      "Informe con recomendaciones para el manejo reproductivo"
    ],
    destinatarios: "Apicultores, criaderos de reinas, cooperativas e instituciones."
  }
];

/* ---------- Informes técnicos ----------
   Informes de servicios realizados. Por confidencialidad con los clientes solo se
   muestra una vista previa (pocas páginas, sin mapas ni coordenadas) y el informe
   completo se solicita por correo.
   paginas: imágenes de la vista previa en img/informes/<carpeta>/01.jpg, 02.jpg…
            se declaran con vistaPrevia("carpeta", cantidad).
   Se ordenan solos, el más reciente primero. */
const vistaPrevia = (carpeta, cantidad) =>
  Array.from({ length: cantidad }, (_, i) => `img/informes/${carpeta}/${String(i + 1).padStart(2, "0")}.jpg`);
const INFORMES = [
  {
    anio: 2023,
    titulo: "Detección de áreas de apareamiento de abejas melíferas en Pirity, Villamontes, Bolivia",
    solicitante: "Federación Regional de Apicultores del Gran Chaco y ONG Ayuda en Acción",
    resumen: "Se identificaron dos ACZ cerca del Módulo de Crianza de Reinas de Pirity y se dictó un taller de campo sobre búsqueda de ACZ para más de 60 apicultores de distintas asociaciones de Bolivia.",
    paginas: vistaPrevia("villamontes-2023", 3),
    totalPaginas: 9
  },
  {
    anio: 2019,
    titulo: "Detección de áreas de apareamiento de abejas melíferas en Bandera Bajada, Santiago del Estero",
    solicitante: "Cooperativa Coopsol",
    resumen: "Se halló un ACZ en bosque chaqueño, con más de mil zánganos y sin infestación de Varroa: la primera ACZ encontrada por el equipo en un paisaje de bosque. Incluye recomendaciones para un plan reproductivo con genética local.",
    paginas: vistaPrevia("bandera-bajada-2019", 3),
    totalPaginas: 10
  },
  {
    anio: 2019,
    titulo: "Detección de áreas de apareamiento de abejas melíferas en San Salvador, Entre Ríos",
    solicitante: "Reinas del Litoral",
    resumen: "Se identificaron una zona de apareamiento principal y una satélite, se analizó la diversidad genética y el nivel de Varroa de los zánganos, y se propuso un plan reproductivo para el parque de fecundación de la cabaña.",
    paginas: vistaPrevia("san-salvador-2019", 2),
    totalPaginas: 5
  }
];

/* ---------- Equipo ----------
   grupo: "principal" o "activos"
   foto: ruta a una imagen (ej. "img/equipo/alberto.jpg"). Si se deja vacío se muestran las iniciales. */
const EQUIPO = [
  {
    grupo: "principal",
    nombre: "Alberto Galindo-Cardona",
    rol: "Investigador independiente CONICET · Director",
    foto: "img/equipo/alberto-galindo.jpg",
    texto: "Interesado en ecología, comportamiento reproductivo y salud de las abejas melíferas. Desarrolla proyectos sobre comportamiento de zánganos, áreas de congregación, magnetorrecepción, monitoreo inteligente de colmenas y salud apícola, combinando tecnologías como RFID, drones, sensores ambientales y magnetometría.",
    email: "hymenopterino@gmail.com",
    researchgate: "https://www.researchgate.net/profile/Alberto-Galindo-Cardona"
  },
  {
    grupo: "principal",
    nombre: "Karen Escalante",
    rol: "Licenciada en Biología · Becaria doctoral CONICET",
    foto: "img/equipo/karen-escalante.jpg",
    texto: "Trabaja en sanidad y genética de Apis mellifera en apiarios de Tucumán y sitios de apareamiento, analizando Varroosis, Nosemosis y diferentes especies de virus, además de la genética que prevalece en la provincia.",
    email: "karen.kmde@gmail.com",
    researchgate: "https://www.researchgate.net/profile/Karen-Escalante-2"
  },
  {
    grupo: "principal",
    nombre: "Harold Pulido-Guarín",
    rol: "Biólogo · Becario doctoral CONICET",
    foto: "img/equipo/harold-pulido.jpg",
    texto: "Interesado en la ecología del paisaje y el comportamiento animal, especialmente en insectos y abejas nativas. Estudia la posible relación entre el campo magnético terrestre y las áreas de congregación de zánganos (ACZ) de Apis mellifera.",
    email: "hypg0315@gmail.com",
    researchgate: "https://www.researchgate.net/profile/Harold-Pulido-Guarin-2"
  },
  {
    grupo: "activos",
    nombre: "Ailen Araoz",
    rol: "Estudiante de Biología · Fac. Cs. Naturales e IML, UNT",
    foto: "img/equipo/ailen-araoz.jpg",
    texto: "Su estudio se relaciona con el seguimiento de la actividad de zánganos de Apis mellifera y su relación con las condiciones ambientales.",
    email: "zanganoslab@gmail.com"
  },
  {
    grupo: "activos",
    nombre: "Edgardo Díaz",
    rol: "Estudiante de Ingeniería Electrónica · FACET, UNT",
    foto: "img/equipo/edgardo-diaz.jpg",
    texto: "Desarrolla un Kit Apícola tecnológico que permite el monitoreo remoto de colmenas de Apis mellifera.",
    email: "edgardordiaz95@gmail.com"
  },
  {
    grupo: "activos",
    nombre: "Ailen Contreras",
    rol: "Estudiante de Biología · Fac. Cs. Naturales e IML, UNT",
    foto: "img/equipo/ailen-contreras.jpg",
    texto: "Su estudio evalúa la morfometría de zánganos colectados en áreas de congregación de zánganos (ACZ) de Apis mellifera.",
    email: "zanganoslab@gmail.com"
  },
  {
    grupo: "activos",
    nombre: "Noelia Luna",
    rol: "Estudiante de la Tecnicatura Universitaria en Apicultura · Santiago del Estero",
    foto: "",
    texto: "Desarrolla estudios etnobiológicos para comprender qué se sabe sobre los zánganos de Apis mellifera en la comunidad científica, apícola y en general.",
    email: "zanganoslab@gmail.com"
  },
  {
    grupo: "activos",
    nombre: "Valentina Paz",
    rol: "Estudiante de Biología · Fac. Cs. Naturales e IML, UNT",
    foto: "",
    texto: "Desarrolla estudios histológicos en zánganos de Apis mellifera para determinar la cantidad de magnetita presente en su abdomen.",
    email: "zanganoslab@gmail.com"
  }
];

/* perfil: enlace al perfil (ResearchGate, Google Scholar, CONICET, ORCID, web institucional…).
   Si se deja vacío, el nombre se muestra sin enlace. */
const COLABORADORES = [
  { nombre: "A. Carolina Monmany Garzia", inst: "Investigadora, IER-CONICET-UNT", perfil: "https://www.researchgate.net/profile/A-Carolina-Monmany-Garzia" },
  { nombre: "Alejandra Carla Scannapieco", inst: "Investigadora, INTA", perfil: "https://www.researchgate.net/profile/Alejandra-Scannapieco" },
  { nombre: "María Clara Liendo", inst: "Investigadora, INTA-CONICET", perfil: "https://www.researchgate.net/profile/Maria-Liendo" },
  { nombre: "Romina Russo", inst: "Investigadora, INTA-CONICET", perfil: "https://www.researchgate.net/profile/Romina-Russo-2" },
  { nombre: "Carlos Molineri", inst: "Investigador, IBN-CONICET-UNT", perfil: "https://www.researchgate.net/profile/Carlos-Molineri" },
  { nombre: "Agustín Cebe", inst: "Becario, IER-CONICET-UNT", perfil: "https://www.researchgate.net/profile/Agustin-Cebe" },
  { nombre: "Tugrul Giray", inst: "Universidad de Puerto Rico", perfil: "https://www.researchgate.net/profile/Tugrul-Giray" },
  { nombre: "José Luis Agosto-Rivera", inst: "Universidad de Puerto Rico", perfil: "https://www.researchgate.net/profile/Jose-Luis-Agosto" },
  { nombre: "Martín Geria", inst: "Universidad de Puerto Rico", perfil: "https://ri.conicet.gov.ar/author/SI173481" },
  { nombre: "Robyn Underwood", inst: "Penn State University, EE. UU.", perfil: "https://www.researchgate.net/profile/Robyn-Underwood" },
  { nombre: "María Ayup", inst: "Profesora, Universidad Nacional de Tucumán (UNT)", perfil: "https://www.researchgate.net/profile/Maria-Ayup-2" },
  { nombre: "Rodrigo Velarde", inst: "", perfil: "https://orcid.org/0000-0002-3298-824X" }, // PENDIENTE: institución
  { nombre: "Verónica Albarracín", inst: "LADEAS – Laboratorio de Diagnóstico de Enfermedades Apícolas, FAZ-UNT", perfil: "https://faz.unt.edu.ar/ladeas/" },
  { nombre: "José Marcelo Durand", inst: "FACET, UNT", perfil: "" }
];

/* ---------- Instituciones educativas ----------
   Escuelas e instituciones con las que trabajamos.
   perfil: enlace a su sitio web (opcional). */
const INSTITUCIONES = [
  { nombre: "Escuela de Agricultura y Sacarotecnia", inst: "Escuela preuniversitaria, UNT", perfil: "https://www.eas.unt.edu.ar/" },
  { nombre: "Escuela Técnica Prof. Rafael Marino", inst: "Secundaria técnica, Tafí Viejo", perfil: "https://escuela-tecnica-prof-r-marino.webnode.page/" }
];

/* ---------- Productores, cooperativas y organizaciones ----------
   Productores apícolas y organizaciones con los que trabajamos. perfil: sitio web o red social (opcional). */
const PRODUCTORES = [
  { nombre: "Cooperativa Mora Micuna", inst: "Alberdi, Tucumán · Mario Gallo", perfil: "" },
  { nombre: "Mieles Don Bordallo", inst: "Famaillá, Tucumán · Víctor Bordallo", perfil: "https://www.instagram.com/mielesdonbordallo/" },
  { nombre: "Cooperativa Coopsol", inst: "Bandera Bajada, Santiago del Estero", perfil: "" },
  { nombre: "Reinas del Litoral", inst: "Cabaña de reinas · San Salvador, Entre Ríos", perfil: "" },
  { nombre: "Federación Regional de Apicultores del Gran Chaco", inst: "Villamontes, Bolivia · junto a la ONG Ayuda en Acción", perfil: "" }
];

/* ---------- Publicaciones ----------
   doi: solo el identificador (sin https://doi.org/) */
const PUBLICACIONES = [
  {
    anio: 2026,
    titulo: "Three methods for measuring the Earth's magnetic field intensity in Apis mellifera (Hymenoptera: Apidae) drone congregation areas",
    autores: "Pulido-Guarín H., Monmany-Garzia A.C., Scannapieco C., Ramírez-Mejía A., Geria M., Galindo-Cardona A.",
    revista: "Environmental Entomology",
    doi: "10.1093/ee/nvag056",
    resumen: `The presence of magnetite in the abdomen of Apis mellifera suggests a role in magnetic signal perception, aiding orientation and navigation. Reproduction occurs in drone congregation areas (DCA), which are spatially and temporally stable, appearing in spring-summer during regionally specific mating flight times (midday to evening), when Earth's magnetic field intensity (EMFI) often increases. This coincidence points to a possible link between magnetism and DCA location. We evaluated 3 EMFI measurement methods—2 mobile apps (Crowdmag, Phyphox) and a low-cost magnetometer—at 3 known DCA in Argentina. At each site, 80 georeferenced sampling points were arranged in a 6 m grid. EMFI was recorded daily during the morning and evening at 10 and 150 cm above the ground. Results showed moderate positive correlations between EMFI and geographic coordinates and height. A weak positive correlation was also detected between EMFI and time of the day. All methods detected EMFI variation, but the low-cost magnetometer gave the most consistent readings, supporting its value as an affordable, reliable tool for EMFI assessment in apicultural studies. Present findings provide a baseline for investigating methodologies to assess the potential role of EMFI affecting DCA formation and adult male honey bee orientation during mating flights, with potential applications in improving reproductive management of A. mellifera colonies.`
  },
  {
    anio: 2025,
    titulo: "When African and European Lineages Meet: The Genetic Landscape of Honey Bees in Argentina",
    autores: "Avalos A., Scannapieco A., Monmany-Garzia A.C., Kiran R., Marcelino J., Giordano R., Giray T., Galindo-Cardona A.",
    revista: "Ecology and Evolution (Nature Notes)",
    doi: "10.1002/ece3.72233",
    resumen: `Argentina has a complex and diverse landscape of honeybee (Apis mellifera sp.) populations shaped by historic introductions and hybridization between Africanized (AHB) and European (EHB) lineages. While a latitudinal cline of Africanization has been documented, the adaptive consequences of this genetic admixture and its implications for local beekeeping practices remain poorly understood. In this study, we provide a more in‐depth analysis of Argentine honeybee populations using recently published data from a panel of 272 SNP markers across five ecoregions to: (1) quantify how ancestry proportion (African A, European C/M) varies along geographic gradients, (2) assess whether ecoregion boundaries influence population structure, and (3) evaluate the potential trade‐offs between AHB and EHB ancestry in hybrid genomes. Our results confirm a strong latitudinal pattern of Africanization but reveal novel complexity, with C‐lineage ancestry inversely correlated with A‐lineage contributions while M‐lineage ancestry remains independent. We also detected trace contributions from the O lineage (Middle Eastern), highlighting Argentina's complex admixture history. Despite Argentina's diverse ecoregions, we find limited evidence for ecotype‐specific differentiation, suggesting gene flow may outweigh local adaptation—though sampling limitations warrant caution. By linking genetic patterns to apicultural relevance (e.g., AHB's northward expansion and hybridization zones), this study provides a framework for conserving genetic diversity and managing hive productivity across environmental gradients. Further genome‐wide analyses are needed to disentangle adaptive traits in this understudied yet economically critical pollinator system.`
  },
  {
    anio: 2025,
    titulo: "Effects of soybean fields on the health of Apis mellifera (Hymenoptera: Apidae) in the Chaco ecoregion",
    autores: "Monmany-Garzia A.C., Chacoff N., Aragón R., Sosa A., Aparicio V., Ayup M., Galindo-Cardona A.",
    revista: "Journal of Economic Entomology (Apiculture & Social Insects)",
    doi: "10.1093/jee/toaf002",
    resumen: `Honey bees (Apis mellifera) are important pollinators for natural and cultivated species. Due to their high sensitivity to stressors, they are also valuable indicators of environmental changes and agricultural management practices. In this study, we compared the performance and incidence of pesticides over sentinel hives within forest remnants with those within linear forest fragments (LFF) surrounded by soybean fields under conventional management. Sentinel hives in LFF showed some signs of deterioration, such as colony collapse, low numbers of brood frames, and pesticide occurrences, but honey production and the number of adult bees were similar to hives in the forest. Soybean pollen was scarce in honey and absent in bee bread, suggesting that bees may be relying more on wild plant species. We detected 5 pesticides (azoxystrobin, carbendazim, chlorpyrifos, imidacloprid, and coumaphos) in hives both at forests and LFF in pollen, bee bodies, and wax; pesticides in honey were detected in old sentinel hives (2 yr of exposition to agricultural conventional management). Only 2 of the 5 pesticides were applied in one of the farms under study, highlighting the importance of considering landscape-scale agricultural management. Our results indicate that conventional agriculture of soybean/maize primarily affected the performance of beehives, and pesticides were detected in honey only after long exposure to hives. Beekeeping in soybean fields in the Chaco could be feasible if cautions were followed, such as the conservation of forest fragments and key plant species, appropriate pesticide schedules, coordinated applications among farms, and linear forest remnants improvements.`
  },
  {
    anio: 2024,
    titulo: "Threshold of defensive response in Apis mellifera (honey bees) and subsequent brain gene expression in reaction to noxious stimuli",
    autores: "Acevedo-González J., Galindo-Cardona A., Fuenzalida-Uribe N., Ortiz-Alvarado Y., Ghezzi A., Giray T.",
    revista: "Entomologia Experimentalis et Applicata",
    doi: "10.1111/eea.13529",
    resumen: `Honey bee, Apis mellifera L. (Hymenoptera: Apidae), colonies and individuals respond variably to disturbances. The response depends on perception and interpretation of stimuli requiring both neural modulation and use of energy. In this study, we examined the role of neural modulation and brain metabolism in constitutive and experience‐dependent differences in defensive response. For constitutive differences, we compared brain gene expression in bees from gentle and defensive colonies identified in a standard colony‐level assay. For experience‐dependent changes in defensiveness response, we compared brain gene expression in control bees and bees that responded by sting extension to electric shock in a standardized individual behavioral assay. In both experiments, for neuromodulation, we examined membrane receptor genes for the biogenic amines dopamine (DopR2), octopamine (OA1), and serotonin (5HT2a), as well the gene for the enzyme responsible for serotonin synthesis (THR). For neural metabolism, we examined the expression of two Oxidative Phosphorylation Pathway "OXPHOS" genes (ND51 and ND20‐LIKE). Bees collected from defensive colonies had a significantly lower expression of amine receptor, synthesis gene, and OXPHOS genes. However, bees responding to noxious stimuli (i.e., electric shock) showed greater gene expression for both OXPHOS and neuromodulation genes, except for 5HT2a. We discuss the intriguing intersection of neuromodulation and neural metabolism in defensive response both for constitutive differences, and contrasting experience dependent or adaptive differences.`
  },
  {
    anio: 2024,
    titulo: "Drone Congregation areas of Apis mellifera (Hymenoptera: Apidae) and Nosema sp. (Nosematidae) in Bolivia: first report",
    autores: "Escalante K., Geria M., Mendizábal N., Galindo-Cardona A.",
    revista: "Journal of Apicultural Research",
    doi: "10.1080/00218839.2024.2417478",
    resumen: `Drone Congregation Areas (DCAs) are crucial natural gathering sites for Apis mellifera mating, like male leks in other animals. In these areas, virgin queens and drones from various hives congregate for mating, promoting genetic variability essential for colony adaptation and survival. Identifying drones in DCAs helps to understand the genetic variability within bee populations, which is crucial for promoting colony survival and resilience. Two areas in Villa Montes, Bolivia, were identified as potential DCAs through exploration methods utilizing satellite imagery. Furthermore, drones were captured within these DCAs using an attractive pheromone attached to an unmanned aerial vehicle to assess Nosema infection in the population.`
  },
  {
    anio: 2024,
    titulo: "HBeeID: a molecular tool that identifies honey bee subspecies from different geographic populations",
    autores: "Donthu R. et al., Galindo-Cardona A.",
    revista: "BMC Bioinformatics",
    doi: "10.1186/s12859-024-05776-9",
    resumen: `Background: Honey bees are the principal commercial pollinators. Along with other arthropods, they are increasingly under threat from anthropogenic factors such as the incursion of invasive honey bee subspecies, pathogens and parasites. Better tools are needed to identify bee subspecies. Genomic data for economic and ecologically important organisms is increasing, but in its basic form its practical application to address ecological problems is limited. Results: We introduce HBeeID a means to identify honey bees. The tool utilizes a knowledge-based network and diagnostic SNPs identified by discriminant analysis of principle components and hierarchical agglomerative clustering. Tests of HBeeID showed that it identifies African, Americas-Africanized, Asian, and European honey bees with a high degree of certainty even when samples lack the full 272 SNPs of HBeeID. Its prediction capacity decreases with highly admixed samples. Conclusion: HBeeID is a high-resolution genomic, SNP based tool, that can be used to identify honey bees and screen species that are invasive. Its flexible design allows for future improvements via sample data additions from other localities.`
  },
  {
    anio: 2024,
    titulo: "First large-scale study reveals important losses of managed honey bee and stingless bee colonies in Latin America",
    autores: "Requier F. et al., Galindo-Cardona A.",
    revista: "Scientific Reports",
    doi: "10.1038/s41598-024-59513-6",
    resumen: `Over the last quarter century, increasing honey bee colony losses motivated standardized large-scale surveys of managed honey bees (Apis mellifera), particularly in Europe and the United States. Here we present the first large-scale standardized survey of colony losses of managed honey bees and stingless bees across Latin America. Overall, 1736 beekeepers and 165 meliponiculturists participated in the 2-year survey (2016–2017 and 2017–2018). On average, 30.4% of honey bee colonies and 39.6% of stingless bee colonies were lost per year across the region. Summer losses were higher than winter losses in stingless bees (30.9% and 22.2%, respectively) but not in honey bees (18.8% and 20.6%, respectively). Colony loss increased with operation size during the summer in both honey bees and stingless bees and decreased with operation size during the winter in stingless bees. Furthermore, losses differed significantly between countries and across years for both beekeepers and meliponiculturists. Overall, winter losses of honey bee colonies in Latin America (20.6%) position this region between Europe (12.5%) and the United States (40.4%). These results highlight the magnitude of bee colony losses occurring in the region and suggest difficulties in maintaining overall colony health and economic survival for beekeepers and meliponiculturists.`
  },
  {
    anio: 2023,
    titulo: "Understanding the differential performance in hygienic behavior against dead brood of drones and workers of Apis mellifera: a chemical approach",
    autores: "Dugan D., Muntaabski I., Russo R., Galindo-Cardona A., Scannapieco A., Liendo M.",
    revista: "Journal of Apicultural Research",
    doi: "10.1080/00218839.2023.2285156",
    resumen: `Hygienic behavior is a social health mechanism displayed by honey bee workers of Apis mellifera by which dead or diseased brood is removed from the hive. Such behavior is known to be induced by olfactory cues. The efficiency of hygienic behavior toward drone brood cells is significantly lower than that of worker brood cells. A possible explanation for this difference lies in the cell wax cap of drone brood, which may act as a barrier to the diffusion of characteristic odors associated with diseased brood. The aim of this research was to explore the importance of drone cell wax cap as an interfering factor in the diffusion of chemical signals within honey bee colonies. To this end, brood removal percentages were compared among several types of brood: pin-killed worker, pin-killed drone, pin-killed worker with a healthy drone wax cap, healthy worker with a pin-killed drone wax cap, and healthy worker covered with a healthy drone wax cap. Results showed that the removal behavior did not differ between cells with pin-killed worker and pin-killed worker with a healthy drone wax cap, but was significantly higher towards healthy worker pupae covered with dead drone wax cap compared to the negative control (healthy worker pupa covered with a healthy drone cell wax cap). Present evidence suggests that chemical signals associated with the dead drone brood would be less volatile and retained to some extent in the wax cap, and partially explain the differential hygienic behavior between both types of brood.`
  },
  {
    anio: 2023,
    titulo: "Prevalence of Varroa destructor and first report of Nosema sp. in Apis mellifera drone congregation areas",
    autores: "Escalante K., Quintana M.G., Scannapieco A., Geria M., Galindo-Cardona A.",
    revista: "Acta Zoológica Lilloana",
    doi: "", // PENDIENTE: en Wix figuraba el mismo DOI que Litvinoff et al. 2022 (incorrecto)
    resumen: `Varroosis and nosemosis are diseases that affect honey bees (Apis mellifera) and therefore have a great impact on beekeeping worldwide. These parasites can be dispersed by drones and, in the case of Varroa destructor (etiological agent of varroasis), its presence has been reported in areas of natural fertilization of A. mellifera, known as Drone Congregation Areas (DCA). Previously, several DCAs were identified in Argentina and progress was made in their topographic and genetic characterization, and sanitary studies were also initiated. In this study, three DCA and one apiary located in the province of Tucumán were monitored for four years, and the presence of V. destructor and Nosema sp. was evaluated. The results indicated the presence of V. destructor in the drone samples of the DCA throughout the study. Although a trend of decreasing parasitization over time was observed, no statistically significant differences were found between years or among the considered DCAs. The presence of Nosema sp. was detected for the first time in the DCA, with samples exhibiting high spore load. The results support the role of drones in the dynamics and dispersal of diseases and allow us to conclude that the analysis of DCAs represents a key tool for monitoring the health of bee populations, complementary to the analyses carried out in apiaries.`
  },
  {
    anio: 2022,
    titulo: "Morphometric and genetic characterization as tools for selection of Apis mellifera (Hymenoptera: Apidae) stocks in an area of natural hybridization in Argentina",
    autores: "Litvinoff L., Menescardi F., Porrini L., Russo R., Liendo M., Nucci A., Lusarreta E., Ventura R., Espasadin L., Monmany-Garzia A.C., Scannapieco A., Galindo-Cardona A.",
    revista: "Frontiers in Insect Science",
    doi: "10.3389/finsc.2022.1073999",
    resumen: `Beekeepers around the world select bees' characteristics that facilitate and favor production. In regions where hybridization among lineages is taking place, this selection is a challenge, given that these regions are "natural laboratories", where the action of evolutionary processes of a population or species occurs in real time. A natural honeybee (Apis mellifera) hybrid zone exists in Argentina between 28° and 35° South, where Africanized (AHB) and European (EHB) populations converge. In this zone, beekeepers use selected genetic resources of European origin mostly, since the local Africanized bees show a higher defensive behavior, which is not desirable for management. Although EHB colonies have many advantages for honey production, they are not fully adapted to the subtropical climate and are susceptible to certain parasitosis such as varroosis. In addition, both AHB and EHB mate in drone congregation areas (DCAs), where males and virgin queens fly to meet, resulting in variability in the desired characteristics. In this study, we explored the degree of hybridization within a DCA and its reference apiary, located in the province of Entre Ríos, by applying two complementary techniques. First, morphotypes with different degrees of hybridization between European and African subspecies were observed in the reference apiary, indicating a high sensitivity of this morphometric approach to detect hybridization in these populations. Second, a genetic analysis revealed haplotypes of both origins for drones in DCAs, with a higher prevalence of European haplotypes, while all the colonies from the reference apiary exhibited European haplotypes. Overall, our results are in line with the strong impact that commercial beekeeping has on the genetics of DCAs. We show how wing morphometry may be used to monitor hybridization between European and African subspecies, a tool that may be evaluated in other regions of the world where hybridization occurs.`
  },
  {
    anio: 2021,
    titulo: "Analysis of Honeybee Drone Activity during the Mating Season in Northwestern Argentina",
    autores: "Ayup M., Gartner P., Agosto-Rivera J., Marendy P., De Souza P., Galindo-Cardona A.",
    revista: "Insects",
    doi: "10.3390/insects12060566",
    resumen: `Males in Hymenopteran societies are understudied in many aspects and it is assumed that they only have a reproductive function. We studied the time budget of male honey bees, drones, using multiple methods. Changes in the activities of animals provide important information on biological clocks and their health. Yet, in nature, these changes are subtle and often unobservable without the development and use of modern technology. During the spring and summer mating season, drones emerge from the hive, perform orientation flights, and search for drone congregation areas for mating. This search may lead drones to return to their colony, drift to other colonies (vectoring diseases and parasites), or simply get lost to predation. In a low percentage of cases, the search is successful, and drones mate and die. Our objective was to describe the activity of Apis mellifera drones during the mating season in Northwestern Argentina using three methods: direct observation, video recording, and radio frequency identification (RFID). The use of RFID tagging allows the tracking of a bee for 24 h but does not reveal the detailed activity of drones. We quantified the average number of drones' departure and arrival flights and the time outside the hive. All three methods confirmed that drones were mostly active in the afternoon. We found no differences in results between those obtained by direct observation and by video recording. RFID technology enabled us to discover previously unknown drone behavior such as activity at dawn and during the morning. We also discovered that drones may stay inside the hive for many days, even after initiation of search flights (up to four days). Likewise, we observed drones to leave the hive for several days to return later (up to three days). The three methods were complementary and should be considered for the study of bee drone activity, which may be associated with the diverse factors influencing hive health.`
  },
  {
    anio: 2021,
    titulo: "Using a sentinel colony of Apis mellifera (Hymenoptera: Apidae) to assess pesticides and food sources",
    autores: "Geria M., Chacoff N., Sosa A., Galindo-Cardona A.",
    revista: "Acta Zoológica Lilloana",
    doi: "10.30550/j.azl/2021.65.2/2021-06-23",
    resumen: `Honey bee populations are declining as occurs with other pollinators. One suggested cause of this decline is the impact of pesticides. To improve bees' health, pesticides and food sources may be monitored using sentinel hives, given that bees forage in a 2.5 km radius around the hive. We extracted 20 (twenty) bees, as well as samples of wax, honey and pollen from a sentinel hive. Six pesticides were detected in the samples, except for the honey. All detected pesticides in the sentinel hive are prohibited in Argentina. Eight different plant families and genera were detected in the honey and pollen samples. Our work suggests that monitoring pesticides with sentinel beehives will be useful to improve agricultural practices in the region.`
  },
  {
    anio: 2020,
    titulo: "Varroa destructor Parasitism and Genetic Variability at Honey Bee (Apis mellifera) Drone Congregation Areas and Their Associations With Environmental Variables in Argentina",
    autores: "Galindo-Cardona A., Scannapieco A., Russo R., Escalante K., Geria M., Lepori N., Ayup M., Muntaabski I., Liendo M., Landi L., Giray T., Monmany-Garzia A.C.",
    revista: "Frontiers in Ecology and Evolution",
    doi: "10.3389/fevo.2020.590345",
    resumen: `Varroa destructor is a serious ectoparasite of the western honey bee, Apis mellifera, which negatively impacts on colonies health and survival worldwide. Drone-mediated movement and the presence of the mite in Drone Congregation Areas (DCA) may play a relevant role in Varroa dispersal. The objectives of this study were to characterize mite infestation levels and genetic diversity in DCAs and surrounding apiaries and to explore putative environmental variables associated to Varroa infestation in two eco-climatic regions of Argentina (temperate, and subtropical). Phoretic mite proportions in DCAs and apiaries were estimated during spring. Landscape, topographic, and climate variables were described using satellite image classifications and data from public databases. The genetic composition of drones at the DCAs and workers from the surrounding apiaries was assessed using mitochondrial markers. In total, eleven DCAs were identified in both regions during 2017 and 2018. The mean proportion of Varroa was ca. 3 in 1,000 (0.0028 ± 0.0046) at the apiaries, and ca. 2 in 100 (0.0168 ± 0.0227) at the DCAs. No statistical differences were observed between apiaries and DCAs or between ecoregions, but the proportion of infested males at the DCAs was positively correlated to the distance to the apiary and a trend was observed toward higher mite loads in DCAs. Landscape and topography were not determinant for Varroa infestation at the DCAs but relative humidity and precipitation in the previous week of sampling, positively influenced infestation. More haplotypic diversity was detected in the DCAs compared to the surrounding apiaries, particularly in the subtropical region. While in this region high prevalence of Africanized (A1, A4) mitochondrial lineages was detected, European lineages (C1, C2j) were mostly found in apiaries and DCA in the temperate region. Our results provide valuable information on the dynamics of Varroa parasitism in apiaries and DCAs, and highlight the role of drones in mite dispersion and genetic variability of new colonies. The study of DCAs emerges as a tool for investigating not only honey bee reproduction and conservation, but also the impact of the environment on bee epidemiology.`
  },
  {
    anio: 2017,
    titulo: "Primer reporte de un Área de Congregación de Zánganos de Apis mellifera (Hymenoptera: Apidae) de Argentina",
    autores: "Galindo-Cardona A., Quiroga O., Bianchi E., Ayup M.",
    revista: "Revista de la Sociedad Entomológica Argentina",
    doi: "10.25085/rsea.761207",
    resumen: `La reproducción natural de las abejas melíferas ocurre en zonas denominadas áreas de congregación de zánganos (ACZ), visitadas por machos, denominados zánganos, y reinas integrantes de varias colonias. Dichas áreas se caracterizan por ser abiertas, protegidas del viento por cubierta vegetal alta y es muy común encontrarlas cerca de un apiario. En la Argentina, hasta el momento no se había localizado ninguna ACZ. Primero se determinó el horario de actividad de zánganos, observando la entrada y salida a las colmenas de 8:00 a 18:00 horas. La actividad de los zánganos tuvo dos picos, de 11:00 a 12:00 horas y de 15:00 a 17:30 horas. Luego se hizo la identificación de la ruta de movimiento de zánganos, utilizando globos inflados con helio y barriletes. Cada punto de contacto de zánganos en el cebo fue georreferenciado con GPS. Encontramos la primera ACZ en el norte de Argentina, cerca de una cabaña de crianza de reinas en Alberdi, Tucumán (ARG). Este estudio es importante ya que implementa una metodología para monitorear ACZ, la cual ayudaría en el estudio de la salud de las abejas y en la estimación de la estructura y diversidad genética de Apis mellifera L., también en apicultura, ya que brindaría una herramienta a los apicultores para la conservación de los ecotipos regionales mediante el planeamiento reproductivo de las abejas.`
  }
];

/* ---------- Noticias ----------
   Cada noticia tiene su propia página (noticia.html?id=...). Para agregar una:
   1. Cree una carpeta en img/noticias/ con las fotos numeradas: 01.jpg, 02.jpg, 03.jpg…
   2. Copie un bloque { ... } y complete:
      id       → nombre corto sin espacios ni tildes (se usa en el enlace)
      fecha    → año-mes-día, ej. "2026-09-11" (se ordenan solas, la más nueva primero)
      resumen  → 1 o 2 frases para la tarjeta de la página principal
      cuerpo   → el texto completo, un párrafo por cada "…"
      fotos    → galeria("carpeta", cantidad, "extensión")
      instagram → enlace a la publicación (opcional) */
const galeria = (carpeta, cantidad, ext = "jpg") =>
  Array.from({ length: cantidad }, (_, i) => `img/noticias/${carpeta}/${String(i + 1).padStart(2, "0")}.${ext}`);

const NOTICIAS = [
  {
    id: "filapi-2026",
    fecha: "2026-09-06",
    titulo: "Zánganos Lab en el XVII Congreso Latinoamericano de Apicultura – FILAPI 2026",
    resumen: "Del 31 de agosto al 6 de septiembre participamos del congreso FILAPI 2026 en Mar del Plata, compartiendo nuestro trabajo y generando nuevos vínculos de colaboración.",
    cuerpo: [
      "Del 31 de agosto al 6 de septiembre, el equipo del Laboratorio de Zánganos del IER-CONICET participó del XVII Congreso Latinoamericano de Apicultura – FILAPI 2026, realizado en la ciudad de Mar del Plata. El congreso reunió a investigadores, profesionales, productores, estudiantes, referentes, autoridades gubernamentales e instituciones del sector apícola.",
      "Para nuestro laboratorio, este espacio representó una oportunidad para compartir el trabajo que desarrollamos, conocer otras investigaciones y generar nuevos vínculos y posibilidades de colaboración para futuras experiencias y proyectos.",
      "Queremos agradecer especialmente al IER-CONICET, por el acompañamiento y respaldo a nuestro trabajo; al Laboratorio de Genética y Comportamiento de Abejas y otros insectos, por el intercambio y la colaboración; a la Sociedad Latinoamericana de Investigación en Abejas (SOLATINA), por la experiencia previa y el apoyo; y a los medios de comunicación y divulgación AM Apicultura, Ecos de la Colmena y La Miel en tu Radio, que nos brindaron su espacio para contar qué hacemos y por qué investigamos.",
      "Nos llevamos nuevos conocimientos, preguntas, proyectos y encuentros que enriquecen nuestro camino. ¡Hasta la próxima!"
    ],
    fotos: galeria("filapi-2026", 15, "webp"),
    instagram: "https://www.instagram.com/p/DdKyMHGjSf_/"
  },
  {
    id: "solatina-2026",
    fecha: "2026-08-30",
    titulo: "Premio a mejor póster en el VII Workshop de SOLATINA en Mar del Plata",
    resumen: "Participamos del VII Workshop de la Sociedad Latinoamericana de Investigación en Abejas, donde Harold Pulido-Guarín obtuvo el premio a mejor póster del encuentro.",
    cuerpo: [
      "Zánganos Lab estuvo presente en el VII Workshop de la Sociedad Latinoamericana de Investigación en Abejas (SOLATINA), organizado los días 29 y 30 de agosto en la ciudad de Mar del Plata, Argentina.",
      "Fue un espacio para generar conocimiento y colaboraciones hacia el futuro del estudio de las abejas en América Latina.",
      "Agradecemos a los organizadores y felicitamos a Harold Pulido-Guarín por obtener el premio a mejor póster del encuentro."
    ],
    fotos: galeria("solatina-2026", 6),
    instagram: "https://www.instagram.com/p/DcypUnnkT0j/"
  },
  {
    id: "encuentro-apicola-2026",
    fecha: "2026-08-13",
    titulo: "Zánganos Lab participa en el 4.º Encuentro Apícola Federal de Tucumán",
    resumen: "Compartimos ciencia e innovación en la Sociedad Rural de Tucumán, donde Edgardo Díaz presentó el Kit Apícola IoT para el monitoreo de colmenas.",
    cuerpo: [
      "Los pasados 13 y 14 de agosto, nuestro equipo estuvo compartiendo ciencia e innovación en la Sociedad Rural de Tucumán. Fue un espacio increíble para conectar con el sector productivo y mostrar cómo la tecnología puede revolucionar la apicultura.",
      "Durante las jornadas presentamos nuestros avances en el uso de herramientas tecnológicas para optimizar el trabajo con las abejas. Además, Edgardo Díaz presentó el \"Kit Apícola IoT\", un prototipo innovador que permite el monitoreo de colmenas utilizando el Internet de las Cosas.",
      "¡Felicitaciones a todo el equipo por el enorme esfuerzo, la dedicación y el excelente trabajo de divulgación!"
    ],
    fotos: galeria("encuentro-apicola-2026", 3),
    instagram: "https://www.instagram.com/p/DcKMnouCZVo/"
  },
  {
    id: "curso-apicultura-2026",
    fecha: "2026-08-09",
    titulo: "Curso de iniciación en Apicultura",
    resumen: "Junto a IBN-CONICET e IER-CONICET dictamos un curso de iniciación a la apicultura: diversidad de abejas, trampas caza-enjambres y partes de la colmena.",
    cuerpo: [
      "Compartimos un breve registro de las dos primeras prácticas de nuestro curso de iniciación a la apicultura, dictado en colaboración con el IBN-CONICET y el IER-CONICET, y dirigido por los investigadores Alberto Galindo y Carlos Molineri.",
      "En la primera sesión aprendimos sobre diversidad y morfología de abejas, además de construir trampas caza-enjambres para Apis y abejas meliponas.",
      "En la segunda sesión trabajamos el concepto de superorganismo y reconocimos las partes de una colmena.",
      "Gracias a todos los que se siguen sumando a aprender y compartir esta pasión por las abejas y la ciencia. ¡Seguimos avanzando!"
    ],
    fotos: galeria("curso-apicultura-2026", 3),
    instagram: "https://www.instagram.com/p/DbRTb8BCTia/"
  },
  {
    id: "magnetometro-iar-2026",
    fecha: "2026-06-09",
    titulo: "Señales magnéticas en la ruta de los zánganos: un desarrollo del IAR con sabor a interestelar",
    resumen: "Alberto Galindo-Cardona viajó al Instituto Argentino de Radioastronomía a buscar un magnetómetro diseñado para nuestro proyecto de áreas de congregación de zánganos.",
    cuerpo: [
      "El Dr. Alberto Galindo-Cardona viajó hasta el Instituto Argentino de Radioastronomía (IAR), ubicado en el Parque Pereyra Iraola, provincia de Buenos Aires. El instituto, que hace poco fue noticia por su participación en el desarrollo de un satélite desplegado por la misión Artemis de la NASA, lo recibió para un trabajo muy distinto pero igualmente fascinante.",
      "El objetivo era recoger un magnetómetro desarrollado y construido íntegramente por el IAR, diseñado para nuestro proyecto de las Áreas de Congregación de Zánganos (ACZ). Este dispositivo permitirá medir y detectar anomalías magnéticas tanto en las ACZ como fuera de ellas, en tres ecorregiones de Argentina.",
      "Esta labor forma parte de la beca doctoral de Harold Pulido-Guarín."
    ],
    fotos: galeria("magnetometro-iar-2026", 2),
    instagram: ""
  },
  {
    id: "curso-uruguay-2026",
    fecha: "2026-06-01",
    titulo: "Curso internacional de técnicas moleculares aplicadas a la salud de abejas melíferas",
    resumen: "Harold Pulido-Guarín participó en Montevideo de un curso regional sobre detección de patógenos, viromas y transcriptómica en abejas.",
    cuerpo: [
      "El becario doctoral del Instituto de Ecología Regional (IER), Harold Pulido-Guarín, participó durante la primera semana de junio de 2026 en el curso \"Técnicas moleculares aplicadas al estudio de enfermedades y salud en abejas melíferas\", desarrollado en el Instituto de Investigaciones Biológicas Clemente Estable (IIBCE) en Montevideo, Uruguay. La participación fue posible gracias al financiamiento conjunto de la Universidad de las Naciones Unidas para Biotecnología en América Latina y el Caribe (UNU-BIOLAC) y la Sociedad Latinoamericana de Investigación en Abejas (SOLATINA).",
      "El evento reunió a investigadores, becarios y estudiantes de posgrado de Argentina, Chile, Uruguay, Perú, Bolivia, Venezuela y México.",
      "El curso duró seis días, con sesiones teóricas y prácticas intensivas organizadas en tres ejes: la detección y cuantificación de patógenos mediante PCR y PCR múltiplex; el análisis de viromas y microbioma intestinal de abejas mediante secuenciación masiva; y el uso de herramientas de transcriptómica para comprender la respuesta génica de las abejas frente a distintos patógenos."
    ],
    fotos: galeria("curso-uruguay-2026", 2),
    instagram: ""
  }
];
