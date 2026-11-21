/* Páginas simples (apoyanos.html): menú móvil, año del pie e idioma en los enlaces */
(() => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#menu");
  if (toggle && menu) toggle.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    toggle.setAttribute("aria-expanded", abierto);
  });
  const anio = document.querySelector("#anio");
  if (anio) anio.textContent = new Date().getFullYear();
  if (typeof enlacesConIdioma === "function") enlacesConIdioma();
})();
