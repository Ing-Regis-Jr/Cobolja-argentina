/* Actividades interactivas de Ciencia y tecnología.
   1) Línea de tiempo: convierte la lista [data-linea-tiempo] en botones + detalle.
      Sin JavaScript, la lista completa queda visible.
   2) Mapa de centros científicos (Leaflet). Sin conexión, los botones siguen
      mostrando la información de cada lugar.
   3) Actividad de relacionar personas con sus aportes. */
(function () {
  "use strict";

  function crear(etiqueta, clase, texto) {
    const nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
  }

  function mezclar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temporal = copia[i];
      copia[i] = copia[j];
      copia[j] = temporal;
    }
    return copia;
  }

  /* ---------- 1) Línea de tiempo ---------- */
  function iniciarLineaTiempo() {
    const lista = document.querySelector("[data-linea-tiempo]");
    if (!lista) return;
    const items = Array.from(lista.querySelectorAll(":scope > li"));
    if (items.length < 2) return;

    const botones = crear("div", "cien-tl-botones");
    botones.setAttribute("role", "group");
    botones.setAttribute("aria-label", "Elegir un año de la línea de tiempo");
    const detalle = crear("div", "cien-tl-detalle");
    detalle.setAttribute("aria-live", "polite");

    const lista_botones = items.map(function (li, i) {
      const boton = crear("button", "cien-tl-btn");
      boton.type = "button";
      boton.setAttribute("aria-pressed", "false");
      boton.appendChild(document.createTextNode(li.dataset.anio || ""));
      if (li.dataset.area) {
        boton.appendChild(crear("small", "", li.dataset.area));
      }
      boton.addEventListener("click", function () {
        seleccionar(i);
      });
      botones.appendChild(boton);
      return boton;
    });

    function seleccionar(indice) {
      lista_botones.forEach(function (boton, i) {
        boton.setAttribute("aria-pressed", i === indice ? "true" : "false");
      });
      const copia = items[indice].cloneNode(true);
      detalle.replaceChildren.apply(detalle, Array.from(copia.childNodes));
    }

    lista.hidden = true;
    lista.after(botones, detalle);
    seleccionar(0);
  }

  /* ---------- 2) Mapa de centros científicos ---------- */
  // Datos tomados de las fuentes numeradas 5, 6, 8 y 10 de la página.
  const LUGARES = [
    {
      id: "bariloche",
      nombre: "Bariloche",
      lat: -41.1335,
      lng: -71.3103,
      titulo: "San Carlos de Bariloche (Río Negro)",
      texto:
        "INVAP tiene su sede en Bariloche, igual que el Instituto Balseiro. " +
        "El Balseiro nació en 1955 por un convenio entre la CNEA y la " +
        "Universidad Nacional de Cuyo. En Bariloche también se construyó el " +
        "satélite ARSAT-1.",
      punto: "p04",
      puntoTexto: "Ver Ingeniería",
    },
    {
      id: "buenos-aires",
      nombre: "Buenos Aires",
      lat: -34.6037,
      lng: -58.3816,
      titulo: "Ciudad de Buenos Aires",
      texto:
        "La Facultad de Ciencias Exactas de la UBA y el Instituto Leloir son " +
        "centros de investigación de la ciudad. En el Hospital Rawson, el 9 de " +
        "noviembre de 1914, Luis Agote hizo una transfusión de sangre con " +
        "citrato de sodio.",
      punto: "p03",
      puntoTexto: "Ver Medicina",
    },
    {
      id: "cordoba",
      nombre: "Córdoba",
      lat: -31.4201,
      lng: -64.1888,
      titulo: "Córdoba y el Centro Espacial Teófilo Tabanera",
      texto:
        "La Universidad Nacional de Córdoba (UNC) es una de las universidades " +
        "que más aparecen en la ciencia argentina. A unos 30 km al sudoeste de " +
        "la ciudad, en Falda del Cañete, está el Centro Espacial Teófilo " +
        "Tabanera de la CONAE, con estación terrena y centro de control de misión.",
      punto: "p02",
      puntoTexto: "Ver Tecnología",
    },
    {
      id: "la-plata",
      nombre: "La Plata",
      lat: -34.9215,
      lng: -57.9545,
      titulo: "La Plata (Buenos Aires)",
      texto:
        "La Universidad Nacional de La Plata (UNLP) es una de las cuatro " +
        "instituciones que aparecen una y otra vez en los trabajos científicos " +
        "del país, junto con la UBA, la UNC y el Instituto Balseiro.",
      punto: "p05",
      puntoTexto: "Ver Educación",
    },
    {
      id: "necochea",
      nombre: "Necochea",
      lat: -38.5545,
      lng: -58.7396,
      titulo: "Necochea (Buenos Aires)",
      texto:
        "En 1892, en Necochea, el sistema de identificación por huellas " +
        "dactilares de Juan Vucetich se usó por primera vez para resolver un crimen.",
      punto: "p08",
      puntoTexto: "Ver Inventos y hallazgos",
    },
  ];

  function iniciarMapa() {
    const contenedor = document.getElementById("cien-mapa");
    const barra = document.getElementById("cien-lugares");
    const detalle = document.getElementById("cien-lugar-detalle");
    if (!contenedor || !barra || !detalle) return;

    const tieneMapa = typeof L !== "undefined";
    const marcadores = {};
    const botones = {};
    let mapa = null;

    const estiloBase = {
      radius: 9,
      color: "#ffffff",
      weight: 2,
      fillColor: "#3d7eb3",
      fillOpacity: 0.95,
    };
    const estiloActivo = {
      radius: 12,
      color: "#ffffff",
      weight: 3,
      fillColor: "#f6b40e",
      fillOpacity: 1,
    };

    function mostrar(lugar) {
      detalle.replaceChildren();
      detalle.appendChild(crear("h3", "", lugar.titulo));
      detalle.appendChild(crear("p", "", lugar.texto));
      const enlace = crear("a", "cien-ver", lugar.puntoTexto + " →");
      enlace.href = "#" + lugar.punto;
      const parrafo = crear("p");
      parrafo.appendChild(enlace);
      detalle.appendChild(parrafo);
    }

    function seleccionar(id) {
      LUGARES.forEach(function (lugar) {
        const activo = lugar.id === id;
        botones[lugar.id].setAttribute("aria-pressed", activo ? "true" : "false");
        if (marcadores[lugar.id]) {
          marcadores[lugar.id].setStyle(activo ? estiloActivo : estiloBase);
          if (activo) marcadores[lugar.id].bringToFront();
        }
        if (activo) {
          mostrar(lugar);
          if (mapa) {
            mapa.flyTo([lugar.lat, lugar.lng], Math.max(mapa.getZoom(), 6), {
              duration: 0.8,
            });
          }
        }
      });
    }

    LUGARES.forEach(function (lugar) {
      const boton = crear("button", "cien-lugar", lugar.nombre);
      boton.type = "button";
      boton.setAttribute("aria-pressed", "false");
      boton.addEventListener("click", function () {
        seleccionar(lugar.id);
      });
      barra.appendChild(boton);
      botones[lugar.id] = boton;
    });

    detalle.appendChild(
      crear("p", "", "Elegí un lugar en el mapa o en los botones para ver qué se hace allí.")
    );

    if (tieneMapa) {
      mapa = L.map(contenedor, {
        scrollWheelZoom: false,
        dragging: !L.Browser.mobile,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapa);

      LUGARES.forEach(function (lugar) {
        const marcador = L.circleMarker([lugar.lat, lugar.lng], estiloBase).addTo(mapa);
        marcador.bindTooltip(lugar.nombre);
        marcador.on("click", function () {
          seleccionar(lugar.id);
        });
        marcadores[lugar.id] = marcador;
      });

      mapa.fitBounds(
        L.latLngBounds(
          LUGARES.map(function (lugar) {
            return [lugar.lat, lugar.lng];
          })
        ),
        { padding: [30, 30] }
      );
      setTimeout(function () {
        mapa.invalidateSize();
      }, 200);
    } else {
      contenedor.replaceChildren(
        crear(
          "p",
          "cien-mapa-aviso",
          "No se pudo cargar el mapa. Revisá tu conexión a internet. " +
            "Mientras tanto, podés usar los botones para ver cada lugar."
        )
      );
      contenedor.style.height = "auto";
    }
  }

  /* ---------- 3) Actividad de relacionar ---------- */
  const PARES = [
    { persona: "Bernardo Houssay", aporte: "Premio Nobel de Fisiología o Medicina (1947)" },
    { persona: "Luis Federico Leloir", aporte: "Premio Nobel de Química (1970)" },
    { persona: "César Milstein", aporte: "Premio Nobel de Fisiología o Medicina (1984)" },
    { persona: "Luis Agote", aporte: "Transfusión de sangre con citrato de sodio (1914)" },
    { persona: "Juan Vucetich", aporte: "Sistema de identificación por huellas dactilares (1891)" },
    { persona: "László Bíró", aporte: "Patentó el bolígrafo" },
  ];

  function iniciarRelacionar() {
    const raiz = document.getElementById("cien-relacionar");
    if (!raiz) return;

    function montar() {
      let aciertos = 0;
      let intentos = 0;
      let elegida = null;

      raiz.replaceChildren();

      const estado = crear("p", "cien-rel-estado");
      estado.setAttribute("role", "status");
      estado.setAttribute("aria-live", "polite");
      const grid = crear("div", "cien-rel-grid");
      const colPersonas = crear("div", "cien-rel-col");
      colPersonas.setAttribute("role", "group");
      colPersonas.setAttribute("aria-label", "Personas");
      const colAportes = crear("div", "cien-rel-col");
      colAportes.setAttribute("role", "group");
      colAportes.setAttribute("aria-label", "Aportes");

      function actualizar(texto) {
        estado.textContent =
          texto || "Aciertos: " + aciertos + " de " + PARES.length + " · Intentos: " + intentos;
      }

      function item(indice, texto) {
        const boton = crear("button", "cien-rel-item", texto);
        boton.type = "button";
        boton.dataset.i = String(indice);
        boton.setAttribute("aria-pressed", "false");
        return boton;
      }

      const indices = PARES.map(function (_, i) {
        return i;
      });

      mezclar(indices).forEach(function (i) {
        const boton = item(i, PARES[i].persona);
        boton.addEventListener("click", function () {
          if (boton.disabled) return;
          if (elegida) elegida.setAttribute("aria-pressed", "false");
          elegida = boton;
          boton.setAttribute("aria-pressed", "true");
          actualizar("Elegiste a " + PARES[i].persona + ". Ahora tocá su aporte.");
        });
        colPersonas.appendChild(boton);
      });

      mezclar(indices).forEach(function (i) {
        const boton = item(i, PARES[i].aporte);
        boton.addEventListener("click", function () {
          if (boton.disabled) return;
          if (!elegida) {
            actualizar("Primero tocá una persona.");
            return;
          }
          const persona = elegida;
          elegida = null;
          intentos++;
          persona.setAttribute("aria-pressed", "false");

          if (persona.dataset.i === boton.dataset.i) {
            aciertos++;
            [persona, boton].forEach(function (b) {
              b.classList.add("is-correct");
              b.disabled = true;
            });
            if (aciertos === PARES.length) {
              terminar();
            } else {
              actualizar();
            }
          } else {
            [persona, boton].forEach(function (b) {
              b.classList.add("is-wrong");
            });
            actualizar("Esa no es la pareja. Probá de nuevo.");
            setTimeout(function () {
              [persona, boton].forEach(function (b) {
                b.classList.remove("is-wrong");
              });
            }, 700);
          }
        });
        colAportes.appendChild(boton);
      });

      function terminar() {
        const extra =
          intentos === PARES.length
            ? "¡Sin errores!"
            : "Lo lograste en " + intentos + " intentos.";
        actualizar("¡Completaste las " + PARES.length + " parejas! " + extra);
        const reiniciar = crear("button", "btn btn-ghost", "Volver a jugar");
        reiniciar.type = "button";
        reiniciar.addEventListener("click", montar);
        const acciones = crear("div", "cien-rel-acciones");
        acciones.appendChild(reiniciar);
        raiz.appendChild(acciones);
      }

      grid.append(colPersonas, colAportes);
      raiz.append(estado, grid);
      actualizar();
    }

    montar();
  }

  iniciarLineaTiempo();
  iniciarMapa();
  iniciarRelacionar();
})();
