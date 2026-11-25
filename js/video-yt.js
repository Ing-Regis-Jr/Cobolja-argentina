/* Video de YouTube con vista previa.
   Muestra la miniatura con un botón de play; al hacer clic se reproduce en la misma página.
   Si JavaScript no carga, el recuadro sigue siendo un enlace que abre el video en YouTube.
   Para usarlo en otra página: <a class="yt-card" data-yt="ID_DEL_VIDEO" href="...">...</a>
   Ctrl/Cmd + clic o clic con la rueda lo abre en YouTube en una pestaña nueva. */
(function () {
  "use strict";

  var tarjetas = document.querySelectorAll("a.yt-card[data-yt]");
  Array.prototype.forEach.call(tarjetas, function (a) {
    var id = a.getAttribute("data-yt");
    if (!/^[\w-]{6,20}$/.test(id)) return;

    // Si la miniatura no carga (sin internet), se ve el fondo azul con el texto.
    var img = a.querySelector("img");
    if (img) img.addEventListener("error", function () { img.style.display = "none"; });

    a.addEventListener("click", function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      var titulo = a.getAttribute("data-titulo") || "Video de YouTube";
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1";
      f.title = titulo;
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
      f.setAttribute("allowfullscreen", "");
      f.referrerPolicy = "strict-origin-when-cross-origin";

      var caja = document.createElement("div");
      caja.className = a.className + " yt-activo";
      caja.appendChild(f);
      a.parentNode.replaceChild(caja, a);
    });
  });
})();
