/* Pestañas reutilizables.
   Uso: <div data-pestanas="Nombre de las pestañas">
          <section class="sec-panel" id="uno" data-titulo="Uno">...</section>
          <section class="sec-panel" id="dos" data-titulo="Dos">...</section>
        </div>
   Sin JavaScript, todos los paneles quedan visibles. */
(function () {
  "use strict";

  document.querySelectorAll("[data-pestanas]").forEach(function (contenedor) {
    const paneles = Array.from(contenedor.querySelectorAll(":scope > .sec-panel"));
    if (paneles.length < 2) return;

    const lista = document.createElement("div");
    lista.className = "sec-pestanas";
    lista.setAttribute("role", "tablist");
    lista.setAttribute("aria-label", contenedor.dataset.pestanas || "Apartados");

    const botones = paneles.map(function (panel, i) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "sec-pestana";
      boton.id = "pestana-" + panel.id;
      boton.setAttribute("role", "tab");
      boton.setAttribute("aria-controls", panel.id);
      boton.textContent = panel.dataset.titulo || panel.id;

      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", boton.id);

      boton.addEventListener("click", function () {
        activar(i, false, true);
      });

      boton.addEventListener("keydown", function (evento) {
        let destino = null;
        if (evento.key === "ArrowRight") destino = (i + 1) % paneles.length;
        if (evento.key === "ArrowLeft") destino = (i - 1 + paneles.length) % paneles.length;
        if (evento.key === "Home") destino = 0;
        if (evento.key === "End") destino = paneles.length - 1;
        if (destino !== null) {
          evento.preventDefault();
          activar(destino, true, true);
        }
      });

      lista.appendChild(boton);
      return boton;
    });

    contenedor.insertBefore(lista, paneles[0]);

    function activar(indice, enfocar, actualizarUrl) {
      paneles.forEach(function (panel, j) {
        const activo = j === indice;
        panel.hidden = !activo;
        botones[j].setAttribute("aria-selected", String(activo));
        botones[j].tabIndex = activo ? 0 : -1;
      });

      if (enfocar) botones[indice].focus();

      if (actualizarUrl && window.history && history.replaceState) {
        history.replaceState(null, "", "#" + paneles[indice].id);
      }
    }

    function indiceDesdeHash() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const encontrado = paneles.findIndex(function (panel) {
        return panel.id === id;
      });
      return encontrado;
    }

    window.addEventListener("hashchange", function () {
      const i = indiceDesdeHash();
      if (i >= 0) activar(i, false, false);
    });

    const inicial = indiceDesdeHash();
    activar(inicial >= 0 ? inicial : 0, false, false);
  });
})();
