# Sitio web de Zánganos Lab

Sitio estático (HTML + CSS + JavaScript, sin dependencias). Para verlo, abra `index.html` en el navegador.

## Estructura

```
zanganos-lab/
├── index.html        ← estructura de la página (secciones y textos fijos)
├── css/styles.css    ← diseño y colores (variables al inicio del archivo)
├── js/datos.js       ← CONTENIDO: equipo, publicaciones, noticias, líneas de investigación
├── js/main.js        ← lógica (buscador, filtros, menú móvil); no hace falta tocarlo
└── img/              ← logo e imágenes
```

## Tareas comunes

- **Agregar una publicación / noticia / integrante:** en `js/datos.js`, copie un bloque `{ ... },`, péguelo y cambie los textos.
- **Agregar fotos del equipo:** guarde la foto en `img/equipo/` (cuadrada, ~300×300 px) y escriba la ruta en el campo `foto`, por ejemplo `foto: "img/equipo/harold.jpg"`.
- **Logo:** los archivos oficiales están en `img/logo/` (horizontal, horizontal para fondo oscuro, vertical e icono). Respete el Manual de Identidad: no deformar, no cambiar colores ni tipografía, y no usar el horizontal a menos de 160 px de ancho.
- **Colores y tipografías:** definidos según el manual al inicio de `css/styles.css` (amarillo `#F6C401`, café `#301811`, gris `#A8A8A7`, blanco). Tipografías: Futura PT (se usa Jost como equivalente libre) y Goldman.

## Publicarlo gratis

- **GitHub Pages:** suba la carpeta a un repositorio → Settings → Pages → rama `main`. Queda en `usuario.github.io/repositorio`.
- **Netlify Drop:** arrastre la carpeta a https://app.netlify.com/drop.
- Ambos permiten conectar un dominio propio (ej. `zanganoslab.com.ar`).

## Idiomas (español, inglés y portugués)

- El selector **ES · EN · PT** está arriba a la derecha. Cada idioma tiene su dirección: `?lang=en`, `?lang=pt`.
- El español es el original: el contenido se sigue editando en `js/datos.js` y `js/acz.js`.
- Las traducciones están en `js/trad-en.js` y `js/trad-pt.js`, como pares `"texto en español": "traducción"`.
- **Al agregar o cambiar un texto en español**, agregue su par en los dos archivos de traducción, copiando el texto en español exactamente igual. Si falta, la página lo muestra en español (no se rompe).
- Terminología: en inglés "drone congregation area (DCA)"; en portugués "área de congregação de zangões (ACZ)".
