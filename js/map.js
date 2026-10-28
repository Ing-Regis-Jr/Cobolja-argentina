(function () {
  const places = window.LUGARES || [];
  const mapEl = document.getElementById("map");
  if (!mapEl || typeof L === "undefined") {
    return;
  }

  const assetBase = document.body.dataset.base || "";
  const colors = {
    historia: "#4ec4f5",
    cultura: "#ff4f8b",
    turismo: "#ffc43a",
    naturaleza: "#2ee59d",
  };

  const map = L.map("map", { zoomControl: true }).setView([-38.4, -63.6], 4);
  setTimeout(() => map.invalidateSize(), 200);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const layer = L.layerGroup().addTo(map);
  const routeLayer = L.layerGroup().addTo(map);
  const markers = new Map();
  let current = "todas";
  let selectedId = null;
  let touring = false;

  function imgSrc(place) {
    return assetBase + place.imagen;
  }

  function iconFor(place, on) {
    const color = colors[place.categoria] || "#4ec4f5";
    return L.divIcon({
      className: "pin-wrap",
      iconSize: [36, 36],
      iconAnchor: [18, 34],
      popupAnchor: [0, -28],
      html: `<div class="pin-core${on ? " is-on" : ""}" style="background:${color}"><span>${place.emoji || "•"}</span></div>`,
    });
  }

  function popupHtml(place) {
    return `
      <img class="popup-art" src="${imgSrc(place)}" alt="${place.nombre}">
      <strong>${place.nombre}</strong><br>
      <em>${place.ciudad}</em><br>
      ${place.descripcion}<br>
      <small>Dato: ${place.dato}</small>
    `;
  }

  function showPanel(place) {
    const panel = document.getElementById("place-panel");
    if (!panel || !place) {
      return;
    }
    panel.innerHTML = `
      <p class="section-kicker">${place.categoria}</p>
      <h2>${place.nombre}</h2>
      <p class="muted">${place.ciudad}</p>
      <img src="${imgSrc(place)}" alt="Ilustración de ${place.nombre}">
      <p>${place.descripcion}</p>
      <p><strong>¿Sabías que…</strong> ${place.dato}</p>
      <p>
        <button class="btn btn-primary" type="button" id="next-place">Siguiente lugar</button>
      </p>
    `;
    document.getElementById("next-place").addEventListener("click", () => {
      const list = visiblePlaces();
      const i = list.findIndex((item) => item.id === place.id);
      const next = list[(i + 1) % list.length];
      selectPlace(next.id, true);
    });
  }

  function visiblePlaces() {
    return places.filter((p) => current === "todas" || p.categoria === current);
  }

  function selectPlace(id, fly) {
    selectedId = id;
    const place = places.find((p) => p.id === id);
    if (!place) {
      return;
    }
    markers.forEach((marker, key) => {
      const item = places.find((p) => p.id === key);
      marker.setIcon(iconFor(item, key === id));
    });
    const marker = markers.get(id);
    if (marker) {
      marker.openPopup();
    }
    if (fly) {
      map.flyTo([place.lat, place.lng], 7, { duration: 1.1 });
    }
    showPanel(place);
    document.querySelectorAll("[data-place]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.place === id);
    });
  }

  function drawRoute(list) {
    routeLayer.clearLayers();
    if (list.length < 2) {
      return;
    }
    const latlngs = list.map((p) => [p.lat, p.lng]);
    L.polyline(latlngs, {
      color: "#4ec4f5",
      weight: 3,
      opacity: 0.75,
      dashArray: "8 8",
    }).addTo(routeLayer);
  }

  function draw() {
    layer.clearLayers();
    markers.clear();
    const list = visiblePlaces();
    list.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], { icon: iconFor(p, p.id === selectedId) })
        .bindPopup(popupHtml(p))
        .on("click", () => selectPlace(p.id, false));
      marker.addTo(layer);
      markers.set(p.id, marker);
    });
    drawRoute(list);
    renderRail(list);
  }

  function renderRail(list) {
    const rail = document.getElementById("place-rail");
    if (!rail) {
      return;
    }
    rail.innerHTML = list
      .map(
        (p) => `
      <li>
        <button type="button" data-place="${p.id}">
          <img src="${imgSrc(p)}" alt="">
          <strong>${p.nombre}</strong>
          <span class="muted">${p.ciudad}</span>
        </button>
      </li>`
      )
      .join("");
    rail.querySelectorAll("[data-place]").forEach((btn) => {
      btn.addEventListener("click", () => selectPlace(btn.dataset.place, true));
    });
  }

  document.querySelectorAll("[data-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      current = btn.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((el) => el.classList.remove("is-active"));
      btn.classList.add("is-active");
      selectedId = null;
      draw();
      map.setView([-38.4, -63.6], 4);
    });
  });

  const tourBtn = document.getElementById("tour-btn");
  if (tourBtn) {
    tourBtn.addEventListener("click", async () => {
      if (touring) {
        return;
      }
      touring = true;
      const list = visiblePlaces();
      for (const place of list) {
        selectPlace(place.id, true);
        await new Promise((resolve) => setTimeout(resolve, 2200));
      }
      touring = false;
    });
  }

  draw();
  const panel = document.getElementById("place-panel");
  if (panel) {
    panel.innerHTML = `
      <p class="section-kicker">Explorar</p>
      <h2>Elegí un punto</h2>
      <p class="muted">Tocá un marcador, una tarjeta o iniciá el recorrido guiado. Cada lugar tiene ilustración y un dato para contar en la feria.</p>
    `;
  }
})();
