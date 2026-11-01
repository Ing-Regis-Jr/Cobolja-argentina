(function () {
  const places = window.LUGARES || [];
  const routes = window.RECORRIDOS || [];
  const mapEl = document.getElementById("map");
  if (!mapEl) {
    return;
  }

  const assetBase = document.body.dataset.base || "";
  const hasMap = typeof L !== "undefined";
  const byId = new Map(places.map((p) => [p.id, p]));
  const catColors = {
    historia: "#4ec4f5",
    cultura: "#ff4f8b",
    turismo: "#ffc43a",
    naturaleza: "#2ee59d",
  };

  const ALL = {
    id: "todos",
    nombre: "Todos los lugares",
    color: "#4ec4f5",
    sinLinea: true,
    resumen:
      "Todos los puntos del mapa, sin orden. Elegí un recorrido para seguir una ruta.",
    lugares: places.map((p) => p.id),
  };
  const options = [...routes, ALL];
  let route = options[0];
  let selectedId = null;
  let touring = false;
  let tourId = 0;

  const panel = document.getElementById("place-panel");
  const rail = document.getElementById("place-rail");
  const row = document.getElementById("route-row");
  const tourBtn = document.getElementById("tour-btn");
  const markers = new Map();

  let map, layer, routeLayer;
  if (hasMap) {
    map = L.map("map", { zoomControl: true }).setView([-38.4, -63.6], 4);
    setTimeout(() => map.invalidateSize(), 200);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    layer = L.layerGroup().addTo(map);
    routeLayer = L.layerGroup().addTo(map);
  } else {
    mapEl.innerHTML =
      '<p class="map-offline">No se pudo cargar el mapa. Revisá tu conexión a internet. ' +
      "Mientras tanto, podés explorar los lugares en las tarjetas de abajo.</p>";
  }

  function placesOf(r) {
    return r.lugares.map((id) => byId.get(id)).filter(Boolean);
  }

  function numberOf(id) {
    if (route.sinLinea) {
      return null;
    }
    const i = route.lugares.indexOf(id);
    return i >= 0 ? i + 1 : null;
  }

  function photo(place, alt, cls) {
    const main = assetBase + (place.foto || place.imagen);
    const back = assetBase + place.imagen;
    return `<img class="${cls || ""}" src="${main}" alt="${alt}" loading="lazy" onerror="this.onerror=null;this.src='${back}'">`;
  }

  function iconFor(place, on) {
    const num = numberOf(place.id);
    const color = route.sinLinea
      ? catColors[place.categoria] || "#4ec4f5"
      : route.color;
    const label = num !== null ? num : place.emoji || "📍";
    return L.divIcon({
      className: "pin-wrap",
      iconSize: [36, 36],
      iconAnchor: [18, 34],
      popupAnchor: [0, -28],
      html: `<div class="pin-core${on ? " is-on" : ""}" style="background:${color}"><span>${label}</span></div>`,
    });
  }

  function popupHtml(place) {
    return `
      ${photo(place, "Imagen de " + place.nombre, "popup-art")}
      <strong>${place.nombre}</strong><br>
      <em>${place.ciudad}</em><br>
      ${place.descripcion}<br>
      <small>Dato: ${place.dato}</small>
    `;
  }

  function showRoutePanel() {
    if (!panel) {
      return;
    }
    const n = placesOf(route).length;
    panel.innerHTML = `
      <p class="section-kicker">${route.sinLinea ? "Explorar" : "Recorrido · " + n + " paradas"}</p>
      <h2>${route.nombre}</h2>
      <p>${route.resumen}</p>
      <p class="muted">Tocá un marcador o una tarjeta para ver la ficha de cada lugar.</p>
      <p><a class="btn" href="trivia.html">Probá la trivia</a></p>
    `;
  }

  function step(place, dir) {
    const list = placesOf(route);
    const i = list.findIndex((item) => item.id === place.id);
    const next = list[(i + dir + list.length) % list.length];
    selectPlace(next.id, true);
  }

  function showPanel(place) {
    if (!panel || !place) {
      return;
    }
    const list = placesOf(route);
    const i = list.findIndex((item) => item.id === place.id);
    const kicker =
      !route.sinLinea && i >= 0
        ? `Parada ${i + 1} de ${list.length}`
        : place.categoria;
    panel.innerHTML = `
      <p class="section-kicker">${kicker}</p>
      <h2>${place.nombre}</h2>
      <p class="muted">${place.ciudad}</p>
      ${photo(place, "Imagen de " + place.nombre)}
      <p>${place.descripcion}</p>
      <p><strong>¿Sabías que…?</strong> ${place.dato}</p>
      <p class="panel-actions">
        <button class="btn" type="button" id="prev-place">Anterior</button>
        <button class="btn btn-primary" type="button" id="next-place">Siguiente</button>
      </p>
    `;
    document
      .getElementById("prev-place")
      .addEventListener("click", () => step(place, -1));
    document
      .getElementById("next-place")
      .addEventListener("click", () => step(place, 1));
  }

  function selectPlace(id, fly) {
    selectedId = id;
    const place = byId.get(id);
    if (!place) {
      return;
    }
    if (hasMap) {
      markers.forEach((marker, key) => {
        marker.setIcon(iconFor(byId.get(key), key === id));
      });
      const marker = markers.get(id);
      if (marker) {
        marker.openPopup();
      }
      if (fly) {
        map.flyTo([place.lat, place.lng], 7, { duration: 1.1 });
      }
    }
    showPanel(place);
    document.querySelectorAll("[data-place]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.place === id);
    });
  }

  function renderRail(list) {
    if (!rail) {
      return;
    }
    rail.innerHTML = list
      .map((p) => {
        const n = numberOf(p.id);
        return `
      <li>
        <button type="button" data-place="${p.id}">
          ${n !== null ? `<span class="rail-num" style="background:${route.color}">${n}</span>` : ""}
          ${photo(p, "")}
          <strong>${p.nombre}</strong>
          <span class="muted">${p.ciudad}</span>
        </button>
      </li>`;
      })
      .join("");
    rail.querySelectorAll("[data-place]").forEach((btn) => {
      btn.addEventListener("click", () => selectPlace(btn.dataset.place, true));
    });
  }

  function draw() {
    const list = placesOf(route);
    if (hasMap) {
      layer.clearLayers();
      routeLayer.clearLayers();
      markers.clear();
      list.forEach((p) => {
        const marker = L.marker([p.lat, p.lng], {
          icon: iconFor(p, p.id === selectedId),
        })
          .bindPopup(popupHtml(p))
          .on("click", () => selectPlace(p.id, false));
        marker.addTo(layer);
        markers.set(p.id, marker);
      });
      if (!route.sinLinea && list.length > 1) {
        L.polyline(
          list.map((p) => [p.lat, p.lng]),
          { color: route.color, weight: 4, opacity: 0.85 },
        ).addTo(routeLayer);
      }
      if (list.length) {
        map.fitBounds(
          list.map((p) => [p.lat, p.lng]),
          { padding: [40, 40], maxZoom: 8 },
        );
      }
    }
    renderRail(list);
    showRoutePanel();
  }

  function stopTour() {
    touring = false;
    tourId += 1;
    if (tourBtn) {
      tourBtn.textContent = "Recorrido guiado";
    }
  }

  function renderRouteRow() {
    if (!row) {
      return;
    }
    row.innerHTML = options
      .map(
        (r) =>
          `<button type="button" data-route="${r.id}" aria-pressed="${r === route}" class="${r === route ? "is-active" : ""}">${r.nombre}</button>`,
      )
      .join("");
    row.querySelectorAll("[data-route]").forEach((btn) => {
      btn.addEventListener("click", () => setRoute(btn.dataset.route));
    });
  }

  function setRoute(id) {
    stopTour();
    route = options.find((r) => r.id === id) || options[0];
    selectedId = null;
    renderRouteRow();
    draw();
  }

  if (tourBtn) {
    tourBtn.addEventListener("click", async () => {
      if (touring) {
        stopTour();
        return;
      }
      touring = true;
      const mine = ++tourId;
      tourBtn.textContent = "Detener recorrido";
      for (const place of placesOf(route)) {
        if (mine !== tourId) {
          return;
        }
        selectPlace(place.id, true);
        await new Promise((resolve) => setTimeout(resolve, 3200));
      }
      if (mine === tourId) {
        stopTour();
      }
    });
  }

  renderRouteRow();
  draw();
})();
