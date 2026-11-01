/* Gráfico de barras interactivo de Economía.
   Uso: <div data-grafico="id-del-panel"> con botones .eco-barra (data-detalle)
   y un <p id="id-del-panel" class="eco-detalle"> donde se muestra el detalle.
   Sin JavaScript, cada barra ya muestra su porcentaje y monto. */
(function () {
  "use strict";

  document.querySelectorAll("[data-grafico]").forEach(function (grafico) {
    const barras = Array.from(grafico.querySelectorAll(".eco-barra"));
    const panel = document.getElementById(grafico.dataset.grafico);
    if (!panel || !barras.length) return;

    const textoInicial = panel.textContent;

    barras.forEach(function (barra) {
      barra.addEventListener("click", function () {
        const yaActiva = barra.getAttribute("aria-pressed") === "true";
        barras.forEach(function (otra) {
          otra.setAttribute("aria-pressed", "false");
        });

        if (yaActiva) {
          panel.textContent = textoInicial;
          return;
        }

        barra.setAttribute("aria-pressed", "true");
        panel.textContent = barra.dataset.detalle || "";
      });
    });
  });
})();
