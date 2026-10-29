(function () {
  const icons = {
    inicio:
      '<svg viewBox="0 0 24 24"><path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>',
    identidad:
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4a12 12 0 0 1 0 16M12 4a12 12 0 0 0 0 16"/></svg>',
    historia:
      '<svg viewBox="0 0 24 24"><path d="M5 5h10a3 3 0 0 1 3 3v12H8a3 3 0 0 0-3 3z"/><path d="M5 5v15"/><path d="M9 9h7M9 13h7"/></svg>',
    cultura:
      '<svg viewBox="0 0 24 24"><circle cx="8" cy="10" r="3"/><circle cx="16" cy="10" r="3"/><path d="M5 17c.8-2 2.4-3 4.5-3s3.7 1 4.5 3M14 17c.5-1.2 1.4-2 3-2 1.4 0 2.4.7 3 2"/></svg>',
    sociedad:
      '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M4 19c.7-3 2.8-5 5.5-5S15 16 15.5 19M14 19c.4-2 1.8-3.2 3.6-3.2 1.6 0 2.8 1 3.4 3.2"/></svg>',
    legislacion:
      '<svg viewBox="0 0 24 24"><path d="M12 3v18M7 8h10M6 20h12"/><path d="M7 8 4 14h6zM17 8l3 6h-6z"/></svg>',
    deportes:
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M5 9h14M5 15h14M12 4a12 8 0 0 1 0 16M12 4a12 8 0 0 0 0 16"/></svg>',
    ciencia:
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="9" ry="4"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-60 12 12)"/></svg>',
    economia:
      '<svg viewBox="0 0 24 24"><path d="M4 18V6M4 18h16"/><path d="M8 14v4M12 10v8M16 7v11"/></svg>',
    datos:
      '<svg viewBox="0 0 24 24"><path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="M12 12 4 7m8 5 8-5M12 12v10"/></svg>',
    gastronomia:
      '<svg viewBox="0 0 24 24"><path d="M8 3v8M6 3v5a2 2 0 0 0 4 0V3M10 11v10M16 3c0 4 3 5 3 9v9M16 3v9"/></svg>',
    conclusion:
      '<svg viewBox="0 0 24 24"><path d="M5 19V5l7 3 7-3v14l-7 3z"/><path d="M9 12l2.1 2L15 10"/></svg>',
    temas:
      '<svg viewBox="0 0 24 24"><path d="M5 7h14M5 12h14M5 17h14"/></svg>',
  };

  const temas = [
    { href: "pages/identidad.html", label: "Identidad", icon: "identidad" },
    { href: "pages/historia.html", label: "Historia", icon: "historia" },
    { href: "pages/cultura.html", label: "Cultura", icon: "cultura" },
    { href: "pages/sociedad.html", label: "Sociedad", icon: "sociedad" },
    { href: "pages/legislacion.html", label: "Legislación", icon: "legislacion" },
    { href: "pages/deportes.html", label: "Deportes", icon: "deportes" },
    { href: "pages/ciencia-tecnologia.html", label: "Ciencia", icon: "ciencia" },
    { href: "pages/economia.html", label: "Economía", icon: "economia" },
  ];

  const base = document.body.dataset.base || "";
  const temaFiles = temas.map((item) => item.href.split("/").pop());

  function resolve(href) {
    if (!base) {
      return href;
    }
    if (href === "index.html") {
      return "../index.html";
    }
    return href.replace("pages/", "");
  }

  function currentFile() {
    const path = window.location.pathname.replace(/\\/g, "/");
    const file = path.split("/").pop() || "index.html";
    return file === "" ? "index.html" : file;
  }

  function injectFonts() {
    if (document.getElementById("app-fonts")) {
      return;
    }
    const pre = document.createElement("link");
    pre.rel = "preconnect";
    pre.href = "https://fonts.googleapis.com";
    const pre2 = document.createElement("link");
    pre2.rel = "preconnect";
    pre2.href = "https://fonts.gstatic.com";
    pre2.crossOrigin = "anonymous";
    const link = document.createElement("link");
    link.id = "app-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap";
    document.head.append(pre, pre2, link);
  }

  function itemHtml(href, label, icon, file, currentFiles) {
    const resolved = resolve(href);
    const target = resolved.split("/").pop();
    const on = currentFiles ? currentFiles.includes(file) : target === file;
    const current = on ? ' aria-current="page"' : "";
    return `<a class="nav-item" href="${resolved}"${current}>${icons[icon]}<span>${label}</span></a>`;
  }

  injectFonts();
  const file = currentFile();
  const home = resolve("index.html");
  const inTemas = temaFiles.includes(file);

  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML = `
      <div class="header-inner">
        <a class="brand" href="${home}">
          <span class="brand-mark" aria-hidden="true"></span>
          <span>Argentina 2026<small>COBOLJA · Mundial de Saberes</small></span>
        </a>
      </div>
    `;
  }

  const navFive = `
    ${itemHtml("index.html", "Inicio", "inicio", file)}
    <button class="nav-item" type="button" id="temas-btn" aria-expanded="false"${inTemas ? ' aria-current="true"' : ""}>${icons.temas}<span>Temas</span></button>
    ${itemHtml("pages/datos-impactantes.html", "Datos", "datos", file)}
    ${itemHtml("pages/gastronomia.html", "Cocina", "gastronomia", file)}
    ${itemHtml("pages/conclusion.html", "Cierre", "conclusion", file)}
  `;

  const sidebar = document.createElement("aside");
  sidebar.className = "sidebar";
  sidebar.setAttribute("aria-label", "Navegación");
  sidebar.innerHTML = `
    <a class="sidebar-brand" href="${home}" title="Inicio"><span class="brand-mark" aria-hidden="true"></span></a>
    ${navFive}
  `;
  const skip = document.querySelector(".skip-link");
  if (skip) {
    skip.after(sidebar);
  } else {
    document.body.prepend(sidebar);
  }

  const dock = document.createElement("nav");
  dock.className = "dock";
  dock.setAttribute("aria-label", "Navegación móvil");
  dock.innerHTML = navFive.replace("temas-btn", "temas-btn-dock");
  document.body.appendChild(dock);

  const sheet = document.createElement("div");
  sheet.className = "sheet";
  sheet.id = "temas-sheet";
  sheet.innerHTML = `<h2>Temas de investigación</h2>${temas
    .map((item) => itemHtml(item.href, item.label, item.icon, file))
    .join("")}`;
  document.body.appendChild(sheet);

  function toggleSheet(btn) {
    const open = sheet.classList.toggle("is-open");
    document.querySelectorAll("#temas-btn, #temas-btn-dock").forEach((el) => {
      el.setAttribute("aria-expanded", String(open));
    });
    if (btn) {
      btn.setAttribute("aria-expanded", String(open));
    }
  }

  document.querySelectorAll("#temas-btn, #temas-btn-dock").forEach((btn) => {
    btn.addEventListener("click", () => toggleSheet(btn));
  });

  document.addEventListener("click", (event) => {
    if (!sheet.classList.contains("is-open")) {
      return;
    }
    const inside =
      sheet.contains(event.target) ||
      event.target.closest("#temas-btn") ||
      event.target.closest("#temas-btn-dock");
    if (!inside) {
      sheet.classList.remove("is-open");
    }
  });

  const siteUrl =
    (window.SITE_CONFIG && window.SITE_CONFIG.publicUrl) || window.location.href.split("#")[0];
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(siteUrl)}`;
  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML = `
      <div class="footer-grid">
        <div>
          <h2>Colegio Boliviano Japonés</h2>
          <p>Plataforma educativa sobre Argentina para la Feria Digital · Mundial de Saberes Americanos 2026.</p>
        </div>
        <div>
          <h2>Créditos y mapa</h2>
          <p>Mapa: <a href="https://leafletjs.com" rel="noopener">Leaflet</a> y
          <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a>.</p>
        </div>
        <div>
          <h2>Código QR</h2>
          <div class="qr-box">
            <img src="${qrSrc}" alt="Código QR para abrir este sitio" width="160" height="160">
          </div>
        </div>
      </div>
    `;
  }

  const imgBase = (document.body.dataset.base || "") + "assets/img/";
  document.querySelectorAll("[data-img]").forEach((el) => {
    if (el.id === "fecha-imagen") return;
    const src = imgBase + el.dataset.img;
    const probe = new Image();
    probe.onload = () => {
      el.classList.add("has-photo");
      el.classList.remove("is-empty");
      if (el.matches("figure.shot")) {
        const img = document.createElement("img");
        img.src = src;
        img.alt = el.dataset.alt || "";
        el.prepend(img);
      } else {
        el.style.backgroundImage = "url('" + src + "')";
      }
    };
    probe.onerror = () => el.classList.add("is-empty");
    probe.src = src;
  });
})();
