/* Debate a favor / en contra.
   Uso: <div data-debate="Elegí una postura">
          <section class="deb-panel" id="uno" data-lado="favor" data-titulo="A favor">...</section>
          <section class="deb-panel" id="dos" data-lado="contra" data-titulo="En contra">...</section>
        </div>
   Sin JavaScript, los dos paneles quedan visibles. */
(function () {
  "use strict";

  document.querySelectorAll("[data-debate]").forEach(function (contenedor) {
    const paneles = Array.from(contenedor.querySelectorAll(":scope > .deb-panel"));
    if (paneles.length < 2) return;

    const grupo = document.createElement("div");
    grupo.className = "deb-botones";
    grupo.setAttribute("role", "group");
    grupo.setAttribute("aria-label", contenedor.dataset.debate || "Elegí una postura");

    const botones = paneles.map(function (panel, i) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "deb-boton";
      boton.dataset.lado = panel.dataset.lado || "";
      boton.setAttribute("aria-controls", panel.id);
      boton.textContent = panel.dataset.titulo || panel.id;
      boton.addEventListener("click", function () {
        activar(i);
      });
      grupo.appendChild(boton);
      return boton;
    });

    contenedor.insertBefore(grupo, paneles[0]);

    function activar(indice) {
      paneles.forEach(function (panel, j) {
        const activo = j === indice;
        panel.hidden = !activo;
        botones[j].setAttribute("aria-pressed", String(activo));
      });
    }

    activar(0);
  });
})();
