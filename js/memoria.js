(function () {
  const base = document.body.dataset.base || "";
  const el = {
    tablero: document.getElementById("memoria-tablero"),
    movs: document.getElementById("memoria-movs"),
    aciertos: document.getElementById("memoria-aciertos"),
    total: document.getElementById("memoria-total"),
    tiempo: document.getElementById("memoria-tiempo"),
    dato: document.getElementById("memoria-dato"),
    reiniciar: document.getElementById("memoria-reiniciar"),
    victoria: document.getElementById("memoria-victoria"),
    winTexto: document.getElementById("memoria-win-texto"),
    otra: document.getElementById("memoria-otra"),
    niveles: document.querySelectorAll(".game-levels button"),
  };
  if (!el.tablero || !window.LUGARES) return;

  const TEXTO_INICIAL = "Tocá dos cartas para empezar.";
  const PAUSA_ERROR = 900;
  const VISTA_PREVIA = { 6: 4, 8: 5 }; // segundos que se muestran las cartas al empezar
  const lugares = window.LUGARES.filter((l) => l.foto && l.nombre);

  let pares = 6;
  let totalPares = 6;
  let abiertas = [];
  let bloqueado = false;
  let movimientos = 0;
  let aciertos = 0;
  let inicio = 0;
  let reloj = null;
  let partida = 0;

  // ---------- utilidades ----------

  function mezclar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  function formatoTiempo(seg) {
    return Math.floor(seg / 60) + ":" + String(seg % 60).padStart(2, "0");
  }

  function segundosJugados() {
    return Math.floor((Date.now() - inicio) / 1000);
  }

  function detenerReloj() {
    clearInterval(reloj);
    reloj = null;
  }

  function arrancarReloj() {
    inicio = Date.now();
    reloj = setInterval(() => {
      el.tiempo.textContent = formatoTiempo(segundosJugados());
    }, 500);
  }

  // ---------- construcción de cartas ----------

  function textoCarta(texto) {
    const span = document.createElement("span");
    span.className = "memory-name";
    span.textContent = texto;
    return span;
  }

  function crearCarta(lugar, tipo) {
    const carta = document.createElement("button");
    carta.type = "button";
    carta.className = "memory-card";
    carta.dataset.id = lugar.id;
    carta.setAttribute("aria-label", "Carta boca abajo");

    const interior = document.createElement("span");
    interior.className = "memory-inner";

    const dorso = document.createElement("span");
    dorso.className = "memory-face memory-back";
    dorso.setAttribute("aria-hidden", "true");

    const frente = document.createElement("span");
    frente.className = "memory-face memory-front";

    if (tipo === "foto") {
      const img = document.createElement("img");
      img.src = base + lugar.foto;
      img.alt = "";
      img.addEventListener("error", () => {
        const respaldo = textoCarta(lugar.emoji || "📍");
        respaldo.style.fontSize = "2.2rem";
        frente.replaceChildren(respaldo);
      });
      frente.append(img);
      carta.dataset.etiqueta = "Foto de " + lugar.nombre;
    } else {
      frente.append(textoCarta(lugar.nombre));
      carta.dataset.etiqueta = "Nombre: " + lugar.nombre;
    }

    interior.append(dorso, frente);
    carta.append(interior);
    carta.addEventListener("click", () => voltear(carta));
    return carta;
  }

  // ---------- flujo del juego ----------

  function todasLasCartas() {
    return Array.from(el.tablero.querySelectorAll(".memory-card"));
  }

  function textoVista(seg) {
    return "¡Memorizá las cartas! Empezamos en " + seg + "…";
  }

  function iniciarVistaPrevia() {
    const idPartida = partida;
    let restante = VISTA_PREVIA[pares] || 4;
    bloqueado = true;
    el.dato.textContent = textoVista(restante);

    // Pequeña pausa para que se vea el giro al mostrar las cartas.
    setTimeout(() => {
      if (idPartida !== partida) return;
      todasLasCartas().forEach((c) => {
        c.classList.add("is-flipped");
        c.setAttribute("aria-label", c.dataset.etiqueta);
      });
    }, 80);

    const cuenta = setInterval(() => {
      if (idPartida !== partida) {
        clearInterval(cuenta);
        return;
      }
      restante--;
      if (restante > 0) {
        el.dato.textContent = textoVista(restante);
        return;
      }
      clearInterval(cuenta);
      todasLasCartas().forEach((c) => {
        c.classList.remove("is-flipped");
        c.setAttribute("aria-label", "Carta boca abajo");
      });
      bloqueado = false;
      el.dato.textContent = TEXTO_INICIAL;
    }, 1000);
  }

  function llevarAlJuego() {
    const caja = document.querySelector(".game-shell");
    if (!caja) return;

    // Si el juego ya se ve completo, no hace falta mover la página.
    const dock = document.querySelector(".dock");
    const hayDock = dock && getComputedStyle(dock).position === "fixed" && dock.getBoundingClientRect().height > 0;
    const limite = hayDock ? dock.getBoundingClientRect().top : window.innerHeight;
    const r = caja.getBoundingClientRect();
    if (r.top >= 70 && r.bottom <= limite) return;

    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    caja.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "start" });
  }

  function nuevaPartida(desdeUsuario) {
    partida++;
    detenerReloj();
    cerrarVictoria();
    abiertas = [];
    bloqueado = false;
    movimientos = 0;
    aciertos = 0;

    const elegidos = mezclar(lugares).slice(0, Math.min(pares, lugares.length));
    totalPares = elegidos.length;

    el.movs.textContent = "0";
    el.aciertos.textContent = "0";
    el.total.textContent = String(totalPares);
    el.tiempo.textContent = "0:00";
    el.dato.textContent = "";

    const cartas = [];
    elegidos.forEach((l) => {
      cartas.push(crearCarta(l, "foto"), crearCarta(l, "nombre"));
    });
    el.tablero.dataset.cartas = String(cartas.length);
    el.tablero.replaceChildren(...mezclar(cartas));

    iniciarVistaPrevia();
    if (desdeUsuario === true) llevarAlJuego();
  }

  function voltear(carta) {
    if (
      bloqueado ||
      carta.classList.contains("is-flipped") ||
      carta.classList.contains("is-matched")
    ) {
      return;
    }
    if (!reloj) arrancarReloj();

    carta.classList.add("is-flipped");
    carta.setAttribute("aria-label", carta.dataset.etiqueta);
    abiertas.push(carta);

    if (abiertas.length === 2) comparar();
  }

  function comparar() {
    const [a, b] = abiertas;
    movimientos++;
    el.movs.textContent = String(movimientos);

    if (a.dataset.id === b.dataset.id) {
      abiertas = [];
      [a, b].forEach((c) => {
        c.classList.remove("is-flipped");
        c.classList.add("is-matched");
      });
      aciertos++;
      el.aciertos.textContent = String(aciertos);
      mostrarDato(lugares.find((l) => l.id === a.dataset.id));
      if (aciertos === totalPares) terminar();
      return;
    }

    bloqueado = true;
    const idPartida = partida;
    [a, b].forEach((c) => c.classList.add("is-wrong"));
    el.dato.textContent = "No coinciden. ¡Probá de nuevo!";

    setTimeout(() => {
      if (idPartida !== partida) return;
      [a, b].forEach((c) => {
        c.classList.remove("is-flipped", "is-wrong");
        c.setAttribute("aria-label", "Carta boca abajo");
      });
      abiertas = [];
      bloqueado = false;
    }, PAUSA_ERROR);
  }

  function mostrarDato(lugar) {
    if (!lugar) return;
    const titulo = document.createElement("strong");
    titulo.textContent = lugar.nombre;
    const resto = (lugar.ciudad ? " · " + lugar.ciudad : "") + ". " + (lugar.dato || "");
    el.dato.replaceChildren("✔ ", titulo, resto);
  }

  // ---------- final y récord ----------

  function mensajeRecord(mov) {
    const clave = "cobolja-memoria-mejor-" + totalPares;
    let previo = NaN;
    try {
      previo = parseInt(localStorage.getItem(clave), 10);
    } catch (e) {}

    if (!previo) {
      try {
        localStorage.setItem(clave, String(mov));
      } catch (e) {}
      return "";
    }
    if (mov < previo) {
      try {
        localStorage.setItem(clave, String(mov));
      } catch (e) {}
      return " ¡Nuevo récord en este nivel!";
    }
    return " Tu mejor marca en este nivel: " + previo + " movimientos.";
  }

  function terminar() {
    detenerReloj();
    const seg = segundosJugados();
    el.tiempo.textContent = formatoTiempo(seg);
    el.winTexto.textContent =
      "Lo lograste en " + movimientos + " movimientos y " + formatoTiempo(seg) + "." +
      mensajeRecord(movimientos);

    const idPartida = partida;
    setTimeout(() => {
      if (idPartida !== partida) return;
      el.victoria.hidden = false;
      el.otra.focus();
    }, 700);
  }

  function cerrarVictoria() {
    el.victoria.hidden = true;
  }

  // ---------- eventos ----------

  el.niveles.forEach((boton) => {
    boton.setAttribute("aria-pressed", String(boton.classList.contains("is-active")));
    boton.addEventListener("click", () => {
      el.niveles.forEach((b) => {
        b.classList.toggle("is-active", b === boton);
        b.setAttribute("aria-pressed", String(b === boton));
      });
      pares = parseInt(boton.dataset.pares, 10);
      nuevaPartida(true);
    });
  });

  el.reiniciar.addEventListener("click", () => nuevaPartida(true));
  el.otra.addEventListener("click", () => nuevaPartida(true));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarVictoria();
  });

  nuevaPartida();
})();