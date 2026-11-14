/* Cruzá Argentina · cabalgata por cinco regiones del país
   Un gaucho a caballo cruza el país de norte a sur.

   Controles
     Saltar ........ barra espaciadora, flecha ↑, W, o tocar la pantalla
     Agacharse ..... flecha ↓, S, o deslizar el dedo hacia abajo
     Pausa ......... P o Esc

   Cómo funciona
   - Cada región dura LEN píxeles del mundo (unos 25 segundos). Al terminarla aparece
     una tarjeta con un dato y una pregunta de verdadero o falso.
   - 3 vidas por región. Si se acaban, se reintenta solo esa región.
   - Cada región tiene su propia trampa (ver "trampa" en REGIONES) y, a veces, cruzan
     cóndores que hay que esquivar agachándose.
   - El mate es un escudo: te salva de un choque.
   - Para cambiar textos, datos o preguntas, editá REGIONES (justo debajo).
   - Todo se dibuja con código (canvas): no usa imágenes ni sonido, no hay créditos que poner. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var canvas = $("cruza-canvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var el = {
    stage: $("cruza-stage"),
    overlay: $("cruza-overlay"),
    etiqueta: $("cruza-ov-etiqueta"),
    titulo: $("cruza-ov-titulo"),
    texto: $("cruza-ov-texto"),
    boton: $("cruza-ov-boton"),
    enlace: $("cruza-ov-enlace"),
    vf: $("cruza-vf"),
    vfV: $("cruza-vf-v"),
    vfF: $("cruza-vf-f"),
    pausa: $("cruza-pausa"),
    region: $("cruza-region"),
    soles: $("cruza-soles"),
    vidas: $("cruza-vidas"),
    mate: $("cruza-mate"),
    tiempo: $("cruza-tiempo"),
    ruta: $("cruza-ruta"),
  };

  /* ---------- Datos de las regiones ----------
     obst ...... obstáculos comunes de la región
     aves ...... probabilidad de que cruce un cóndor (hay que agacharse)
     trampa .... obstáculo especial de la región y su probabilidad
     vf ........ pregunta de verdadero o falso (v: true = verdadero)  */

  var REGIONES = [
    {
      nombre: "Quebrada de Humahuaca", lugar: "Jujuy", corto: "Jujuy",
      dato: "La Quebrada de Humahuaca, en Jujuy, es Patrimonio de la Humanidad de la UNESCO desde 2003. Sus cerros muestran capas de colores, como el Cerro de los Siete Colores de Purmamarca.",
      vf: { texto: "La Quebrada de Humahuaca está en la provincia de Salta.", v: false, exp: "Es falso: la Quebrada de Humahuaca está en la provincia de Jujuy." },
      decor: ["cardon", "mata"], obst: ["cardon", "roca"], aves: 0.16, trampa: { tipo: "rodante", p: 0.26 }, fauna: "llama",
      pal: { cieloA: [92, 158, 226], cieloB: [252, 226, 188], lejos: [150, 100, 132], medA: [236, 176, 96], medB: [208, 100, 72], medC: [146, 92, 142], suelo: [200, 132, 88], suelo2: [226, 166, 108], sol: [255, 236, 170] },
      par: { lejosAmp: 70, lejosPico: 0.2, nieve: 0, medAmp: 46, medPico: 0 },
    },
    {
      nombre: "La Pampa", lugar: "Buenos Aires", corto: "Pampa",
      dato: "La llanura pampeana tiene suelos muy fértiles y es una de las zonas agrícolas y ganaderas más importantes del país. Allí vivió el gaucho, jinete símbolo de la cultura argentina.",
      vf: { texto: "El gaucho es un personaje típico de la llanura pampeana.", v: true, exp: "Es verdad: el gaucho vivió en la llanura pampeana y es un símbolo de la cultura argentina." },
      decor: ["ombu", "poste", "mata"], obst: ["tranquera", "mata"], aves: 0.18, trampa: { tipo: "tranqueraD", p: 0.3 }, fauna: "nandu",
      pal: { cieloA: [96, 172, 236], cieloB: [222, 242, 252], lejos: [168, 200, 208], medA: [150, 200, 120], medB: [118, 178, 98], medC: [96, 152, 84], suelo: [92, 156, 80], suelo2: [130, 194, 96], sol: [255, 246, 200] },
      par: { lejosAmp: 18, lejosPico: 0, nieve: 0, medAmp: 22, medPico: 0 },
    },
    {
      nombre: "Aconcagua", lugar: "Mendoza", corto: "Mendoza",
      dato: "El cerro Aconcagua, en Mendoza, mide unos 6.960 metros: es la montaña más alta de América y de todo el hemisferio sur. Acá soplan ráfagas de viento que te hacen flotar.",
      vf: { texto: "El Aconcagua es la montaña más alta de América.", v: true, exp: "Es verdad: mide unos 6.960 metros y está en Mendoza." },
      decor: ["parra", "mata"], obst: ["roca", "tronco"], aves: 0.2, trampa: { tipo: "tronco", p: 0 }, fauna: "condor",
      pal: { cieloA: [66, 136, 218], cieloB: [196, 224, 250], lejos: [112, 128, 170], medA: [170, 140, 108], medB: [146, 116, 92], medC: [122, 98, 84], suelo: [150, 122, 92], suelo2: [180, 150, 110], sol: [255, 248, 220] },
      par: { lejosAmp: 150, lejosPico: 0.75, nieve: 1, medAmp: 50, medPico: 0.2 },
    },
    {
      nombre: "Patagonia", lugar: "Chubut", corto: "Patagonia",
      dato: "En Península Valdés (Chubut), Patrimonio de la Humanidad desde 1999, llegan cada año las ballenas francas australes para reproducirse.",
      vf: { texto: "Las ballenas francas australes llegan a Península Valdés, en la provincia de Santa Cruz.", v: false, exp: "Es falso: Península Valdés está en la provincia de Chubut." },
      decor: ["mata", "poste"], obst: ["mata", "roca", "tranquera"], aves: 0.14, trampa: { tipo: "guanaco", p: 0.26 }, fauna: "guanaco",
      pal: { cieloA: [118, 166, 214], cieloB: [240, 226, 198], lejos: [156, 152, 168], medA: [220, 190, 112], medB: [198, 162, 92], medC: [176, 140, 82], suelo: [190, 160, 98], suelo2: [216, 188, 120], sol: [255, 240, 190] },
      par: { lejosAmp: 56, lejosPico: 0.1, nieve: 0, medAmp: 30, medPico: 0 },
    },
    {
      nombre: "Glaciar Perito Moreno", lugar: "Santa Cruz", corto: "Glaciar",
      dato: "El glaciar Perito Moreno, cerca de El Calafate, está en el Parque Nacional Los Glaciares, Patrimonio de la Humanidad desde 1981. Su frente mide unos 5 km de ancho.",
      vf: { texto: "El glaciar Perito Moreno está en el Parque Nacional Los Glaciares.", v: true, exp: "Es verdad: está cerca de El Calafate, en Santa Cruz, y es Patrimonio de la Humanidad desde 1981." },
      decor: ["lenga", "hielo"], obst: ["hielo", "roca"], aves: 0.18, trampa: { tipo: "carambano", p: 0.3 }, fauna: "condor",
      pal: { cieloA: [126, 182, 232], cieloB: [228, 243, 253], lejos: [196, 214, 236], medA: [176, 228, 244], medB: [124, 198, 228], medC: [88, 166, 210], suelo: [226, 236, 244], suelo2: [250, 252, 255], sol: [255, 255, 255] },
      par: { lejosAmp: 100, lejosPico: 0.9, nieve: 0.9, medAmp: 70, medPico: 0.85 },
    },
  ];
  var N = REGIONES.length;

  // w, h: tamaño · y0: altura sobre el suelo · vx: velocidad propia hacia el jinete
  // extra: distancia de más con la que se genera (para que no se junte con el anterior)
  var OBST = {
    cardon: { w: 24, h: 50 }, roca: { w: 44, h: 30 }, tranquera: { w: 58, h: 46 },
    mata: { w: 46, h: 32 }, hielo: { w: 40, h: 50 }, tronco: { w: 60, h: 26 },
    tranqueraD: { w: 88, h: 46 },
    rodante: { w: 40, h: 40, vx: 170, extra: 300 },
    guanaco: { w: 54, h: 56, vx: 120, extra: 220 },
    carambano: { w: 30, h: 48 },
    ave: { w: 62, h: 30, y0: 102, vx: 90, extra: 170 },
  };
  var COMUNES = { cardon: 1, roca: 1, tranquera: 1, mata: 1, hielo: 1, tronco: 1 };

  /* ---------- Constantes y estado ---------- */

  var LEN = 9000;        // largo de cada región (px del mundo)
  var PX = 140;          // posición fija del jinete en pantalla
  var GRAV = 2400;       // gravedad (px/s²)
  var SALTO = 780;       // impulso del salto (px/s)
  var VIDAS = 3;
  var ALTO_PIE = 112;    // altura del jinete de pie (para choques)
  var ALTO_AGACHADO = 92;  // agachado queda a la altura de las orejas del caballo
  var reducido = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var W = 800, H = 380, K = 1;
  var estado = "inicio";   // inicio | jugando | pausa | tarjeta | pregunta | perdido | victoria
  var reg = 0;
  var dist = 0, tiempo = 0, animT = 0;
  var soles = 0, solesInicio = 0, vidas = VIDAS, escudoInicio = false;
  var jinete = { y: 0, vy: 0, coyote: 0, buffer: 0, invul: 0, polvo: 0, ag: 0, duckT: 0, escudo: false };
  var obstaculos = [], monedas = [], particulas = [], decorA = [], decorB = [], fauna = [], rayas = [];
  var sigObs = 0, sigDecA = 0, sigDecB = 0;
  var sacudida = 0, abajo = false, fauTimer = 2;
  var viento = { e: 0, t: 4 };   // e: 0 calma · 1 aviso · 2 ráfaga
  var nubes = [];
  var ultimo = 0, hudCache = "";

  /* ---------- Utilidades ---------- */

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function suave(t) { return t * t * (3 - 2 * t); }
  function azar(a, b) { return a + Math.random() * (b - a); }
  function elegir(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function mod(a, m) { return ((a % m) + m) % m; }
  function hash(n) { var s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }
  function mix(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function rgb(c, a) {
    var r = Math.round(c[0]), g = Math.round(c[1]), b = Math.round(c[2]);
    return a == null ? "rgb(" + r + "," + g + "," + b + ")" : "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }
  function oscuro(c, f) { return [c[0] * f, c[1] * f, c[2] * f]; }
  function claro(c, f) { return [lerp(c[0], 255, f), lerp(c[1], 255, f), lerp(c[2], 255, f)]; }
  function suelo() { return Math.round(H * 0.8); }
  function rr(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function elipse(x, y, rx, ry, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
  }
  function poli(pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (var i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    ctx.closePath();
  }
  // relleno con contorno oscuro: lo usan los obstáculos para que se distingan del fondo
  function rel() {
    ctx.fill();
    ctx.lineWidth = 2.4;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#2a1d16";
    ctx.stroke();
  }

  /* ---------- Tamaño del lienzo ---------- */

  function ajustar() {
    var ancho = el.stage.clientWidth || 720;
    if (ancho < 560) { W = 480; H = 400; } else { W = 800; H = 380; }
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(ancho * (H / W) * dpr);
    K = canvas.width / W;
  }

  /* ---------- Estilo (colores) según la región y la hora del día ---------- */

  function calcularEstilo() {
    var a = REGIONES[reg], b = REGIONES[Math.min(reg + 1, N - 1)];
    var t = 0;
    if (reg < N - 1) t = suave(clamp(((dist - reg * LEN) / LEN - 0.88) / 0.12, 0, 1));
    var E = { t: t };
    var k;
    for (k in a.pal) E[k] = mix(a.pal[k], b.pal[k], t);
    for (k in a.par) E[k] = lerp(a.par[k], b.par[k], t);
    // el día avanza: amanecer en Jujuy, atardecer en el glaciar
    var p = clamp(dist / (N * LEN), 0, 1);
    var kd = clamp((p - 0.45) / 0.55, 0, 1), ka = clamp((0.35 - p) / 0.35, 0, 1);
    E.cieloA = mix(mix(E.cieloA, [70, 80, 160], ka * 0.35), [52, 48, 112], kd * 0.6);
    E.cieloB = mix(mix(E.cieloB, [255, 214, 160], ka * 0.5), [255, 150, 104], kd * 0.7);
    E.sol = mix(E.sol, [255, 150, 70], kd * 0.8);
    E.p = p; E.kd = kd;
    return E;
  }

  /* ---------- Fondo ---------- */

  function cielo(E) {
    var g = ctx.createLinearGradient(0, 0, 0, suelo());
    g.addColorStop(0, rgb(E.cieloA));
    g.addColorStop(1, rgb(E.cieloB));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // estrellas al caer la tarde
    if (E.kd > 0.5) {
      ctx.fillStyle = "rgba(255,255,255," + ((E.kd - 0.5) * 1.6).toFixed(2) + ")";
      for (var s = 0; s < 34; s++) {
        ctx.fillRect(hash(s) * W, hash(s + 50) * H * 0.42, 1.6, 1.6);
      }
    }
    // sol con resplandor (baja hacia el final del recorrido)
    var sx = W * 0.78, sy = H * (0.3 - 0.14 * Math.sin(Math.PI * E.p));
    var r = ctx.createRadialGradient(sx, sy, 6, sx, sy, 90);
    r.addColorStop(0, rgb(E.sol, 0.9));
    r.addColorStop(1, rgb(E.sol, 0));
    ctx.fillStyle = r;
    ctx.fillRect(sx - 100, sy - 100, 200, 200);
    ctx.fillStyle = rgb(E.sol);
    ctx.beginPath(); ctx.arc(sx, sy, 24, 0, Math.PI * 2); ctx.fill();
  }

  function dibujarNubes() {
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    for (var i = 0; i < nubes.length; i++) {
      var n = nubes[i];
      var x = mod(n.x - dist * 0.04 - animT * 7, W + 240) - 120;
      var y = n.y * (H * 0.4), s = n.s;
      ctx.beginPath();
      ctx.arc(x, y, 16 * s, 0, Math.PI * 2);
      ctx.arc(x + 20 * s, y - 8 * s, 20 * s, 0, Math.PI * 2);
      ctx.arc(x + 44 * s, y, 15 * s, 0, Math.PI * 2);
      ctx.arc(x + 22 * s, y + 5 * s, 17 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function montanas(par, base, amp, pico, freq, relleno, nieve) {
    var x0 = dist * par, pts = [], x, u, n, p, y;
    for (x = 0; x <= W + 8; x += 8) {
      u = (x + x0) * freq;
      n = (Math.sin(u * 0.9 + 1.3) * 0.55 + Math.sin(u * 2.3 + 0.4) * 0.3 + Math.sin(u * 5.1) * 0.15) * 0.5 + 0.5;
      p = Math.pow(1 - Math.abs(Math.sin(u * 1.1 + 0.7)), 1.6) * (0.55 + 0.45 * n);
      y = base - amp * (n * (1 - pico) + p * pico);
      pts.push(x, y);
    }
    function trazar() {
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (var i = 0; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
      ctx.lineTo(W + 8, H);
      ctx.closePath();
    }
    ctx.fillStyle = relleno;
    trazar(); ctx.fill();
    if (nieve && nieve.a > 0.02) {
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, nieve.y); ctx.clip();
      ctx.fillStyle = "rgba(255,255,255," + nieve.a.toFixed(2) + ")";
      trazar(); ctx.fill();
      ctx.restore();
    }
  }

  function fondo(E) {
    var gy = suelo();
    var baseL = gy - 34, ampL = E.lejosAmp;
    montanas(0.14, baseL, ampL, E.lejosPico, 0.0045, rgb(E.lejos), { a: E.nieve * 0.92, y: baseL - ampL * 0.55 });
    // lomas medias con franjas de color
    var baseM = gy - 4, ampM = E.medAmp;
    var g = ctx.createLinearGradient(0, baseM - ampM, 0, baseM);
    g.addColorStop(0, rgb(E.medA));
    g.addColorStop(0.55, rgb(E.medB));
    g.addColorStop(1, rgb(E.medC));
    montanas(0.4, baseM, ampM, E.medPico, 0.0075, g, null);
  }

  function suelos(E) {
    var gy = suelo();
    var g = ctx.createLinearGradient(0, gy, 0, H);
    g.addColorStop(0, rgb(E.suelo));
    g.addColorStop(1, rgb(oscuro(E.suelo, 0.82)));
    ctx.fillStyle = g;
    ctx.fillRect(0, gy, W, H - gy);
    ctx.fillStyle = rgb(E.suelo2);
    ctx.fillRect(0, gy, W, 6);
    // piedritas que se mueven con el suelo
    ctx.fillStyle = rgb(oscuro(E.suelo, 0.7), 0.35);
    var paso = 64, i0 = Math.floor(dist / paso), i;
    for (i = i0 - 1; i < i0 + W / paso + 2; i++) {
      var x = i * paso - dist + hash(i) * 30;
      var y = gy + 14 + hash(i + 9) * (H - gy - 26);
      rr(x, y, 8 + hash(i + 3) * 10, 3, 1.5); ctx.fill();
    }
  }

  /* ---------- Decorado (no choca: se dibuja pálido para no confundirse) ---------- */

  var DECOR = {
    cardon: function () {
      ctx.fillStyle = "#4f8a58";
      rr(-8, -76, 16, 76, 8); ctx.fill();
      rr(-24, -34, 18, 9, 4.5); ctx.fill();
      rr(-28, -58, 9, 33, 4.5); ctx.fill();
      rr(8, -26, 16, 8, 4); ctx.fill();
      rr(17, -46, 9, 28, 4.5); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-3, -70); ctx.lineTo(-3, -6); ctx.moveTo(3, -70); ctx.lineTo(3, -6); ctx.stroke();
    },
    mata: function () {
      ctx.fillStyle = "#8d9a58";
      elipse(0, -12, 22, 12); ctx.fill();
      elipse(-16, -8, 14, 9); ctx.fill();
      elipse(16, -8, 15, 10); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      elipse(-4, -17, 12, 5); ctx.fill();
    },
    ombu: function () {
      ctx.fillStyle = "#6b4a2e";
      poli([-16, 0, -7, -30, 7, -30, 16, 0]); ctx.fill();
      ctx.fillStyle = "#3f7a4c";
      elipse(0, -56, 42, 26); ctx.fill();
      elipse(-28, -44, 26, 17); ctx.fill();
      elipse(28, -44, 26, 17); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.14)";
      elipse(-8, -66, 24, 10); ctx.fill();
    },
    poste: function () {
      var i;
      ctx.strokeStyle = "rgba(60,40,30,0.7)"; ctx.lineWidth = 1.5;
      for (i = 0; i < 2; i++) {
        ctx.beginPath(); ctx.moveTo(-52, -34 + i * 12); ctx.lineTo(52, -34 + i * 12); ctx.stroke();
      }
      ctx.fillStyle = "#7a5636";
      for (i = -1; i <= 1; i++) { rr(i * 52 - 3, -42, 6, 42, 2); ctx.fill(); }
    },
    parra: function () {
      for (var i = -1; i <= 1; i++) {
        ctx.fillStyle = "#6b4a2e"; rr(i * 32 - 2, -34, 4, 34, 1.5); ctx.fill();
        ctx.fillStyle = "#6f9f46"; elipse(i * 32, -36, 15, 11); ctx.fill();
        ctx.fillStyle = "#8a4d8a"; ctx.beginPath(); ctx.arc(i * 32 + 4, -28, 3.2, 0, 6.283); ctx.arc(i * 32 - 3, -26, 3, 0, 6.283); ctx.fill();
      }
    },
    lenga: function () {
      ctx.fillStyle = "#5a3d28"; rr(-3, -12, 6, 12, 1); ctx.fill();
      ctx.fillStyle = "#2f6a52";
      poli([-22, -8, 0, -48, 22, -8]); ctx.fill();
      poli([-17, -30, 0, -64, 17, -30]); ctx.fill();
      poli([-12, -50, 0, -82, 12, -50]); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      poli([0, -82, -6, -68, 6, -68]); ctx.fill();
      poli([0, -64, -7, -50, 7, -50]); ctx.fill();
    },
    hielo: function () {
      ctx.fillStyle = "#b4e4f4";
      poli([-18, 0, -11, -36, -3, -24, 5, -56, 13, -28, 20, 0]); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      poli([-3, -24, 5, -56, 8, -30]); ctx.fill();
    },
  };

  function actualizarDecor(lista, par, sigNombre, gapA, gapB) {
    var sc = dist * par, i;
    var sig = sigNombre === "A" ? sigDecA : sigDecB;
    if (sig < sc - 100) sig = sc - 100;
    while (sig - sc < W + 120) {
      lista.push({ x: sig, tipo: elegir(REGIONES[reg].decor) });
      sig += azar(gapA, gapB);
    }
    if (sigNombre === "A") sigDecA = sig; else sigDecB = sig;
    for (i = lista.length - 1; i >= 0; i--) if (lista[i].x - sc < -160) lista.splice(i, 1);
  }

  function dibujarDecor(lista, par, esc, base, alfa) {
    var sc = dist * par;
    ctx.globalAlpha = alfa;
    for (var i = 0; i < lista.length; i++) {
      var d = lista[i];
      ctx.save();
      ctx.translate(d.x - sc, base);
      ctx.scale(esc, esc);
      DECOR[d.tipo]();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- Animales (dibujos compartidos) ---------- */

  // Cuadrúpedo (llama, guanaco). Mira hacia la derecha, pies en y = 0.
  function cuadrupedo(color, cuello, t) {
    var ph = Math.sin(t * 12) * 7, i, x;
    ctx.lineCap = "round"; ctx.lineWidth = 4.5; ctx.strokeStyle = rgb(oscuro(color, 0.62));
    var patas = [-15, -7, 9, 17];
    for (i = 0; i < 4; i++) {
      x = patas[i];
      ctx.beginPath(); ctx.moveTo(x, -22); ctx.lineTo(x + ph * (i % 2 ? 1 : -1), 0); ctx.stroke();
    }
    ctx.fillStyle = rgb(color);
    elipse(0, -31, 23, 11.5); ctx.fill();
    ctx.strokeStyle = rgb(color); ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(16, -35); ctx.lineTo(25, -35 - cuello); ctx.stroke();
    elipse(29, -37 - cuello, 7.5, 5, -0.25); ctx.fill();
    ctx.fillStyle = rgb(oscuro(color, 0.7));
    poli([25, -40 - cuello, 24, -50 - cuello, 28, -42 - cuello]); ctx.fill();
    ctx.fillStyle = rgb(claro(color, 0.35));
    elipse(-2, -26, 15, 5); ctx.fill();
    ctx.fillStyle = rgb(color); poli([-22, -36, -28, -40, -22, -28]); ctx.fill();
  }

  // Ñandú. Mira hacia la derecha.
  function nandu(t) {
    var ph = Math.sin(t * 16) * 9;
    ctx.lineCap = "round"; ctx.lineWidth = 3.2; ctx.strokeStyle = "#a89f8f";
    ctx.beginPath(); ctx.moveTo(-3, -26); ctx.lineTo(-3 + ph, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, -26); ctx.lineTo(5 - ph, 0); ctx.stroke();
    ctx.fillStyle = "#8d8577"; elipse(0, -34, 18, 11); ctx.fill();
    ctx.fillStyle = "#6f685c"; elipse(-6, -38, 11, 7); ctx.fill();
    ctx.strokeStyle = "#8d8577"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(12, -38); ctx.quadraticCurveTo(20, -50, 18, -64); ctx.stroke();
    ctx.fillStyle = "#8d8577"; elipse(21, -66, 5.5, 3.8); ctx.fill();
    ctx.fillStyle = "#c9a45a"; poli([25, -67, 31, -65, 25, -64]); ctx.fill();
  }

  // Cóndor andino. Mira hacia la izquierda, centro en (0, 0).
  function condor(t) {
    var f = Math.sin(t * 9);
    ctx.fillStyle = "#3a3a44";
    poli([2, -2, 30, -2 - 15 * f - 4, 34, -2 - 15 * f, 12, 3]); ctx.fill();
    ctx.fillStyle = "#23232b"; poli([14, -2, 28, -3, 28, 3, 14, 3]); ctx.fill();
    ctx.fillStyle = "#23232b"; elipse(2, 0, 15, 6.5); ctx.fill();
    ctx.fillStyle = "#f4f1ea"; elipse(-10, -1, 5, 4.5); ctx.fill();
    ctx.fillStyle = "#7a2d2d"; ctx.beginPath(); ctx.arc(-17, -1.5, 3.6, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#d8c9a0"; poli([-20, -2.4, -25, 0, -20, 0.6]); ctx.fill();
    ctx.fillStyle = "#30303a";
    poli([-6, -2, 16, -2, 22, -2 - 17 * f - 3, 2, -2 - 19 * f]); ctx.fill();
  }

  /* ---------- Fauna de fondo ---------- */

  function actualizarFauna(dt, vel) {
    var i, f, net, va, tipo;
    fauTimer -= dt;
    if (fauTimer <= 0 && fauna.length < 2) {
      tipo = REGIONES[reg].fauna;
      va = tipo === "llama" ? 70 : tipo === "nandu" ? 330 : tipo === "guanaco" ? 300 : 150;
      net = va - vel * 0.62;
      fauna.push({ tipo: tipo, x: net > 0 ? -80 : W + 80, va: va, y: tipo === "condor" ? azar(H * 0.12, H * 0.3) : 0, t: Math.random() * 6 });
      fauTimer = azar(4, 8);
    }
    for (i = fauna.length - 1; i >= 0; i--) {
      f = fauna[i];
      f.x += (f.va - vel * 0.62) * dt;
      f.t += dt;
      if (f.x < -180 || f.x > W + 220) fauna.splice(i, 1);
    }
  }

  function dibujarFauna() {
    var gy = suelo();
    ctx.globalAlpha = 0.85;
    for (var i = 0; i < fauna.length; i++) {
      var f = fauna[i];
      ctx.save();
      if (f.tipo === "condor") {
        ctx.translate(f.x, f.y);
        ctx.scale(-0.8, 0.8);
        condor(f.t);
      } else {
        ctx.translate(f.x, gy - 10);
        ctx.scale(0.6, 0.6);
        if (f.tipo === "llama") cuadrupedo([232, 220, 196], 26, f.t);
        else if (f.tipo === "guanaco") cuadrupedo([184, 140, 92], 22, f.t);
        else nandu(f.t);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- Obstáculos ---------- */

  var DIBUJO_OBST = {
    cardon: function () {
      ctx.fillStyle = "#3f7d4c"; rr(-6, -50, 12, 50, 6); rel();
      rr(-12, -26, 8, 7, 3.5); rel(); rr(-14, -42, 7, 22, 3.5); rel();
      ctx.fillStyle = "rgba(255,255,255,0.25)"; rr(-2, -46, 2, 40, 1); ctx.fill();
    },
    roca: function () {
      ctx.fillStyle = "#6f6a68";
      poli([-22, 0, -17, -20, -6, -30, 8, -28, 19, -17, 22, 0]); rel();
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      poli([-17, -20, -6, -30, 8, -28, 0, -18]); ctx.fill();
    },
    tranquera: function () {
      ctx.fillStyle = "#8a5d36";
      rr(-28, -46, 6, 46, 2); rel(); rr(22, -46, 6, 46, 2); rel();
      rr(-28, -42, 56, 6, 2); rel(); rr(-28, -26, 56, 6, 2); rel(); rr(-28, -10, 56, 6, 2); rel();
    },
    tranqueraD: function () {
      ctx.save(); ctx.translate(-24, 0); DIBUJO_OBST.tranquera(); ctx.restore();
      ctx.save(); ctx.translate(24, 0); DIBUJO_OBST.tranquera(); ctx.restore();
    },
    mata: function () {
      ctx.fillStyle = "#7d8a46";
      elipse(0, -14, 23, 14); rel(); elipse(-14, -10, 12, 9); rel(); elipse(15, -10, 13, 10); rel();
      ctx.strokeStyle = "#5a6430"; ctx.lineWidth = 1.5;
      for (var i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 6, -16); ctx.lineTo(i * 7, -30 + Math.abs(i) * 2); ctx.stroke(); }
    },
    hielo: function () {
      ctx.fillStyle = "#a6dcf0";
      poli([-20, 0, -12, -34, -4, -24, 4, -50, 13, -26, 20, 0]); rel();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      poli([-4, -24, 4, -50, 8, -28]); ctx.fill();
    },
    tronco: function () {
      ctx.fillStyle = "#7b5132"; rr(-30, -26, 60, 26, 9); rel();
      ctx.fillStyle = "#c79a68"; elipse(-27, -13, 5, 12); rel();
      ctx.fillStyle = "rgba(255,255,255,0.16)"; rr(-20, -23, 44, 4, 2); ctx.fill();
    },
    rodante: function (o) {
      ctx.save();
      ctx.translate(0, -20);
      ctx.rotate(-o.rot);
      ctx.fillStyle = "#7b7470";
      ctx.beginPath(); ctx.arc(0, 0, 20, 0, 6.283); rel();
      ctx.strokeStyle = "#4a4440"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-9, -12); ctx.lineTo(2, -2); ctx.lineTo(-4, 10); ctx.moveTo(2, -2); ctx.lineTo(13, 4); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.beginPath(); ctx.arc(-6, -8, 7, 0, 6.283); ctx.fill();
      ctx.restore();
    },
    guanaco: function () {
      ctx.save();
      ctx.scale(-1.0, 1.0);
      ctx.translate(-2, 0);
      cuadrupedo([122, 80, 50], 24, animT);
      ctx.restore();
    },
    carambano: function () {
      ctx.fillStyle = "#a6dcf0";
      poli([-15, 0, -9, -30, -2, -22, 3, -48, 10, -24, 15, 0]); rel();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      poli([-2, -22, 3, -48, 6, -26]); ctx.fill();
    },
    ave: function () {
      ctx.save();
      ctx.translate(0, -15);
      ctx.scale(1.3, 1.3);
      condor(animT + 1);
      ctx.restore();
    },
  };

  function dibujarObstaculo(o, sx, gy) {
    var base = gy - o.y0;
    ctx.save();
    // sombra sobre el suelo
    ctx.fillStyle = "rgba(0,0,0," + (o.tipo === "ave" ? 0.12 : 0.28) + ")";
    elipse(sx, gy + 5, o.w * 0.55, 5); ctx.fill();
    // aviso en el suelo antes de que caiga el carámbano
    if (o.tipo === "carambano" && !o.cae) {
      var pu = 0.6 + 0.4 * Math.sin(animT * 12);
      ctx.fillStyle = "rgba(214,64,40," + pu.toFixed(2) + ")";
      poli([sx - 11, gy + 11, sx + 11, gy + 11, sx, gy - 9]); ctx.fill();
      ctx.fillStyle = "#fff"; rr(sx - 1.6, gy - 3, 3.2, 8, 1); ctx.fill();
      ctx.beginPath(); ctx.arc(sx, gy + 8.4, 1.6, 0, 6.283); ctx.fill();
      ctx.restore();
      return;
    }
    // resplandor claro alrededor: separa el obstáculo del fondo
    ctx.shadowColor = "rgba(255,255,255,0.95)";
    ctx.shadowBlur = 9 * K;
    if (o.tipo === "carambano" && o.y0 > 0) {
      ctx.translate(sx, base - o.h);
      ctx.scale(1, -1);
    } else {
      ctx.translate(sx, base);
    }
    DIBUJO_OBST[o.tipo](o);
    ctx.restore();
  }

  function crearObstaculo(tipo, x) {
    var d = OBST[tipo];
    var o = { tipo: tipo, x: x, w: d.w, h: d.h, y0: d.y0 || 0, vx: d.vx || 0, rot: 0, cae: false };
    if (tipo === "carambano") o.y0 = 260;
    obstaculos.push(o);
    return o;
  }

  function crearMonedas(x, y, n, sep, arco) {
    for (var i = 0; i < n; i++) {
      var f = n === 1 ? 0 : i / (n - 1) * 2 - 1;
      monedas.push({ x: x + i * sep, y: y + (arco ? (1 - f * f) * arco : 0), tomada: false, fase: Math.random() * 6, tipo: "sol" });
    }
  }

  function generar() {
    var R = REGIONES[reg], o, o2, fin, gap, r, tipo, vel, d;
    while (sigObs - dist < W + 80) {
      if (sigObs > (reg + 1) * LEN - 700) {
        sigObs = reg === N - 1 ? Infinity : (reg + 1) * LEN + 650;
        break;
      }
      vel = velocidad();
      r = Math.random();
      if (r < R.aves) tipo = "ave";
      else if (r < R.aves + R.trampa.p) tipo = R.trampa.tipo;
      else tipo = elegir(R.obst);
      d = OBST[tipo];
      o = crearObstaculo(tipo, sigObs + (d.extra || 0));
      fin = o.x + o.w;
      // pares: solo de obstáculos bajos y bien juntos, para poder cruzarlos con un solo salto
      if (COMUNES[tipo] && tipo !== "tranquera" && reg >= 1 && Math.random() < 0.16) {
        o2 = crearObstaculo(tipo, o.x + o.w + 24);
        fin = o2.x + o2.w;
      }
      gap = 190 + vel * 0.45 + Math.random() * 230;
      if (tipo === "ave") {
        // soles a ras del suelo, justo debajo del cóndor: premian al que se agacha
        crearMonedas(o.x - 30, 36, 3, 30, 0);
      } else if (COMUNES[tipo] || tipo === "tranqueraD") {
        if (Math.random() < 0.5) crearMonedas((o.x + fin) / 2 - 54, 64, 4, 36, 54);
      }
      if (Math.random() < 0.2) crearMonedas(fin + gap * 0.3, 38, 5, 32, 0);
      if (Math.random() < 0.13) monedas.push({ x: fin + gap * 0.62, y: 58, tomada: false, fase: 0, tipo: "mate" });
      sigObs = fin + gap;
    }
  }

  /* ---------- Soles de Mayo y mate ---------- */

  function dibujarSol(x, y, t, fase) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 1.4 + fase);
    ctx.fillStyle = "#f6b40e";
    for (var i = 0; i < 8; i++) {
      ctx.rotate(Math.PI / 4);
      poli([0, -15, 3.4, -8, -3.4, -8]); ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = "#f6b40e"; ctx.beginPath(); ctx.arc(x, y, 8.5, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#ffd75a"; ctx.beginPath(); ctx.arc(x, y, 6, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#b86e00";
    ctx.beginPath(); ctx.arc(x - 2.2, y - 1.2, 0.9, 0, 6.283); ctx.arc(x + 2.2, y - 1.2, 0.9, 0, 6.283); ctx.fill();
    ctx.strokeStyle = "#b86e00"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y + 0.5, 2.6, 0.2, Math.PI - 0.2); ctx.stroke();
  }

  function dibujarMate(x, y, t) {
    var by = y + Math.sin(t * 4) * 2;
    ctx.save();
    ctx.translate(x, by);
    // brillo
    var g = ctx.createRadialGradient(0, 0, 4, 0, 0, 26);
    g.addColorStop(0, "rgba(255,255,255,0.65)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.fillRect(-28, -28, 56, 56);
    // vapor
    ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 2; ctx.lineCap = "round";
    for (var i = -1; i <= 1; i += 2) {
      ctx.beginPath(); ctx.moveTo(i * 4, -9); ctx.quadraticCurveTo(i * 4 + Math.sin(t * 5 + i) * 4, -15, i * 4, -21); ctx.stroke();
    }
    // calabaza
    ctx.fillStyle = "#8a5a2b"; elipse(0, 2, 11, 12); rel();
    ctx.fillStyle = "#4a3418"; elipse(0, -8, 8, 2.6); ctx.fill();
    ctx.fillStyle = "#b78347"; elipse(-3, 3, 4, 7); ctx.fill();
    ctx.fillStyle = "#c9ccd0"; ctx.strokeStyle = "#2a1d16"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(3, -8); ctx.lineTo(10, -20); ctx.stroke();
    ctx.restore();
  }

  /* ---------- Jinete y caballo ---------- */

  function pata(hx, hy, a1, a2, color, ancho) {
    var kx = hx + Math.sin(a1) * 24, ky = hy + Math.cos(a1) * 24;
    var fx = kx + Math.sin(a1 + a2) * 24, fy = ky + Math.cos(a1 + a2) * 24;
    ctx.strokeStyle = color; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.lineWidth = ancho; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.stroke();
    ctx.lineWidth = ancho - 2.5; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.fillStyle = "#2a1a12"; ctx.beginPath(); ctx.arc(fx, fy, ancho / 2 - 0.5, 0, 6.283); ctx.fill();
  }

  function dibujarJinete(t) {
    var gy = suelo() - jinete.y;
    var aire = jinete.y > 2;
    var fase = t * 14;
    var rebote = aire ? 0 : Math.sin(fase * 2) * 2.2;
    var cola = Math.sin(fase) * 6;
    var ag = jinete.ag;

    ctx.save();
    ctx.translate(PX, gy);
    ctx.scale(0.8, 0.8);
    ctx.translate(0, rebote);

    var i, o, a1, a2;
    var lejanas = [[-26, 0, "back"], [20, 2.6, "front"]];
    var cercanas = [[-16, 0.55, "back"], [28, 3.15, "front"]];
    function patas(lista, color) {
      for (i = 0; i < lista.length; i++) {
        o = lista[i][1];
        if (aire) {
          a1 = lista[i][2] === "front" ? 1.05 : -0.95;
          a2 = lista[i][2] === "front" ? -0.15 : -0.3;
        } else {
          a1 = 0.75 * Math.sin(fase + o);
          a2 = -(0.5 + 0.5 * Math.sin(fase + o + 1.6)) * 0.9;
        }
        pata(lista[i][0], -46, a1, a2, color, 9);
      }
    }
    patas(lejanas, "#6e3b1e");

    // cola
    ctx.strokeStyle = "#2b1a12"; ctx.lineWidth = 8; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-34, -62); ctx.quadraticCurveTo(-52, -58 + cola * 0.4, -60 + cola, -34); ctx.stroke();

    // cuerpo
    ctx.fillStyle = "#8c4f28";
    elipse(0, -58, 37, 19); ctx.fill();
    elipse(24, -60, 17, 17); ctx.fill();
    ctx.fillStyle = "#a86a3b";
    elipse(-2, -50, 26, 7); ctx.fill();

    // cuello y cabeza
    ctx.strokeStyle = "#8c4f28"; ctx.lineWidth = 18; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(24, -66); ctx.lineTo(45, -98); ctx.stroke();
    ctx.fillStyle = "#8c4f28";
    elipse(57, -95, 16, 8.5, 0.62); ctx.fill();
    ctx.fillStyle = "#6e3b1e";
    elipse(67, -88, 5, 4.4, 0.62); ctx.fill();
    poli([42, -104, 47, -118, 51, -104]); ctx.fill();
    ctx.fillStyle = "#1c120d"; ctx.beginPath(); ctx.arc(54, -99, 1.9, 0, 6.283); ctx.fill();
    ctx.strokeStyle = "#2b1a12"; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(16, -70); ctx.quadraticCurveTo(26 - cola * 0.2, -90, 38, -108); ctx.stroke();

    patas(cercanas, "#8c4f28");

    // el gaucho se agacha: se inclina hacia adelante, sobre el cuello del caballo
    ctx.save();
    if (ag > 0.01) {
      ctx.translate(ag * 8, ag * 22);
      ctx.translate(-2, -80);
      ctx.rotate(ag * 1.35);
      ctx.translate(2, 80);
    }
    // pelego / montura
    ctx.fillStyle = "#c9a25f"; elipse(-2, -76, 19, 6); ctx.fill();
    ctx.fillStyle = "#e8e0d0"; elipse(-2, -78, 15, 3.2); ctx.fill();
    // pierna de bombacha y bota
    ctx.strokeStyle = "#d8cfae"; ctx.lineWidth = 11; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-3, -84); ctx.lineTo(7, -64); ctx.stroke();
    ctx.fillStyle = "#2b1a12"; rr(3, -66, 11, 7, 3); ctx.fill();
    // poncho
    ctx.fillStyle = "#c13a2f";
    poli([-15, -82, 12, -82, 8, -114, -10, -114]); ctx.fill();
    ctx.fillStyle = "#2a1a1a"; rr(-3, -114, 5, 32, 1); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.18)"; poli([-15, -82, -9, -82, -6, -114, -10, -114]); ctx.fill();
    // pañuelo celeste
    ctx.fillStyle = "#74acdf"; elipse(-1, -114, 8, 3.4); ctx.fill();
    // cabeza
    ctx.fillStyle = "#e8b48b"; ctx.beginPath(); ctx.arc(-1, -122, 8, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#1c120d"; ctx.beginPath(); ctx.arc(3, -123, 1.2, 0, 6.283); ctx.fill();
    // sombrero
    ctx.fillStyle = "#1f1a18"; elipse(-1, -128, 16, 3.6); ctx.fill();
    rr(-8, -140, 15, 13, 4); ctx.fill();
    ctx.fillStyle = "#74acdf"; rr(-8, -132, 15, 2.6, 1); ctx.fill();
    // brazo
    ctx.strokeStyle = "#c13a2f"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(6, -110); ctx.lineTo(17, -97); ctx.stroke();
    ctx.restore();

    // riendas
    ctx.strokeStyle = "rgba(30,20,15,0.8)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(18 + ag * 14, -97 + ag * 8); ctx.lineTo(52, -92); ctx.stroke();

    ctx.restore();
  }

  function dibujarSombra() {
    var gy = suelo();
    var esc = 1 - Math.min(jinete.y / 260, 0.45);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    elipse(PX + 6, gy + 6, 44 * esc, 6 * esc); ctx.fill();
  }

  function dibujarEscudo() {
    if (!jinete.escudo) return;
    var cx = PX + 8, cy = suelo() - jinete.y - 54;
    var pu = 0.5 + 0.5 * Math.sin(animT * 6);
    ctx.fillStyle = "rgba(140,210,255," + (0.14 + pu * 0.08).toFixed(2) + ")";
    ctx.beginPath(); ctx.arc(cx, cy, 64, 0, 6.283); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255," + (0.55 + pu * 0.3).toFixed(2) + ")";
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx, cy, 64, 0, 6.283); ctx.stroke();
  }

  /* ---------- Partículas ---------- */

  function chispas(x, y, n, color) {
    if (reducido) return;
    for (var i = 0; i < n; i++) {
      particulas.push({ x: x, y: y, vx: azar(-90, 90), vy: azar(-140, -20), vida: 0, max: azar(0.35, 0.65), r: azar(1.5, 3), c: color, g: 300 });
    }
  }
  function polvo(E) {
    if (reducido) return;
    particulas.push({ x: PX - 22, y: suelo() + 2, vx: azar(-170, -110), vy: azar(-40, -12), vida: 0, max: azar(0.35, 0.6), r: azar(3, 6), c: "polvo", g: 0, color: claro(E.suelo, 0.25) });
  }
  function dibujarParticulas(dt) {
    for (var i = particulas.length - 1; i >= 0; i--) {
      var p = particulas[i];
      p.vida += dt;
      if (p.vida >= p.max) { particulas.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt;
      var a = 1 - p.vida / p.max;
      if (p.c === "polvo") ctx.fillStyle = rgb(p.color, a * 0.55);
      else ctx.fillStyle = p.c;
      ctx.globalAlpha = p.c === "polvo" ? 1 : a;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (p.c === "polvo" ? 1 + (1 - a) : 1), 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- Viento (Aconcagua) ---------- */

  function actualizarViento(dt) {
    var i;
    if (reg !== 2) { viento.e = 0; rayas = []; return; }
    viento.t -= dt;
    if (viento.t <= 0) {
      if (viento.e === 0) { viento.e = 1; viento.t = 0.9; }
      else if (viento.e === 1) { viento.e = 2; viento.t = 2.2; }
      else { viento.e = 0; viento.t = azar(5, 8); }
    }
    if (viento.e > 0) {
      for (i = 0; i < 2; i++) {
        if (Math.random() < 0.6) rayas.push({ x: W + 20, y: azar(10, suelo() - 6), l: azar(40, 100), v: azar(900, 1300) });
      }
    }
    for (i = rayas.length - 1; i >= 0; i--) {
      rayas[i].x -= rayas[i].v * dt;
      if (rayas[i].x < -120) rayas.splice(i, 1);
    }
  }

  function dibujarViento() {
    var i, r;
    if (rayas.length) {
      ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 2; ctx.lineCap = "round";
      for (i = 0; i < rayas.length; i++) {
        r = rayas[i];
        ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x + r.l, r.y); ctx.stroke();
      }
    }
    if (viento.e > 0) {
      var txt = viento.e === 1 ? "¡Viento fuerte!" : "¡Ráfaga! Flotás más tiempo";
      ctx.font = "700 17px 'Atkinson Hyperlegible','Segoe UI',sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.lineWidth = 4; ctx.strokeStyle = "rgba(18,51,84,0.85)";
      ctx.strokeText(txt, W / 2, 26);
      ctx.fillStyle = viento.e === 1 && Math.floor(animT * 6) % 2 === 0 ? "#ffd75a" : "#ffffff";
      ctx.fillText(txt, W / 2, 26);
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    }
  }

  /* ---------- Aviso de cóndor que viene ---------- */

  function dibujarAvisos() {
    var gy = suelo();
    for (var i = 0; i < obstaculos.length; i++) {
      var o = obstaculos[i];
      if (o.tipo !== "ave") continue;
      var sx = o.x - dist + PX;
      if (sx > W - 6 && sx < W + 320) {
        var pu = 0.6 + 0.4 * Math.sin(animT * 14), cy = gy - o.y0 - o.h / 2;
        ctx.fillStyle = "rgba(214,64,40," + pu.toFixed(2) + ")";
        ctx.beginPath(); ctx.arc(W - 20, cy, 13, 0, 6.283); ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "700 17px 'Atkinson Hyperlegible','Segoe UI',sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("!", W - 20, cy + 1);
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      }
    }
  }

  /* ---------- Cartel de meta ---------- */

  function dibujarMeta() {
    var sx = N * LEN + PX - 30 - dist;
    if (sx > W + 100 || sx < -120) return;
    var gy = suelo();
    ctx.fillStyle = "#6b4a2e";
    rr(sx - 78, gy - 150, 8, 150, 2); ctx.fill();
    rr(sx + 70, gy - 150, 8, 150, 2); ctx.fill();
    ctx.fillStyle = "#74acdf"; rr(sx - 88, gy - 156, 176, 28, 5); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.fillRect(sx - 88, gy - 149, 176, 14);
    ctx.fillStyle = "#123354";
    ctx.font = "700 17px 'Atkinson Hyperlegible','Segoe UI',sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("¡META!", sx, gy - 141);
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  }

  /* ---------- Luz de la hora del día ---------- */

  function tinte(E) {
    var a, c;
    if (E.p < 0.5) { a = (0.5 - E.p) / 0.5 * 0.2; c = "255,205,140"; }
    else { a = (E.p - 0.5) / 0.5 * 0.34; c = "255,130,105"; }
    if (a < 0.02) return;
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(" + c + "," + a.toFixed(3) + ")";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
  }

  /* ---------- Velocidad ---------- */

  function velocidad() { return 350 + reg * 40 + clamp((dist - reg * LEN) / LEN, 0, 1) * 25; }

  /* ---------- Entrada ---------- */

  function pulsar() { jinete.buffer = 0.13; }
  function agacharse() {
    if (jinete.y > 0.01) jinete.vy = Math.max(jinete.vy, 1100); // en el aire: cae más rápido
    jinete.duckT = 0.55;
  }
  function agachado() { return jinete.y <= 0.01 && (abajo || jinete.duckT > 0); }
  function esSalto(e) { return e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW"; }
  function esAbajo(e) { return e.code === "ArrowDown" || e.code === "KeyS"; }

  window.addEventListener("keydown", function (e) {
    if (esSalto(e)) {
      if (estado === "jugando") { e.preventDefault(); if (!e.repeat) pulsar(); }
    } else if (esAbajo(e)) {
      if (estado === "jugando") { e.preventDefault(); abajo = true; }
    } else if ((e.code === "KeyP" || e.code === "Escape") && !e.repeat) {
      if (estado === "jugando") pausar();
      else if (estado === "pausa") reanudar();
    }
  });
  window.addEventListener("keyup", function (e) { if (esAbajo(e)) abajo = false; });
  window.addEventListener("blur", function () { abajo = false; });

  // Táctil: un toque salta, deslizar hacia abajo agacha. Con mouse, un clic salta.
  var toque = null;
  el.stage.addEventListener("pointerdown", function (e) {
    if (e.target && e.target.closest && e.target.closest("button, a")) return;
    if (estado !== "jugando") return;
    e.preventDefault();
    if (e.pointerType === "mouse") { pulsar(); return; }
    toque = { id: e.pointerId, y: e.clientY, usado: false };
  });
  el.stage.addEventListener("pointermove", function (e) {
    if (!toque || toque.id !== e.pointerId || toque.usado) return;
    if (e.clientY - toque.y > 24) { toque.usado = true; agacharse(); }
  });
  function soltar(e) {
    if (!toque || toque.id !== e.pointerId) return;
    if (!toque.usado && e.type === "pointerup" && estado === "jugando") pulsar();
    toque = null;
  }
  el.stage.addEventListener("pointerup", soltar);
  el.stage.addEventListener("pointercancel", soltar);

  el.pausa.addEventListener("click", function () {
    el.pausa.blur();
    if (estado === "jugando") pausar();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && estado === "jugando") pausar();
  });
  window.addEventListener("resize", ajustar);

  /* ---------- Pantallas (tarjetas) ---------- */

  function mostrar(o) {
    el.etiqueta.textContent = o.etiqueta || "";
    el.etiqueta.hidden = !o.etiqueta;
    el.titulo.textContent = o.titulo;
    el.texto.textContent = o.texto;
    el.boton.textContent = o.boton || "";
    el.boton.hidden = !!o.vf;
    el.boton.onclick = o.accion || null;
    el.vf.hidden = !o.vf;
    if (o.vf) {
      el.vfV.onclick = function () { o.vf(true); };
      el.vfF.onclick = function () { o.vf(false); };
    }
    if (o.enlace) { el.enlace.textContent = o.enlace.texto; el.enlace.href = o.enlace.href; el.enlace.hidden = false; }
    else el.enlace.hidden = true;
    el.overlay.hidden = false;
    try { (o.vf ? el.vfV : el.boton).focus({ preventScroll: true }); } catch (err) { /* nada */ }
  }
  function ocultar() { el.overlay.hidden = true; }

  function pantallaInicio() {
    estado = "inicio";
    mostrar({
      etiqueta: "Juego",
      titulo: "Cruzá Argentina",
      texto: "Cabalgá de norte a sur por cinco paisajes del país. Saltá con la barra espaciadora o tocando la pantalla. Agachate con la flecha ↓ o deslizando el dedo hacia abajo para esquivar a los cóndores. Juntá soles de mayo y mates de escudo, y respondé verdadero o falso al final de cada región.",
      boton: "¡A cabalgar!",
      accion: empezar,
    });
  }

  function empezar() {
    reg = 0; dist = 0; tiempo = 0; soles = 0; solesInicio = 0; escudoInicio = false;
    reiniciarRegion();
  }

  function limpiarRegion() {
    obstaculos = []; monedas = []; particulas = []; fauna = []; rayas = [];
    decorA = []; decorB = []; sigDecA = -1e9; sigDecB = -1e9;
    viento.e = 0; viento.t = azar(3, 5); fauTimer = 2;
    jinete.y = 0; jinete.vy = 0; jinete.buffer = 0; jinete.invul = 0; jinete.coyote = 0; jinete.duckT = 0; jinete.ag = 0;
    sigObs = dist + 650;
  }

  function reiniciarRegion() {
    dist = reg * LEN;
    soles = solesInicio;
    vidas = VIDAS;
    limpiarRegion();
    jinete.escudo = escudoInicio;
    ocultar();
    estado = "jugando";
    actualizarHud(true);
  }

  function pausar() {
    estado = "pausa";
    mostrar({ titulo: "Pausa", texto: "Tomate un respiro. Cuando quieras, seguimos.", boton: "Continuar", accion: reanudar });
  }
  function reanudar() { ocultar(); estado = "jugando"; ultimo = 0; }

  function terminarRegion() {
    var r = REGIONES[reg];
    estado = "tarjeta";
    solesInicio = soles;
    abajo = false;
    mostrar({
      etiqueta: "Región " + (reg + 1) + " de " + N + " · " + r.lugar,
      titulo: r.nombre,
      texto: r.dato,
      boton: "Responder: ¿verdadero o falso?",
      accion: pregunta,
    });
  }

  function pregunta() {
    var r = REGIONES[reg];
    estado = "pregunta";
    mostrar({
      etiqueta: "Verdadero o falso · " + r.nombre,
      titulo: "¿Verdadero o falso?",
      texto: r.vf.texto,
      vf: responder,
    });
  }

  function responder(dijo) {
    var r = REGIONES[reg], ok = dijo === r.vf.v, ultima = reg === N - 1, extra = "";
    if (ok) {
      soles += 15; solesInicio = soles;
      extra = ultima ? " Ganás 15 soles de mayo." : " Ganás 15 soles de mayo y arrancás la próxima región con un mate de escudo.";
    }
    if (!ultima) extra += " Próxima parada: " + REGIONES[reg + 1].nombre + ".";
    actualizarHud(true);
    mostrar({
      etiqueta: r.nombre,
      titulo: ok ? "¡Correcto!" : "¡Casi!",
      texto: r.vf.exp + extra,
      boton: ultima ? "Ver mi resultado" : "Seguir cabalgando",
      accion: function () {
        if (ultima) { ganar(); return; }
        reg++;
        escudoInicio = ok;
        limpiarRegion();
        jinete.escudo = ok;
        ocultar();
        estado = "jugando";
        ultimo = 0;
        actualizarHud(true);
      },
    });
  }

  function perder() {
    estado = "perdido";
    jinete.invul = 0;
    abajo = false;
    mostrar({
      etiqueta: REGIONES[reg].nombre,
      titulo: "¡Te caíste del caballo!",
      texto: "Chocaste con demasiados obstáculos. No pasa nada: podés volver a intentar esta región.",
      boton: "Reintentar región",
      accion: reiniciarRegion,
    });
  }

  function ganar() {
    estado = "victoria";
    solesInicio = soles;
    mostrar({
      etiqueta: "¡Recorrido completo!",
      titulo: "¡Cruzaste Argentina!",
      texto: "Pasaste por Jujuy, la Pampa, Mendoza, la Patagonia y el glaciar Perito Moreno. Juntaste " + soles + " soles de mayo en " + formatoTiempo(tiempo) + ".",
      boton: "Jugar otra vez",
      accion: empezar,
      enlace: { texto: "Poné a prueba lo aprendido en la trivia", href: "trivia.html" },
    });
  }

  /* ---------- HUD ---------- */

  function formatoTiempo(s) {
    var m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  function construirRuta() {
    el.ruta.innerHTML = "";
    for (var i = 0; i < N; i++) {
      var li = document.createElement("li");
      li.textContent = REGIONES[i].corto;
      el.ruta.appendChild(li);
    }
  }

  function actualizarHud(forzar) {
    var clave = reg + "|" + soles + "|" + vidas + "|" + Math.floor(tiempo) + "|" + estado + "|" + jinete.escudo;
    if (!forzar && clave === hudCache) return;
    hudCache = clave;
    el.region.textContent = REGIONES[reg].nombre;
    el.soles.textContent = String(soles);
    el.vidas.textContent = new Array(vidas + 1).join("♥") + new Array(VIDAS - vidas + 1).join("♡");
    if (el.mate) el.mate.textContent = jinete.escudo ? "Sí" : "No";
    el.tiempo.textContent = formatoTiempo(tiempo);
    var items = el.ruta.children;
    for (var i = 0; i < items.length; i++) {
      items[i].className = i < reg ? "is-done" : i === reg ? "is-now" : "";
    }
  }

  /* ---------- Actualización ---------- */

  function actualizar(dt) {
    var gy = suelo(), i, o, sx;
    if (estado === "inicio") {
      dist += 70 * dt;
      actualizarFauna(dt, 70);
      return;
    }
    if (estado !== "jugando") return;

    tiempo += dt;
    var vel = velocidad();
    dist += vel * dt;
    actualizarViento(dt);
    actualizarFauna(dt, vel);

    // salto (con viento, la gravedad es menor: se flota más tiempo)
    var grav = viento.e === 2 ? GRAV * 0.6 : GRAV;
    var enSuelo = jinete.y <= 0.01 && jinete.vy >= 0;
    jinete.coyote = enSuelo ? 0.08 : Math.max(0, jinete.coyote - dt);
    jinete.buffer = Math.max(0, jinete.buffer - dt);
    if (jinete.buffer > 0 && (enSuelo || jinete.coyote > 0)) {
      jinete.vy = -SALTO; jinete.buffer = 0; jinete.coyote = 0; jinete.duckT = 0; enSuelo = false;
      chispas(PX - 6, gy, 5, "rgba(255,255,255,0.8)");
    }
    if (abajo && jinete.y > 0.01) jinete.vy = Math.max(jinete.vy, 1100);
    jinete.vy += grav * dt;
    jinete.y -= jinete.vy * dt;
    if (jinete.y <= 0) {
      if (jinete.y < -0.01 && jinete.vy > 300) chispas(PX - 6, gy, 4, "rgba(255,255,255,0.7)");
      jinete.y = 0; jinete.vy = 0;
    }
    jinete.invul = Math.max(0, jinete.invul - dt);
    jinete.duckT = Math.max(0, jinete.duckT - dt);
    jinete.ag += ((agachado() ? 1 : 0) - jinete.ag) * Math.min(1, dt * 18);
    sacudida = Math.max(0, sacudida - dt);

    // polvo al galopar
    if (jinete.y <= 0.01 && !agachado()) {
      jinete.polvo -= dt;
      if (jinete.polvo <= 0) { polvo(estiloActual); jinete.polvo = 0.07; }
    }

    generar();

    // obstáculos: movimiento propio, caída de carámbanos y choques
    var iz = PX - 20, de = PX + 28;
    var pie = gy - jinete.y;
    var cabeza = pie - (jinete.ag > 0.5 ? ALTO_AGACHADO : ALTO_PIE);
    for (i = obstaculos.length - 1; i >= 0; i--) {
      o = obstaculos[i];
      if (o.vx) o.x -= o.vx * dt;
      if (o.tipo === "rodante") o.rot += dt * 7;
      sx = o.x - dist + PX;
      if (sx < -140) { obstaculos.splice(i, 1); continue; }
      if (o.tipo === "carambano") {
        if (!o.cae && sx < PX + 360) o.cae = true;
        if (o.cae && o.y0 > 0) {
          o.y0 = Math.max(0, o.y0 - 760 * dt);
          if (o.y0 === 0) chispas(sx, gy, 8, "rgba(190,230,250,0.95)");
        }
      }
      if (jinete.invul > 0) continue;
      var ol = sx - o.w / 2 + 5, or = sx + o.w / 2 - 5;
      var ob = gy - o.y0, ot = ob - o.h + 4;
      if (de > ol && iz < or && pie > ot && cabeza < ob) {
        jinete.invul = jinete.escudo ? 1.0 : 1.4;
        if (jinete.escudo) {
          jinete.escudo = false;
          chispas(PX + 8, gy - 54, 14, "rgba(150,215,255,0.95)");
        } else {
          vidas--;
          sacudida = 0.25;
          chispas(PX + 10, gy - 30, 10, "rgba(193,58,47,0.9)");
          if (vidas <= 0) { actualizarHud(true); perder(); return; }
        }
        actualizarHud(true);
      }
    }

    // soles y mates
    var bx = PX + 6, by = pie - (jinete.ag > 0.5 ? 34 : 46);
    for (i = monedas.length - 1; i >= 0; i--) {
      var m = monedas[i];
      var mx = m.x - dist + PX, my = gy - m.y;
      if (mx < -60) { monedas.splice(i, 1); continue; }
      if (!m.tomada && Math.abs(mx - bx) < 40 && Math.abs(my - by) < 40) {
        m.tomada = true;
        if (m.tipo === "mate") {
          if (jinete.escudo) soles += 5; else jinete.escudo = true;
          chispas(mx, my, 10, "rgba(255,255,255,0.95)");
        } else {
          soles++;
          chispas(mx, my, 8, "#ffd75a");
        }
        monedas.splice(i, 1);
        actualizarHud(true);
      }
    }

    // fin de región
    if (dist >= (reg + 1) * LEN) {
      dist = (reg + 1) * LEN;
      actualizarHud(true);
      if (reg === N - 1) { estado = "pregunta"; pregunta(); } else terminarRegion();
      return;
    }
    actualizarHud(false);
  }

  /* ---------- Dibujo ---------- */

  var estiloActual = calcularEstilo();

  function dibujar(dt) {
    estiloActual = calcularEstilo();
    var E = estiloActual, gy = suelo();
    ctx.setTransform(K, 0, 0, K, 0, 0);
    if (sacudida > 0 && !reducido) ctx.translate(azar(-3, 3), azar(-3, 3));

    cielo(E);
    dibujarNubes();
    fondo(E);
    actualizarDecor(decorB, 0.55, "B", 150, 330);
    actualizarDecor(decorA, 0.8, "A", 130, 300);
    dibujarDecor(decorB, 0.55, 0.6, gy - 18, 0.6);
    dibujarFauna();
    dibujarDecor(decorA, 0.8, 0.85, gy - 6, 0.72);
    suelos(E);
    dibujarSombra();

    var i, o, sx;
    for (i = 0; i < obstaculos.length; i++) {
      o = obstaculos[i];
      sx = o.x - dist + PX;
      if (sx < -80 || sx > W + 80) continue;
      dibujarObstaculo(o, sx, gy);
    }
    for (i = 0; i < monedas.length; i++) {
      var m = monedas[i];
      if (m.tipo === "mate") dibujarMate(m.x - dist + PX, gy - m.y, animT);
      else dibujarSol(m.x - dist + PX, gy - m.y, animT, m.fase);
    }
    dibujarMeta();

    var parpadeo = jinete.invul > 0 && !jinete.escudo && Math.floor(jinete.invul * 12) % 2 === 0;
    if (!parpadeo) dibujarJinete(animT);
    dibujarEscudo();
    dibujarParticulas(dt);
    dibujarViento();
    dibujarAvisos();
    tinte(E);
  }

  /* ---------- Bucle ---------- */

  function bucle(ts) {
    if (!ultimo) ultimo = ts;
    var dt = clamp((ts - ultimo) / 1000, 0, 0.05);
    ultimo = ts;
    if (estado === "inicio" || estado === "jugando") animT += dt;
    actualizar(dt);
    dibujar(estado === "jugando" || estado === "inicio" ? dt : 0);
    window.requestAnimationFrame(bucle);
  }

  /* ---------- Arranque ---------- */

  for (var n = 0; n < 6; n++) nubes.push({ x: n * (W / 5) + hash(n) * 120, y: 0.12 + hash(n + 4) * 0.8, s: 0.7 + hash(n + 8) * 0.7 });
  construirRuta();
  ajustar();
  actualizarHud(true);
  pantallaInicio();
  window.requestAnimationFrame(bucle);
})();