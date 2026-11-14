/* Cruzá Argentina · cabalgata por cinco regiones del país
   Un gaucho a caballo cruza el país de norte a sur. Se salta con la barra
   espaciadora, la flecha ↑ o tocando la pantalla.

   - Cada región dura LEN píxeles del mundo (unos 20 segundos) y al terminarla
     aparece una tarjeta con un dato.
   - 3 vidas por región. Si se acaban, se reintenta solo esa región.
   - Para cambiar textos o datos, editá REGIONES (justo debajo).
   - Todo se dibuja con código (canvas): no usa imágenes, no hay créditos que poner. */
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
    pausa: $("cruza-pausa"),
    region: $("cruza-region"),
    soles: $("cruza-soles"),
    vidas: $("cruza-vidas"),
    tiempo: $("cruza-tiempo"),
    ruta: $("cruza-ruta"),
  };

  /* ---------- Datos de las regiones ---------- */

  var REGIONES = [
    {
      nombre: "Quebrada de Humahuaca", lugar: "Jujuy", corto: "Jujuy",
      dato: "La Quebrada de Humahuaca, en Jujuy, es Patrimonio de la Humanidad de la UNESCO desde 2003. Sus cerros muestran capas de colores, como el Cerro de los Siete Colores de Purmamarca.",
      decor: ["cardon", "mata"], obst: ["cardon", "roca"],
      pal: { cieloA: [92, 158, 226], cieloB: [252, 226, 188], lejos: [150, 100, 132], medA: [236, 176, 96], medB: [208, 100, 72], medC: [146, 92, 142], suelo: [200, 132, 88], suelo2: [226, 166, 108], sol: [255, 236, 170] },
      par: { lejosAmp: 70, lejosPico: 0.2, nieve: 0, medAmp: 46, medPico: 0 },
    },
    {
      nombre: "La Pampa", lugar: "Buenos Aires", corto: "Pampa",
      dato: "La llanura pampeana tiene suelos muy fértiles y es una de las zonas agrícolas y ganaderas más importantes del país. Allí vivió el gaucho, jinete símbolo de la cultura argentina.",
      decor: ["ombu", "poste", "mata"], obst: ["tranquera", "mata"],
      pal: { cieloA: [96, 172, 236], cieloB: [222, 242, 252], lejos: [168, 200, 208], medA: [150, 200, 120], medB: [118, 178, 98], medC: [96, 152, 84], suelo: [92, 156, 80], suelo2: [130, 194, 96], sol: [255, 246, 200] },
      par: { lejosAmp: 18, lejosPico: 0, nieve: 0, medAmp: 22, medPico: 0 },
    },
    {
      nombre: "Aconcagua", lugar: "Mendoza", corto: "Mendoza",
      dato: "El cerro Aconcagua, en Mendoza, mide unos 6.960 metros: es la montaña más alta de América y de todo el hemisferio sur.",
      decor: ["parra", "mata"], obst: ["roca", "tronco"],
      pal: { cieloA: [66, 136, 218], cieloB: [196, 224, 250], lejos: [112, 128, 170], medA: [170, 140, 108], medB: [146, 116, 92], medC: [122, 98, 84], suelo: [150, 122, 92], suelo2: [180, 150, 110], sol: [255, 248, 220] },
      par: { lejosAmp: 150, lejosPico: 0.75, nieve: 1, medAmp: 50, medPico: 0.2 },
    },
    {
      nombre: "Patagonia", lugar: "Chubut", corto: "Patagonia",
      dato: "En Península Valdés (Chubut), Patrimonio de la Humanidad desde 1999, llegan cada año las ballenas francas australes para reproducirse.",
      decor: ["mata", "poste"], obst: ["mata", "roca", "tranquera"],
      pal: { cieloA: [118, 166, 214], cieloB: [240, 226, 198], lejos: [156, 152, 168], medA: [220, 190, 112], medB: [198, 162, 92], medC: [176, 140, 82], suelo: [190, 160, 98], suelo2: [216, 188, 120], sol: [255, 240, 190] },
      par: { lejosAmp: 56, lejosPico: 0.1, nieve: 0, medAmp: 30, medPico: 0 },
    },
    {
      nombre: "Glaciar Perito Moreno", lugar: "Santa Cruz", corto: "Glaciar",
      dato: "El glaciar Perito Moreno, cerca de El Calafate, está en el Parque Nacional Los Glaciares, Patrimonio de la Humanidad desde 1981. Su frente mide unos 5 km de ancho.",
      decor: ["lenga", "hielo"], obst: ["hielo", "roca"],
      pal: { cieloA: [126, 182, 232], cieloB: [228, 243, 253], lejos: [196, 214, 236], medA: [176, 228, 244], medB: [124, 198, 228], medC: [88, 166, 210], suelo: [226, 236, 244], suelo2: [250, 252, 255], sol: [255, 255, 255] },
      par: { lejosAmp: 100, lejosPico: 0.9, nieve: 0.9, medAmp: 70, medPico: 0.85 },
    },
  ];
  var N = REGIONES.length;

  var OBST = {
    cardon: { w: 24, h: 50 }, roca: { w: 44, h: 30 }, tranquera: { w: 58, h: 46 },
    mata: { w: 46, h: 32 }, hielo: { w: 40, h: 50 }, tronco: { w: 60, h: 26 },
  };

  /* ---------- Constantes y estado ---------- */

  var LEN = 9000;        // largo de cada región (px del mundo)
  var PX = 140;          // posición fija del jinete en pantalla
  var GRAV = 2400;       // gravedad (px/s²)
  var SALTO = 780;       // impulso del salto (px/s)
  var VIDAS = 3;
  var reducido = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var W = 800, H = 380, K = 1;
  var estado = "inicio";   // inicio | jugando | pausa | tarjeta | perdido | victoria
  var reg = 0;
  var dist = 0, tiempo = 0, animT = 0;
  var soles = 0, solesInicio = 0, vidas = VIDAS;
  var jinete = { y: 0, vy: 0, coyote: 0, buffer: 0, invul: 0, polvo: 0 };
  var obstaculos = [], monedas = [], particulas = [], decorA = [], decorB = [];
  var sigObs = 0, sigDecA = 0, sigDecB = 0;
  var sacudida = 0;
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

  /* ---------- Tamaño del lienzo ---------- */

  function ajustar() {
    var ancho = el.stage.clientWidth || 720;
    if (ancho < 560) { W = 480; H = 400; } else { W = 800; H = 380; }
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(ancho * (H / W) * dpr);
    K = canvas.width / W;
  }

  /* ---------- Estilo (colores) según la región ---------- */

  function calcularEstilo() {
    var a = REGIONES[reg], b = REGIONES[Math.min(reg + 1, N - 1)];
    var t = 0;
    if (reg < N - 1) t = suave(clamp(((dist - reg * LEN) / LEN - 0.88) / 0.12, 0, 1));
    var E = { t: t };
    var k;
    for (k in a.pal) E[k] = mix(a.pal[k], b.pal[k], t);
    for (k in a.par) E[k] = lerp(a.par[k], b.par[k], t);
    return E;
  }

  /* ---------- Fondo ---------- */

  function cielo(E) {
    var g = ctx.createLinearGradient(0, 0, 0, suelo());
    g.addColorStop(0, rgb(E.cieloA));
    g.addColorStop(1, rgb(E.cieloB));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // sol con resplandor
    var sx = W * 0.78, sy = H * 0.2;
    var r = ctx.createRadialGradient(sx, sy, 6, sx, sy, 90);
    r.addColorStop(0, rgb(E.sol, 0.9));
    r.addColorStop(1, rgb(E.sol, 0));
    ctx.fillStyle = r;
    ctx.fillRect(sx - 100, sy - 100, 200, 200);
    ctx.fillStyle = rgb(E.sol);
    ctx.beginPath(); ctx.arc(sx, sy, 24, 0, Math.PI * 2); ctx.fill();
  }

  function dibujarNubes() {
    ctx.fillStyle = "rgba(255,255,255,0.85)";
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
    // piedritas y matas de pasto que se mueven con el suelo
    ctx.fillStyle = rgb(oscuro(E.suelo, 0.7), 0.35);
    var paso = 64, i0 = Math.floor(dist / paso), i;
    for (i = i0 - 1; i < i0 + W / paso + 2; i++) {
      var x = i * paso - dist + hash(i) * 30;
      var y = gy + 14 + hash(i + 9) * (H - gy - 26);
      rr(x, y, 8 + hash(i + 3) * 10, 3, 1.5); ctx.fill();
    }
  }

  /* ---------- Decorado (no choca) ---------- */

  var DECOR = {
    cardon: function (E) {
      ctx.fillStyle = "#4f8a58";
      rr(-8, -76, 16, 76, 8); ctx.fill();
      rr(-24, -34, 18, 9, 4.5); ctx.fill();
      rr(-28, -58, 9, 33, 4.5); ctx.fill();
      rr(8, -26, 16, 8, 4); ctx.fill();
      rr(17, -46, 9, 28, 4.5); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-3, -70); ctx.lineTo(-3, -6); ctx.moveTo(3, -70); ctx.lineTo(3, -6); ctx.stroke();
    },
    mata: function (E) {
      ctx.fillStyle = "#8d9a58";
      elipse(0, -12, 22, 12); ctx.fill();
      elipse(-16, -8, 14, 9); ctx.fill();
      elipse(16, -8, 15, 10); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      elipse(-4, -17, 12, 5); ctx.fill();
    },
    ombu: function (E) {
      ctx.fillStyle = "#6b4a2e";
      poli([-16, 0, -7, -30, 7, -30, 16, 0]); ctx.fill();
      ctx.fillStyle = "#3f7a4c";
      elipse(0, -56, 42, 26); ctx.fill();
      elipse(-28, -44, 26, 17); ctx.fill();
      elipse(28, -44, 26, 17); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.14)";
      elipse(-8, -66, 24, 10); ctx.fill();
    },
    poste: function (E) {
      var i;
      ctx.strokeStyle = "rgba(60,40,30,0.7)"; ctx.lineWidth = 1.5;
      for (i = 0; i < 2; i++) {
        ctx.beginPath(); ctx.moveTo(-52, -34 + i * 12); ctx.lineTo(52, -34 + i * 12); ctx.stroke();
      }
      ctx.fillStyle = "#7a5636";
      for (i = -1; i <= 1; i++) { rr(i * 52 - 3, -42, 6, 42, 2); ctx.fill(); }
    },
    parra: function (E) {
      for (var i = -1; i <= 1; i++) {
        ctx.fillStyle = "#6b4a2e"; rr(i * 32 - 2, -34, 4, 34, 1.5); ctx.fill();
        ctx.fillStyle = "#6f9f46"; elipse(i * 32, -36, 15, 11); ctx.fill();
        ctx.fillStyle = "#8a4d8a"; ctx.beginPath(); ctx.arc(i * 32 + 4, -28, 3.2, 0, 6.283); ctx.arc(i * 32 - 3, -26, 3, 0, 6.283); ctx.fill();
      }
    },
    lenga: function (E) {
      ctx.fillStyle = "#5a3d28"; rr(-3, -12, 6, 12, 1); ctx.fill();
      ctx.fillStyle = "#2f6a52";
      poli([-22, -8, 0, -48, 22, -8]); ctx.fill();
      poli([-17, -30, 0, -64, 17, -30]); ctx.fill();
      poli([-12, -50, 0, -82, 12, -50]); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      poli([0, -82, -6, -68, 6, -68]); ctx.fill();
      poli([0, -64, -7, -50, 7, -50]); ctx.fill();
    },
    hielo: function (E) {
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

  function dibujarDecor(lista, par, esc, base, alfa, E) {
    var sc = dist * par;
    ctx.globalAlpha = alfa;
    for (var i = 0; i < lista.length; i++) {
      var d = lista[i];
      ctx.save();
      ctx.translate(d.x - sc, base);
      ctx.scale(esc, esc);
      DECOR[d.tipo](E);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- Obstáculos ---------- */

  var DIBUJO_OBST = {
    cardon: function () {
      ctx.fillStyle = "#3f7d4c"; rr(-6, -50, 12, 50, 6); ctx.fill();
      rr(-12, -26, 8, 7, 3.5); ctx.fill(); rr(-14, -42, 7, 22, 3.5); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.22)"; rr(-2, -46, 2, 40, 1); ctx.fill();
    },
    roca: function () {
      ctx.fillStyle = "#6f6a68";
      poli([-22, 0, -17, -20, -6, -30, 8, -28, 19, -17, 22, 0]); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      poli([-17, -20, -6, -30, 8, -28, 0, -18]); ctx.fill();
    },
    tranquera: function () {
      ctx.fillStyle = "#8a5d36";
      rr(-28, -46, 6, 46, 2); ctx.fill(); rr(22, -46, 6, 46, 2); ctx.fill();
      rr(-28, -42, 56, 6, 2); ctx.fill(); rr(-28, -26, 56, 6, 2); ctx.fill(); rr(-28, -10, 56, 6, 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.18)"; rr(-28, -42, 56, 2, 1); ctx.fill();
    },
    mata: function () {
      ctx.fillStyle = "#7d8a46";
      elipse(0, -14, 23, 14); ctx.fill(); elipse(-14, -10, 12, 9); ctx.fill(); elipse(15, -10, 13, 10); ctx.fill();
      ctx.strokeStyle = "#5a6430"; ctx.lineWidth = 1.5;
      for (var i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 6, -16); ctx.lineTo(i * 7, -30 + Math.abs(i) * 2); ctx.stroke(); }
    },
    hielo: function () {
      ctx.fillStyle = "#a6dcf0";
      poli([-20, 0, -12, -34, -4, -24, 4, -50, 13, -26, 20, 0]); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      poli([-4, -24, 4, -50, 8, -28]); ctx.fill();
    },
    tronco: function () {
      ctx.fillStyle = "#7b5132"; rr(-30, -26, 60, 26, 9); ctx.fill();
      ctx.fillStyle = "#c79a68"; elipse(-27, -13, 5, 12); ctx.fill();
      ctx.strokeStyle = "#7b5132"; ctx.lineWidth = 1.5; elipse(-27, -13, 2.5, 6); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.14)"; rr(-20, -23, 44, 4, 2); ctx.fill();
    },
  };

  function crearObstaculo(tipo, x) {
    var d = OBST[tipo];
    var o = { tipo: tipo, x: x, w: d.w, h: d.h };
    obstaculos.push(o);
    return o;
  }

  function crearMonedas(x, y, n, sep, arco) {
    for (var i = 0; i < n; i++) {
      var f = n === 1 ? 0 : i / (n - 1) * 2 - 1;
      monedas.push({ x: x + i * sep, y: y + (arco ? (1 - f * f) * arco : 0), tomada: false, fase: Math.random() * 6 });
    }
  }

  function generar() {
    var gapMinimo, o, o2, pares;
    while (sigObs - dist < W + 80) {
      if (sigObs > (reg + 1) * LEN - 700) {
        sigObs = reg === N - 1 ? Infinity : (reg + 1) * LEN + 650;
        break;
      }
      var vel = velocidad();
      o = crearObstaculo(elegir(REGIONES[reg].obst), sigObs);
      var fin = o.x + o.w;
      pares = reg >= 1 && Math.random() < 0.16;
      if (pares) {
        o2 = crearObstaculo(elegir(REGIONES[reg].obst), o.x + o.w + 40);
        fin = o2.x + o2.w;
      }
      // soles: en arco sobre el obstáculo o en fila a ras del suelo
      var centro = (o.x + fin) / 2;
      if (Math.random() < 0.5) crearMonedas(centro - 54, 64, 4, 36, 54);
      gapMinimo = 190 + vel * 0.45;
      var gap = gapMinimo + Math.random() * 230;
      if (Math.random() < 0.22) crearMonedas(fin + gap * 0.3, 38, 5, 32, 0);
      sigObs = fin + gap;
    }
  }

  /* ---------- Soles de Mayo (monedas) ---------- */

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

    ctx.save();
    ctx.translate(PX, gy);
    ctx.scale(0.8, 0.8);
    ctx.translate(0, rebote);

    // patas del lado lejano (más oscuras) y del lado cercano
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
    // crin
    ctx.strokeStyle = "#2b1a12"; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(16, -70); ctx.quadraticCurveTo(26 - cola * 0.2, -90, 38, -108); ctx.stroke();

    patas(cercanas, "#8c4f28");

    // pelego / montura
    ctx.fillStyle = "#c9a25f"; elipse(-2, -76, 19, 6); ctx.fill();
    ctx.fillStyle = "#e8e0d0"; elipse(-2, -78, 15, 3.2); ctx.fill();

    // gaucho: pierna de bombacha y bota
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
    // brazo y riendas
    ctx.strokeStyle = "#c13a2f"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(6, -110); ctx.lineTo(17, -97); ctx.stroke();
    ctx.strokeStyle = "rgba(30,20,15,0.8)"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(18, -97); ctx.lineTo(52, -92); ctx.stroke();

    ctx.restore();
  }

  function dibujarSombra() {
    var gy = suelo();
    var esc = 1 - Math.min(jinete.y / 260, 0.45);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    elipse(PX + 6, gy + 6, 44 * esc, 6 * esc); ctx.fill();
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

  /* ---------- Cartel de meta ---------- */

  function dibujarMeta() {
    var sx = N * LEN + PX - 30 - dist;
    if (sx > W + 100 || sx < -120) return;
    var gy = suelo();
    ctx.fillStyle = "#6b4a2e";
    rr(sx - 78, gy - 150, 8, 150, 2); ctx.fill();
    rr(sx + 70, gy - 150, 8, 150, 2); ctx.fill();
    // cartel celeste y blanco
    ctx.fillStyle = "#74acdf"; rr(sx - 88, gy - 156, 176, 28, 5); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.fillRect(sx - 88, gy - 149, 176, 14);
    ctx.fillStyle = "#123354";
    ctx.font = "700 17px 'Atkinson Hyperlegible','Segoe UI',sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("¡META!", sx, gy - 141);
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  }

  /* ---------- Velocidad y progreso ---------- */

  function velocidad() { return 350 + reg * 40 + clamp((dist - reg * LEN) / LEN, 0, 1) * 25; }

  /* ---------- Entrada ---------- */

  function pulsar() { jinete.buffer = 0.13; }
  function esSalto(e) { return e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW"; }

  window.addEventListener("keydown", function (e) {
    if (esSalto(e)) {
      if (estado === "jugando") { e.preventDefault(); if (!e.repeat) pulsar(); }
    } else if ((e.code === "KeyP" || e.code === "Escape") && !e.repeat) {
      if (estado === "jugando") pausar();
      else if (estado === "pausa") reanudar();
    }
  });
  el.stage.addEventListener("pointerdown", function (e) {
    if (e.target && e.target.closest && e.target.closest("button, a")) return;
    if (estado === "jugando") { e.preventDefault(); pulsar(); }
  });
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
    el.boton.textContent = o.boton;
    el.boton.onclick = o.accion;
    if (o.enlace) { el.enlace.textContent = o.enlace.texto; el.enlace.href = o.enlace.href; el.enlace.hidden = false; }
    else el.enlace.hidden = true;
    el.overlay.hidden = false;
    try { el.boton.focus({ preventScroll: true }); } catch (err) { /* nada */ }
  }
  function ocultar() { el.overlay.hidden = true; }

  function pantallaInicio() {
    estado = "inicio";
    mostrar({
      etiqueta: "Juego",
      titulo: "Cruzá Argentina",
      texto: "Cabalgá de norte a sur por cinco paisajes del país. Saltá los obstáculos con la barra espaciadora, la flecha ↑ o tocando la pantalla, juntá soles de mayo y descubrí un dato en cada región.",
      boton: "¡A cabalgar!",
      accion: empezar,
    });
  }

  function empezar() {
    reg = 0; dist = 0; tiempo = 0; soles = 0; solesInicio = 0;
    reiniciarRegion();
  }

  function reiniciarRegion() {
    dist = reg * LEN;
    soles = solesInicio;
    vidas = VIDAS;
    obstaculos = []; monedas = []; particulas = [];
    decorA = []; decorB = []; sigDecA = -1e9; sigDecB = -1e9;
    jinete.y = 0; jinete.vy = 0; jinete.buffer = 0; jinete.invul = 0; jinete.coyote = 0;
    sigObs = dist + 650;
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
    var sig = reg < N - 1 ? "Próxima parada: " + REGIONES[reg + 1].nombre + "." : "";
    mostrar({
      etiqueta: "Región " + (reg + 1) + " de " + N + " · " + r.lugar,
      titulo: r.nombre,
      texto: r.dato + (sig ? " " + sig : ""),
      boton: "Seguir cabalgando",
      accion: function () {
        reg++;
        obstaculos = []; monedas = [];
        sigObs = dist + 650;
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
    var clave = reg + "|" + soles + "|" + vidas + "|" + Math.floor(tiempo) + "|" + estado;
    if (!forzar && clave === hudCache) return;
    hudCache = clave;
    el.region.textContent = REGIONES[reg].nombre;
    el.soles.textContent = String(soles);
    el.vidas.textContent = new Array(vidas + 1).join("♥") + new Array(VIDAS - vidas + 1).join("♡");
    el.tiempo.textContent = formatoTiempo(tiempo);
    var items = el.ruta.children;
    for (var i = 0; i < items.length; i++) {
      items[i].className = i < reg ? "is-done" : i === reg ? "is-now" : "";
    }
  }

  /* ---------- Actualización ---------- */

  function actualizar(dt) {
    if (estado === "inicio") { dist += 70 * dt; return; }
    if (estado !== "jugando") return;

    tiempo += dt;
    var vel = velocidad();
    dist += vel * dt;
    var gy = suelo(), i;

    // salto
    var enSuelo = jinete.y <= 0.01 && jinete.vy >= 0;
    jinete.coyote = enSuelo ? 0.08 : Math.max(0, jinete.coyote - dt);
    jinete.buffer = Math.max(0, jinete.buffer - dt);
    if (jinete.buffer > 0 && (enSuelo || jinete.coyote > 0)) {
      jinete.vy = -SALTO; jinete.buffer = 0; jinete.coyote = 0; enSuelo = false;
      chispas(PX - 6, gy, 5, "rgba(255,255,255,0.8)");
    }
    jinete.vy += GRAV * dt;
    jinete.y -= jinete.vy * dt;
    if (jinete.y <= 0) {
      if (jinete.y < -0.01 && jinete.vy > 300) chispas(PX - 6, gy, 4, "rgba(255,255,255,0.7)");
      jinete.y = 0; jinete.vy = 0;
    }
    jinete.invul = Math.max(0, jinete.invul - dt);
    sacudida = Math.max(0, sacudida - dt);

    // polvo al galopar
    if (jinete.y <= 0.01) {
      jinete.polvo -= dt;
      if (jinete.polvo <= 0) { polvo(estiloActual); jinete.polvo = 0.07; }
    }

    generar();

    // colisiones con obstáculos
    var iz = PX - 20, de = PX + 28, ar = gy - jinete.y - 66, ab = gy - jinete.y;
    for (i = obstaculos.length - 1; i >= 0; i--) {
      var o = obstaculos[i];
      var sx = o.x - dist + PX;
      if (sx < -120) { obstaculos.splice(i, 1); continue; }
      if (jinete.invul > 0) continue;
      var ol = sx - o.w / 2 + 4, or = sx + o.w / 2 - 4, ot = gy - o.h + 4;
      if (de > ol && iz < or && ab > ot && ar < gy) {
        vidas--;
        jinete.invul = 1.4;
        sacudida = 0.25;
        chispas(PX + 10, gy - 30, 10, "rgba(193,58,47,0.9)");
        if (vidas <= 0) { actualizarHud(true); perder(); return; }
      }
    }

    // soles
    var bx = PX + 6, by = gy - jinete.y - 46;
    for (i = monedas.length - 1; i >= 0; i--) {
      var m = monedas[i];
      var mx = m.x - dist + PX, my = gy - m.y;
      if (mx < -60) { monedas.splice(i, 1); continue; }
      if (!m.tomada && Math.abs(mx - bx) < 40 && Math.abs(my - by) < 40) {
        m.tomada = true;
        soles++;
        chispas(mx, my, 8, "#ffd75a");
        monedas.splice(i, 1);
      }
    }

    // fin de región
    if (dist >= (reg + 1) * LEN) {
      dist = (reg + 1) * LEN;
      actualizarHud(true);
      if (reg === N - 1) ganar(); else terminarRegion();
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
    dibujarDecor(decorB, 0.55, 0.6, gy - 18, 0.85, E);
    dibujarDecor(decorA, 0.8, 0.85, gy - 6, 0.95, E);
    suelos(E);
    dibujarSombra();

    var i, o, sx;
    for (i = 0; i < obstaculos.length; i++) {
      o = obstaculos[i];
      sx = o.x - dist + PX;
      ctx.save(); ctx.translate(sx, gy); DIBUJO_OBST[o.tipo](); ctx.restore();
    }
    for (i = 0; i < monedas.length; i++) {
      var m = monedas[i];
      dibujarSol(m.x - dist + PX, gy - m.y, animT, m.fase);
    }
    dibujarMeta();

    var parpadeo = jinete.invul > 0 && Math.floor(jinete.invul * 12) % 2 === 0;
    if (!parpadeo) dibujarJinete(animT);
    dibujarParticulas(dt);
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