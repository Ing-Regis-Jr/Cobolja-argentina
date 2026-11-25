/* Armá tu empanada — juego de cocina dibujado 100 % con código (sin imágenes ni sonido).
   Sigue la receta real de la página "Arte culinario": masa, relleno, armado (repulgue) y horno. */
(function () {
  "use strict";

  var cv = document.getElementById("emp-canvas");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");
  var stage = document.getElementById("emp-stage");
  function $(id) { return document.getElementById(id); }
  var ovEl = $("emp-overlay"), ovEt = $("emp-ov-etiqueta"), ovTi = $("emp-ov-titulo"),
    ovTx = $("emp-ov-texto"), ovBt = $("emp-ov-boton"), ovEn = $("emp-ov-enlace");
  var elCons = $("emp-consigna"), elPasos = $("emp-pasos"), elErr = $("emp-errores"), elMsg = $("emp-mensaje");

  /* ---------- utilidades ---------- */
  var PI = Math.PI, TAU = PI * 2;
  function cl(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function eo(t) { t = cl(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
  function ob(t) { t = cl(t, 0, 1); var c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  function rr(a, b) { return a + Math.random() * (b - a); }
  function mezcla(a, b, t) { t = cl(t, 0, 1); return "rgb(" + Math.round(lerp(a[0], b[0], t)) + "," + Math.round(lerp(a[1], b[1], t)) + "," + Math.round(lerp(a[2], b[2], t)) + ")"; }
  function rect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function ell(x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(rx, 0.01), Math.max(ry, 0.01), 0, 0, TAU); }
  function txt(s, x, y, size, col, al, peso) {
    ctx.font = (peso || "bold") + " " + size + "px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = col; ctx.textAlign = al || "center"; ctx.textBaseline = "middle";
    ctx.fillText(s, x, y);
  }

  /* ---------- datos de la receta ---------- */
  var ITEMS = {
    harina: { n: "Harina", c: "#fffdf3", ok: "Harina de trigo: la base de la masa." },
    sal: { n: "Sal", c: "#e6ebf0", ok: "Una cucharadita de sal en la masa." },
    grasa: { n: "Grasa", c: "#f7d44a", ok: "La grasa derretida hace la masa suave." },
    agua: { n: "Agua tibia", c: "#8ec9f0", ok: "Agua tibia, agregada de a poco." },
    cebolla: { n: "Cebolla", c: "#f0d9a0", ok: "La cebolla se cocina con un poco de grasa." },
    comino: { n: "Comino", c: "#a8742f", ok: "El comino le da el sabor tradicional." },
    pimenton: { n: "Pimentón", c: "#c8321e", ok: "Pimentón para color y sabor." },
    salpim: { n: "Sal y pimienta", c: "#4a4a4a", ok: "Sal y pimienta a gusto." },
    huevo: { n: "Huevo duro", c: "#ffe58a", ok: "Los huevos duros se agregan picados, con el relleno frío." },
    cebollita: { n: "Cebollita", c: "#5fae3d", ok: "Cebollita verde fresca para terminar el relleno." },
    aji: { n: "Ají molido", c: "#d4331f", ok: "El ají molido le da el picante." },
    azucar: { n: "Azúcar", mal: "La masa y el relleno de la empanada tucumana no llevan azúcar." },
    chocolate: { n: "Chocolate", mal: "El chocolate no va en una empanada de carne." },
    banana: { n: "Banana", mal: "La banana no forma parte de la receta tucumana." },
    anana: { n: "Ananá", mal: "El ananá no forma parte de la receta tucumana." },
    queso: { n: "Queso", mal: "La empanada tucumana tradicional lleva carne, cebolla, huevo y condimentos, no queso." }
  };

  var FASES = [
    { id: "masa", cons: "Poné en el bol lo que lleva la masa. Arrastrá o tocá los ingredientes.", dest: "bol",
      sirven: ["harina", "sal", "grasa", "agua"], extra: ["azucar", "chocolate", "banana"] },
    { id: "amasar", cons: "¡A amasar! Tocá la masa varias veces hasta que quede suave.", tap: "bol", n: 12 },
    { id: "corte", cons: "La carne se corta a cuchillo. Tocá la tabla para cortar.", tap: "tabla", n: 9 },
    { id: "relleno", cons: "Cociná la cebolla con la carne y condimentá la sartén.", dest: "sarten",
      sirven: ["cebolla", "comino", "pimenton", "salpim"], extra: ["anana", "queso"] },
    { id: "enfriar", cons: "El relleno tiene que enfriarse. Tocá la sartén para soplar.", tap: "sarten", n: 8 },
    { id: "relleno2", cons: "Con el relleno frío, agregá los huevos duros y la cebollita verde.", dest: "sarten",
      sirven: ["huevo", "cebollita"], extra: ["chocolate", "banana", "azucar"] },
    { id: "armar", cons: "" },
    { id: "horno", cons: "Precalentá el horno a 200–220 °C y mantené la temperatura en la zona verde." },
    { id: "fin", cons: "" }
  ];
  var PASO = {
    masa: [1, "La masa"], amasar: [1, "La masa"], corte: [2, "El relleno"], relleno: [2, "El relleno"],
    enfriar: [2, "El relleno"], relleno2: [2, "El relleno"], armar: [3, "El armado"], horno: [4, "Al horno"]
  };
  var N_PUNTOS = 7, N_EMP = 3, DUR_HORNO = 18;

  /* Armado: el cliente pide con lenguaje común y el relleno se arma con ingredientes sueltos.
     r = [cebolla, huevo, ají]. La tradicional tucumana lleva cebolla y huevo, sin ají. */
  var ING_ARMAR = ["cebolla", "huevo", "aji"];
  var PEDIDOS = [
    [ { t: "Dame la tradicional tucumana.", r: [1, 1, 0] },
      { t: "Una de las de siempre, por favor.", r: [1, 1, 0] },
      { t: "Quiero la que pica.", r: [1, 1, 1] } ],
    [ { t: "No me gusta la cebolla.", r: [0, 1, 0] },
      { t: "Sin huevo, por favor.", r: [1, 0, 0] },
      { t: "La que pica, y bien cargada de cebolla.", r: [1, 1, 1] } ],
    [ { t: "Picante y sin cebolla.", r: [0, 1, 1] },
      { t: "Sin huevo y que pique.", r: [1, 0, 1] },
      { t: "Sin cebolla ni huevo, pero con algo que pique.", r: [0, 0, 1] } ]
  ];
  /* Cuchara: poco = sosa, zona verde = justo, mucho = se revienta al cerrar */
  var GAUGE = { lo: 0.5, hi: 0.8, rate: 0.5 };

  /* ---------- estado ---------- */
  var W = 800, H = 480, K = 1, MOVIL = false, TY = 205;
  var tgt = { x: 400, y: 275, r: 112 };
  var estado = "intro"; // intro | jugando | fin
  var fi = 0, fase = FASES[0];
  var items = [], drag = null, parts = [], temporizadores = [];
  var T = 0, sac = 0, pulso = 0, tapN = 0, errores = 0, banner = null, msgT = 0;
  var contenido = { bol: [], sarten: [] };
  var masaListo = false, piezas = [];
  var emps = [], empI = 0, bandeja = [];
  var horno = { temp: 100, t: 0, on: false, hold: false, zona: 0, coc: 0, fin: false };
  var res = { estrellas: 3, coc: 1 };

  /* ---------- tamaño / disposición ---------- */
  function medir() {
    var w = (stage && stage.clientWidth) || 800;
    MOVIL = w < 560;
    W = MOVIL ? 380 : 800;
    H = MOVIL ? 560 : 480;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(w * dpr * H / W);
    cv.style.height = Math.round(w * H / W) + "px";
    K = cv.width / W;
    TY = MOVIL ? 165 : 205;
    tgt = MOVIL ? { x: W / 2, y: 270, r: 90 } : { x: W / 2, y: 275, r: 112 };
    colocar();
  }
  function colocar() {
    var n = items.length;
    var cols = MOVIL ? 4 : Math.max(n, 1);
    var filas = Math.ceil(n / cols);
    for (var i = 0; i < n; i++) {
      var col = i % cols, fila = Math.floor(i / cols);
      var rc = Math.min(cols, n - fila * cols);
      var it = items[i];
      it.hx = W / 2 + (col - (rc - 1) / 2) * (MOVIL ? 90 : 98);
      it.hy = H - (MOVIL ? 54 : 56) - (filas - 1 - fila) * 92;
      if (it.estado === "shelf") { it.x = it.hx; it.y = it.hy; }
    }
  }

  /* ---------- interfaz DOM ---------- */
  function mostrarOv(et, ti, tx, bt, fn, enlace) {
    ovEt.textContent = et; ovTi.textContent = ti; ovTx.textContent = tx; ovBt.textContent = bt;
    ovBt.onclick = fn;
    if (enlace) { ovEn.hidden = false; ovEn.textContent = enlace; } else { ovEn.hidden = true; }
    ovEl.hidden = false;
    try { ovBt.focus(); } catch (e) { /* nada */ }
  }
  function ocultarOv() { ovEl.hidden = true; }
  function mensaje(s, tipo) {
    elMsg.textContent = s; elMsg.className = "emp-mensaje " + (tipo || ""); msgT = 4;
  }
  function setErrores() { elErr.textContent = "Errores: " + errores; }
  function despues(seg, fn) { temporizadores.push({ t: seg, fn: fn }); }

  /* ---------- partículas ---------- */
  function chispas(x, y, col, n, vel) {
    for (var i = 0; i < n; i++) {
      var a = rr(0, TAU), v = rr(0.3, 1) * (vel || 160);
      parts.push({ k: "p", x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, g: 420, life: rr(0.4, 0.8), max: 0.8, c: col, r: rr(2, 4.5) });
    }
  }
  function vapor(x, y, n) {
    for (var i = 0; i < n; i++) {
      parts.push({ k: "v", x: x + rr(-30, 30), y: y, vx: rr(-8, 8), vy: rr(-40, -22), life: rr(1, 1.8), max: 1.8, c: "#fff", r: rr(8, 14) });
    }
  }
  function flotante(x, y, s, col) {
    parts.push({ k: "t", x: x, y: y, vx: 0, vy: -50, life: 1.1, max: 1.1, c: col, s: s, r: 0 });
  }
  function confeti(n) {
    var cols = ["#74acdf", "#ffffff", "#f6b40e", "#ff7a59", "#7ed957"];
    for (var i = 0; i < n; i++) {
      parts.push({ k: "c", x: rr(0, W), y: rr(-H, -10), vx: rr(-30, 30), vy: rr(90, 190), g: 0, life: 5, max: 5, c: cols[i % cols.length], r: rr(4, 8), a: rr(0, TAU), va: rr(-6, 6) });
    }
  }

  /* ---------- dibujo: escena ---------- */
  function fondo() {
    var g = ctx.createLinearGradient(0, 0, 0, TY);
    g.addColorStop(0, "#fcf1dc"); g.addColorStop(1, "#f1d9b2");
    ctx.fillStyle = g; ctx.fillRect(-10, -10, W + 20, TY + 14);
    ctx.strokeStyle = "rgba(150,110,60,.12)"; ctx.lineWidth = 1;
    for (var x = 0; x < W; x += 44) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, TY); ctx.stroke(); }
    for (var y = 40; y < TY; y += 44) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // ventana con sol
    var wx = MOVIL ? 18 : 60, wy = MOVIL ? 20 : 26, ww = MOVIL ? 104 : 160, wh = MOVIL ? 84 : 112;
    var sk = ctx.createLinearGradient(0, wy, 0, wy + wh);
    sk.addColorStop(0, "#8fd0f7"); sk.addColorStop(1, "#d6f0ff");
    ctx.fillStyle = sk; rect(wx, wy, ww, wh, 8); ctx.fill();
    ctx.save(); rect(wx, wy, ww, wh, 8); ctx.clip();
    var sx = wx + ww / 2, sy = wy + wh * 0.5, sr = wh * 0.2;
    ctx.strokeStyle = "#f6b40e"; ctx.lineWidth = 3;
    for (var i = 0; i < 16; i++) {
      var a = T * 0.3 + i * TAU / 16;
      ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * sr * 1.25, sy + Math.sin(a) * sr * 1.25);
      ctx.lineTo(sx + Math.cos(a) * sr * (i % 2 ? 1.7 : 2.0), sy + Math.sin(a) * sr * (i % 2 ? 1.7 : 2.0)); ctx.stroke();
    }
    ctx.fillStyle = "#f6b40e"; ell(sx, sy, sr, sr); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 6; rect(wx, wy, ww, wh, 8); ctx.stroke();
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
    // estante con frascos
    var ex = MOVIL ? W - 150 : W - 280, ey = wy + 76, ew = MOVIL ? 132 : 230;
    ctx.fillStyle = "#b57a43"; rect(ex, ey, ew, 8, 3); ctx.fill();
    var fr = ["#c8321e", "#e0a82e", "#7aa84a", "#a8742f", "#f2e7c9", "#c8321e"];
    var nf = MOVIL ? 4 : 6;
    for (var j = 0; j < nf; j++) {
      var fx = ex + 8 + j * (ew - 16) / nf;
      ctx.fillStyle = "rgba(255,255,255,.75)"; rect(fx, ey - 38, 22, 38, 5); ctx.fill();
      ctx.fillStyle = fr[j]; rect(fx + 2, ey - 26, 18, 24, 4); ctx.fill();
      ctx.fillStyle = "#8d949c"; rect(fx - 1, ey - 44, 24, 8, 3); ctx.fill();
    }
  }
  function mesa() {
    var g = ctx.createLinearGradient(0, TY, 0, H);
    g.addColorStop(0, "#a9d4f3"); g.addColorStop(1, "#86bde6");
    ctx.fillStyle = g; ctx.fillRect(-10, TY, W + 20, H - TY + 10);
    ctx.fillStyle = "rgba(255,255,255,.45)";
    for (var x = -20; x < W + 20; x += 52) ctx.fillRect(x, TY, 26, H - TY);
    ctx.fillStyle = "#b57a43"; ctx.fillRect(-10, TY - 4, W + 20, 12);
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(-10, TY - 4, W + 20, 3);
  }

  /* ---------- dibujo: ingredientes ---------- */
  function bolsa(c, borde, marca) {
    ctx.fillStyle = c; ctx.strokeStyle = borde; ctx.lineWidth = 2;
    rect(-17, -18, 34, 42, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = borde; rect(-17, -22, 34, 9, 3); ctx.fill();
    ctx.fillStyle = marca; ell(0, 6, 9, 9); ctx.fill();
  }
  function frasco(cont, tapa) {
    ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.strokeStyle = "#9aa5b1"; ctx.lineWidth = 2;
    rect(-14, -16, 28, 40, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = cont; rect(-12, -4, 24, 26, 5); ctx.fill();
    ctx.fillStyle = tapa; rect(-15, -24, 30, 10, 3); ctx.fill();
  }
  function icono(id, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.lineWidth = 2;
    switch (id) {
      case "harina":
        bolsa("#fbf4de", "#d9c9a0", "#e0b84c");
        ctx.strokeStyle = "#8a6a1a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 14); ctx.lineTo(0, -2); ctx.stroke();
        ctx.fillStyle = "#8a6a1a";
        for (var q = 0; q < 3; q++) { ell(-3, 8 - q * 5, 2.5, 1.6); ctx.fill(); ell(3, 8 - q * 5, 2.5, 1.6); ctx.fill(); }
        break;
      case "azucar":
        bolsa("#ffffff", "#c9d5e0", "#7cc3f0");
        ctx.fillStyle = "#fff"; rect(-5, 1, 10, 10, 2); ctx.fill();
        break;
      case "sal":
        frasco("#ffffff", "#9aa5b1");
        ctx.fillStyle = "#6b7684"; for (var a = -1; a <= 1; a++) { ell(a * 6, -19, 1.4, 1.4); ctx.fill(); }
        break;
      case "salpim":
        frasco("#3f3f3f", "#9aa5b1");
        ctx.fillStyle = "#6b7684"; for (var b = -1; b <= 1; b++) { ell(b * 6, -19, 1.4, 1.4); ctx.fill(); }
        break;
      case "comino": frasco("#a8742f", "#7a5a2e"); break;
      case "pimenton": frasco("#c8321e", "#7a2a1e"); break;
      case "grasa":
        ctx.fillStyle = "#f8dc5c"; ctx.strokeStyle = "#d9b53a"; rect(-21, -10, 42, 28, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#fff4a8"; rect(-21, -10, 42, 8, 5); ctx.fill();
        ctx.fillStyle = "#ffffff"; ctx.fillRect(-6, -10, 12, 28);
        break;
      case "agua":
        ctx.fillStyle = "#8ec9f0"; ctx.strokeStyle = "#5aa6d4"; rect(-14, -16, 28, 38, 9); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#5aa6d4"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(14, 2, 9, -PI / 2, PI / 2); ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.55)"; rect(-9, -10, 6, 24, 3); ctx.fill();
        break;
      case "chocolate":
        ctx.fillStyle = "#6b3a24"; ctx.strokeStyle = "#4a2616"; rect(-18, -20, 36, 42, 5); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#8a5238"; ctx.lineWidth = 2;
        for (var u = -6; u <= 6; u += 12) { ctx.beginPath(); ctx.moveTo(u, -18); ctx.lineTo(u, 20); ctx.stroke(); }
        for (var v = -6; v <= 8; v += 13) { ctx.beginPath(); ctx.moveTo(-16, v); ctx.lineTo(16, v); ctx.stroke(); }
        break;
      case "banana":
        ctx.strokeStyle = "#f6d640"; ctx.lineWidth = 13; ctx.lineCap = "round";
        ctx.beginPath(); ctx.arc(0, -8, 20, 0.15 * PI, 0.85 * PI); ctx.stroke();
        ctx.strokeStyle = "#7a5a2e"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-19, 4); ctx.lineTo(-21, 0); ctx.stroke();
        ctx.lineCap = "butt";
        break;
      case "cebolla":
        ctx.fillStyle = "#c78bb6"; ctx.strokeStyle = "#9a5f8a"; ell(0, 5, 18, 17); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(-5, -22); ctx.lineTo(5, -22); ctx.closePath(); ctx.fillStyle = "#c78bb6"; ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#a86f98"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 5, 12, 0.6 * PI, 1.4 * PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 5, 8, 0.2 * PI, 0.9 * PI); ctx.stroke();
        break;
      case "huevo":
        ctx.fillStyle = "#fffaf0"; ctx.strokeStyle = "#e2d7bd"; ell(0, 2, 14, 18); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.8)"; ell(-5, -4, 3, 5); ctx.fill();
        break;
      case "cebollita":
        ctx.lineCap = "round"; ctx.lineWidth = 6;
        var tallos = [[-7, -18], [0, -22], [7, -18]];
        for (var t = 0; t < 3; t++) {
          ctx.strokeStyle = "#58a83b"; ctx.beginPath(); ctx.moveTo(tallos[t][0] * 0.4, 6); ctx.lineTo(tallos[t][0], tallos[t][1]); ctx.stroke();
          ctx.strokeStyle = "#f1f6e8"; ctx.beginPath(); ctx.moveTo(tallos[t][0] * 0.25, 20); ctx.lineTo(tallos[t][0] * 0.4, 6); ctx.stroke();
        }
        ctx.lineCap = "butt";
        break;
      case "anana":
        ctx.fillStyle = "#f3c63a"; ctx.strokeStyle = "#c99a1a"; ell(0, 6, 14, 18); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "#c99a1a"; ctx.lineWidth = 1.5;
        for (var k = -8; k <= 8; k += 8) { ctx.beginPath(); ctx.moveTo(k, -8); ctx.lineTo(k + 6, 20); ctx.stroke(); }
        ctx.fillStyle = "#4fa03a";
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(-9, -24); ctx.lineTo(-2, -16); ctx.lineTo(0, -28); ctx.lineTo(2, -16); ctx.lineTo(9, -24); ctx.closePath(); ctx.fill();
        break;
      case "aji":
        ctx.lineCap = "round";
        ctx.strokeStyle = "#c8321e"; ctx.lineWidth = 13;
        ctx.beginPath(); ctx.moveTo(-14, -14); ctx.quadraticCurveTo(12, -14, 13, 8); ctx.quadraticCurveTo(14, 17, 7, 22); ctx.stroke();
        ctx.strokeStyle = "#e8573a"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(-8, -17); ctx.quadraticCurveTo(7, -18, 9, -4); ctx.stroke();
        ctx.strokeStyle = "#3f8f2a"; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(-17, -15); ctx.lineTo(-23, -22); ctx.stroke();
        ctx.lineCap = "butt";
        break;
      case "queso":
        ctx.fillStyle = "#f7cf50"; ctx.strokeStyle = "#d9a82a";
        ctx.beginPath(); ctx.moveTo(-21, 14); ctx.lineTo(21, 14); ctx.lineTo(21, -2); ctx.lineTo(-21, -14); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#e0ac2a"; ell(-8, 6, 3.5, 3.5); ctx.fill(); ell(9, 2, 3, 3); ctx.fill(); ell(2, 9, 2, 2); ctx.fill();
        break;
    }
    ctx.restore();
  }
  function dibujarItems() {
    if (!fase.dest) return;
    // bandeja
    var y0 = 1e9, y1 = -1e9;
    items.forEach(function (it) { y0 = Math.min(y0, it.hy); y1 = Math.max(y1, it.hy); });
    ctx.fillStyle = "rgba(255,255,255,.55)"; rect(14, y0 - 40, W - 28, y1 - y0 + 88, 18); ctx.fill();
    var orden = items.slice().sort(function (a, b) { return (a.estado === "drag" ? 1 : 0) - (b.estado === "drag" ? 1 : 0); });
    orden.forEach(function (it) {
      if (it.estado === "gone") return;
      var s = 1, y = it.y;
      if (it.estado === "shelf") y += Math.sin(T * 2.2 + it.hx * 0.05) * 2;
      if (it.estado === "drag") s = 1.18;
      if (it.estado === "fly") s = lerp(1.1, 0.75, eo(it.t));
      var ox = it.shake > 0 ? Math.sin(it.shake * 60) * 6 : 0;
      if (it.estado !== "fly" && it.estado !== "drag") {
        ctx.fillStyle = "rgba(0,0,0,.12)"; ell(it.x, it.hy + 24, 20, 5); ctx.fill();
      }
      icono(it.id, it.x + ox, y, s);
      if (it.estado === "shelf" || it.estado === "back") {
        txt(ITEMS[it.id].n, it.x + ox, it.hy + 36, MOVIL ? 12 : 13, "#5a3c1e", "center");
      }
    });
  }

  /* ---------- dibujo: bol, tabla, sartén ---------- */
  function blobs(lista, cx, cy, Rx, Ry) {
    for (var i = 0; i < lista.length; i++) {
      var b = lista[i];
      ctx.fillStyle = b.c; ell(cx + b.x * Rx, cy + b.y * Ry, b.r * Rx, b.r * Rx * (Ry / Rx) * 1.4 + 1); ctx.fill();
    }
  }
  function agregarBlobs(lista, color, n, radio, tope) {
    for (var i = 0; i < n; i++) {
      var a = rr(0, TAU), d = Math.sqrt(Math.random()) * (tope || 0.72);
      lista.push({ c: color, x: Math.cos(a) * d, y: Math.sin(a) * d, r: radio * rr(0.8, 1.25) });
    }
  }
  function dibBol(cx, cy, r) {
    var rx = r * 0.86, ry = r * 0.5;
    ctx.fillStyle = "rgba(0,0,0,.16)"; ell(cx, cy + ry * 1.25, rx * 0.95, ry * 0.4); ctx.fill();
    var g = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
    g.addColorStop(0, "#dfe6ec"); g.addColorStop(0.35, "#ffffff"); g.addColorStop(1, "#cfd8df");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(cx, cy + ry * 0.2, rx, ry * 1.12, 0, 0, PI); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#74acdf"; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(cx, cy + ry * 0.2, rx * 0.96, ry * 1.0, 0, 0.1 * PI, 0.9 * PI); ctx.stroke();
    ctx.fillStyle = "#fff"; ell(cx, cy, rx, ry * 0.58); ctx.fill();
    ctx.fillStyle = "#c5cfd8"; ell(cx, cy + 2, rx * 0.9, ry * 0.46); ctx.fill();
    var p = 1 + pulso * 0.07;
    if (fase.id === "amasar" || masaListo) {
      var f = masaListo ? 1 : cl(tapN / fase.n, 0, 1);
      ctx.save(); ctx.translate(cx, cy - 4); ctx.scale(p, 1 / p * (1 + pulso * 0.02));
      var br = lerp(rx * 0.35, rx * 0.72, f);
      ctx.fillStyle = mezcla([245, 240, 224], [241, 223, 182], f); ell(0, 0, br, br * 0.62); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.45)"; ell(-br * 0.25, -br * 0.18, br * 0.35, br * 0.14); ctx.fill();
      ctx.restore();
    } else {
      blobs(contenido.bol, cx, cy + 2, rx * 0.8, ry * 0.42);
    }
  }
  function dibSarten(cx, cy, r) {
    var R = r * 0.82;
    ctx.fillStyle = "rgba(0,0,0,.16)"; ell(cx, cy + R * 0.95, R * 1.0, R * 0.22); ctx.fill();
    ctx.fillStyle = "#7a5a3a"; rect(cx + R * 0.8, cy - 9, R * 0.95, 18, 8); ctx.fill();
    ctx.fillStyle = "#2b2b30"; ell(cx, cy, R, R * 0.86); ctx.fill();
    var g = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.1, cx, cy, R);
    g.addColorStop(0, "#4a4a52"); g.addColorStop(1, "#33333a");
    ctx.fillStyle = g; ell(cx, cy, R * 0.88, R * 0.74); ctx.fill();
    blobs(contenido.sarten, cx, cy, R * 0.8, R * 0.62);
    ctx.fillStyle = "rgba(255,255,255,.12)"; ell(cx - R * 0.35, cy - R * 0.4, R * 0.35, R * 0.1); ctx.fill();
  }
  function crearPiezas() {
    piezas = [{ x: 0, y: 0, a: 0.2 }];
    for (var i = 1; i < 18; i++) piezas.push({ x: rr(-0.78, 0.78), y: rr(-0.4, 0.42), a: rr(-0.8, 0.8) });
  }
  function dibTabla(cx, cy, r) {
    var w = r * 2.1, h = r * 1.2;
    ctx.fillStyle = "rgba(0,0,0,.16)"; rect(cx - w / 2 + 4, cy - h / 2 + 8, w, h, 16); ctx.fill();
    ctx.fillStyle = "#dca865"; ctx.strokeStyle = "#a8733a"; ctx.lineWidth = 3; rect(cx - w / 2, cy - h / 2, w, h, 16); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "rgba(140,90,40,.25)"; ctx.lineWidth = 2;
    for (var i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(cx - w / 2 + 14, cy - h / 2 + i * h / 5); ctx.lineTo(cx + w / 2 - 14, cy - h / 2 + i * h / 5 + 3); ctx.stroke(); }
    var f = cl(tapN / fase.n, 0, 1), n = 1 + Math.floor(f * 17), sz = lerp(0.62, 0.15, f) * r;
    for (var j = 0; j < n; j++) {
      var p = piezas[j];
      ctx.save(); ctx.translate(cx + p.x * r * 1.1, cy + p.y * r * 0.7); ctx.rotate(p.a);
      ctx.fillStyle = "#b5413a"; ctx.strokeStyle = "#8a2e2a"; ctx.lineWidth = 1.5; rect(-sz / 2, -sz * 0.35, sz, sz * 0.7, sz * 0.2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#d8605a"; rect(-sz / 2 + 2, -sz * 0.35 + 2, sz - 4, sz * 0.2, sz * 0.1); ctx.fill();
      ctx.restore();
    }
    if (estado === "jugando") {
      var kx = cx + (tapN % 3 - 1) * r * 0.45, ky = cy - 62 + pulso * 52;
      ctx.save(); ctx.translate(kx, ky); ctx.rotate(-0.12);
      ctx.fillStyle = "#c9d2da"; ctx.strokeStyle = "#8d949c"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(34, 0); ctx.lineTo(34, 42); ctx.lineTo(-34, 38); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#6b4a2a"; rect(-34, -26, 68, 26, 6); ctx.fill();
      ctx.restore();
    }
  }
  function anillo(cx, cy, r, f) {
    ctx.lineWidth = 6; ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = "#f6b40e"; ctx.beginPath(); ctx.arc(cx, cy, r, -PI / 2, -PI / 2 + TAU * f); ctx.stroke();
  }
  function pista(cx, cy, r) {
    var a = 0.35 + 0.35 * Math.sin(T * 5);
    ctx.strokeStyle = "rgba(246,180,14," + a + ")"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(cx, cy, r * (1 + 0.03 * Math.sin(T * 5)), 0, TAU); ctx.stroke();
  }
  function dibObjetivo() {
    var dest = fase.dest || fase.tap;
    if (!dest) return;
    if (dest === "bol") dibBol(tgt.x, tgt.y, tgt.r);
    else if (dest === "sarten") dibSarten(tgt.x, tgt.y, tgt.r);
    else if (dest === "tabla") dibTabla(tgt.x, tgt.y, tgt.r);
    if (fase.tap && estado === "jugando") {
      var f = cl(tapN / fase.n, 0, 1);
      anillo(tgt.x, tgt.y, tgt.r * 1.18, f);
      if (tapN === 0 || (T * 10) % 10 < 5 && tapN < 2) pista(tgt.x, tgt.y, tgt.r * 1.05);
      txt(tapN + " / " + fase.n, tgt.x, tgt.y + tgt.r * 1.18 + 20, 16, "#5a3c1e");
    } else if (fase.dest) {
      var hechos = items.filter(function (i) { return i.estado === "gone"; }).length;
      var cy0 = tgt.y - tgt.r * (fase.dest === "sarten" ? 1.0 : 0.85);
      ctx.fillStyle = "rgba(255,255,255,.8)"; rect(tgt.x - 74, cy0 - 13, 148, 26, 13); ctx.fill();
      txt(hechos + " de " + fase.sirven.length + " ingredientes", tgt.x, cy0, 14, "#5a3c1e");
      if (drag) { ctx.strokeStyle = "rgba(246,180,14,.85)"; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.arc(tgt.x, tgt.y, tgt.r * 1.12, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
    }
  }

  /* ---------- dibujo: armado ---------- */
  function colorMasa() { return ["#f3e2b8", "#d6b97a"]; }
  function dibEmp(cx, cy, r, e, mini) {
    var c = colorMasa(), f = e.fold;
    ctx.fillStyle = "rgba(0,0,0,.15)"; ell(cx, cy + r * 0.2 + (f > 0.5 ? r * 0.65 : r * 0.9), r * 0.95, r * 0.18); ctx.fill();
    ctx.fillStyle = c[0]; ctx.strokeStyle = c[1]; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (f < 0.98) {
      ctx.beginPath(); ctx.ellipse(cx, cy, r, Math.max(r * (1 - f), 0.5), 0, PI, TAU); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (e.fill > 0 && f < 0.85) {
      ctx.save(); ctx.globalAlpha = 1 - f;
      var fl = (e.blobs && e.blobs.length) ? e.blobs : contenido.sarten, s = e.fill;
      for (var i = 0; i < fl.length; i++) {
        var b = fl[i];
        ctx.fillStyle = b.c; ell(cx + b.x * r * 0.5 * s, cy + b.y * r * 0.45 * s * (1 - f * 0.6) - r * 0.05, b.r * r * 0.6 * s, b.r * r * 0.5 * s); ctx.fill();
      }
      ctx.restore();
    }
    ctx.fillStyle = "rgba(255,255,255,.35)"; ell(cx - r * 0.3, cy + r * 0.25, r * 0.22, r * 0.08); ctx.fill();
    if (e.sub === 3 || e.sig > 0) {
      for (var k = 0; k < N_PUNTOS; k++) {
        var p = puntoBorde(cx, cy, r, k);
        if (k < e.sig) {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a + 0.6);
          ctx.fillStyle = "#e6cf9a"; ctx.strokeStyle = "#b89350"; ctx.lineWidth = mini ? 1 : 2;
          rect(-r * 0.12, -r * 0.05, r * 0.24, r * 0.1, r * 0.05); ctx.fill(); ctx.stroke();
          ctx.restore();
        } else if (!mini) {
          var sig = k === e.sig;
          ctx.fillStyle = sig ? "rgba(246,180,14,.35)" : "rgba(255,255,255,.4)";
          ctx.strokeStyle = sig ? "#f6b40e" : "rgba(180,150,90,.6)"; ctx.lineWidth = sig ? 3 : 2;
          var pr = 12 + (sig ? 3 * Math.sin(T * 7) : 0);
          ell(p.x, p.y, pr, pr); ctx.fill(); ctx.stroke();
        }
      }
    }
  }
  function puntoBorde(cx, cy, r, k) {
    var th = PI * (k + 1) / (N_PUNTOS + 1);
    return { x: cx + Math.cos(PI - th) * r, y: cy + Math.sin(th) * r, a: PI / 2 - th + PI };
  }
  function empPos(e) {
    var cx = tgt.x, cy = tgt.y - tgt.r * 0.08, r = MOVIL ? 82 : 98, esc = 1;
    if (e.llega < 1) cy -= (1 - ob(e.llega)) * 260;
    if (e.slide > 0) {
      var s = eo(e.slide), ts = bandejaSlot(e.k);
      cx = lerp(cx, ts.x, s); cy = lerp(cy, ts.y, s); esc = lerp(1, 0.27, s);
    }
    return { x: cx, y: cy, r: r * esc };
  }
  function bandejaSlot(k) {
    return { x: W / 2 + (k - 1) * (MOVIL ? 82 : 96), y: H - (MOVIL ? 70 : 62) };
  }
  function dibArmar() {
    // bandeja
    var bw = MOVIL ? 270 : 330, by = H - (MOVIL ? 70 : 62);
    ctx.fillStyle = "rgba(0,0,0,.14)"; rect(W / 2 - bw / 2 + 3, by - 24 + 6, bw, 62, 14); ctx.fill();
    ctx.fillStyle = "#c9d2da"; ctx.strokeStyle = "#8d949c"; ctx.lineWidth = 3; rect(W / 2 - bw / 2, by - 24, bw, 62, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#e8edf1"; rect(W / 2 - bw / 2 + 8, by - 16, bw - 16, 46, 10); ctx.fill();
    for (var s = 0; s < N_EMP; s++) {
      var sl = bandejaSlot(s);
      ctx.strokeStyle = "rgba(120,130,140,.4)"; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ell(sl.x, sl.y + 2, 30, 14); ctx.stroke(); ctx.setLineDash([]);
    }
    emps.forEach(function (e) {
      var p = empPos(e);
      dibEmp(p.x, p.y, p.r, e, e.slide > 0.3);
    });
    var e = emps[empI];
    if (e && !e.listo && e.llega >= 1) {
      var u = armarUI();
      if (e.sub === 0) dibSeleccion(e, u);
      else if (e.sub === 1 && !e.rellenando) dibCarga(e, u);
      else if (e.sub === 2 && !e.plegando) { var p2 = empPos(e); pista(p2.x, p2.y, p2.r * 1.05); }
    }
    if (e && !e.listo && !banner) dibPedido(e);
    txt("Empanada " + Math.min(empI + 1, N_EMP) + " de " + N_EMP, W / 2, by - 44, 15, "#1f5f99");
  }

  /* ---- armado: pedido del cliente, ingredientes y cuchara ---- */
  function armarUI() {
    if (MOVIL) {
      return {
        tog: [0, 1, 2].map(function (i) { return { x: 48 + i * 74, y: 402, r: 28 }; }),
        ok: { x: 250, y: 378, w: 110, h: 48 },
        gauge: { x: 40, y: 390, w: 300, h: 26, vert: false }
      };
    }
    return {
      tog: [0, 1, 2].map(function (i) { return { x: 690, y: 250 + i * 75, r: 32 }; }),
      ok: { x: 40, y: 298, w: 140, h: 54 },
      gauge: { x: 672, y: 235, w: 36, h: 190, vert: true }
    };
  }
  function envolver(s, x, y, maxW, lh, size, col) {
    ctx.font = "bold " + size + "px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = col; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    var pal = s.split(" "), lin = [], act = "";
    pal.forEach(function (w) {
      var t = act ? act + " " + w : w;
      if (act && ctx.measureText(t).width > maxW) { lin.push(act); act = w; } else act = t;
    });
    lin.push(act);
    lin.forEach(function (l, i) { ctx.fillText(l, x, y + (i - (lin.length - 1) / 2) * lh); });
  }
  function dibPedido(e) {
    var bw = MOVIL ? W - 24 : 560, bh = MOVIL ? 78 : 74, bx = W / 2 - bw / 2, by = 10;
    ctx.fillStyle = "rgba(0,0,0,.12)"; rect(bx + 2, by + 5, bw, bh, 18); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#74acdf"; ctx.lineWidth = 3; rect(bx, by, bw, bh, 18); ctx.fill(); ctx.stroke();
    var ax = bx + 42, ay = by + bh / 2 + 2;
    var piel = ["#f1c9a0", "#d9a066", "#b87a4b"][e.k % 3], gorro = ["#74acdf", "#f6b40e", "#e8573a"][e.k % 3];
    ctx.fillStyle = piel; ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.lineWidth = 2; ell(ax, ay, 22, 22); ctx.fill(); ctx.stroke();
    ctx.fillStyle = gorro; ctx.beginPath(); ctx.arc(ax, ay - 8, 22, PI, TAU); ctx.closePath(); ctx.fill();
    ctx.fillRect(ax - 28, ay - 10, 56, 5);
    ctx.fillStyle = "#3a2a1a"; ell(ax - 8, ay + 1, 2.5, 2.5); ctx.fill(); ell(ax + 8, ay + 1, 2.5, 2.5); ctx.fill();
    ctx.strokeStyle = "#3a2a1a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ax, ay + 6, 8, 0.15 * PI, 0.85 * PI); ctx.stroke();
    envolver("“" + e.order.t + "”", bx + 84, by + bh / 2, bw - 100, MOVIL ? 20 : 24, MOVIL ? 15 : 19, "#5a3c1e");
  }
  function dibSeleccion(e, u) {
    u.tog.forEach(function (t, i) {
      var id = ING_ARMAR[i], on = e.sel[id];
      ctx.fillStyle = "rgba(0,0,0,.14)"; ell(t.x, t.y + t.r + 3, t.r * 0.85, 5); ctx.fill();
      ctx.fillStyle = on ? "#e6f8ee" : "rgba(255,255,255,.92)";
      ctx.strokeStyle = on ? "#1c9a62" : "#9aa5b1"; ctx.lineWidth = on ? 5 : 3;
      ell(t.x, t.y, t.r, t.r); ctx.fill(); ctx.stroke();
      icono(id, t.x, t.y + 2, t.r / 26);
      if (on) {
        ctx.fillStyle = "#1c9a62"; ell(t.x + t.r * 0.72, t.y - t.r * 0.72, 11, 11); ctx.fill();
        txt("✓", t.x + t.r * 0.72, t.y - t.r * 0.72 + 1, 14, "#fff");
      }
      txt(String(i + 1), t.x - t.r * 0.78, t.y + t.r * 0.78, 12, "#5a3c1e");
    });
    var o = u.ok;
    ctx.fillStyle = "rgba(0,0,0,.15)"; rect(o.x + 2, o.y + 5, o.w, o.h, o.h / 2); ctx.fill();
    ctx.fillStyle = "#f6b40e"; ctx.strokeStyle = "#c98f00"; ctx.lineWidth = 3; rect(o.x, o.y, o.w, o.h, o.h / 2); ctx.fill(); ctx.stroke();
    txt("LISTO", o.x + o.w / 2, o.y + o.h / 2, MOVIL ? 16 : 18, "#1f5f99");
  }
  function dibCarga(e, u) {
    var g = u.gauge, v = e.g, zona = v >= GAUGE.lo && v <= GAUGE.hi;
    ctx.fillStyle = "rgba(255,255,255,.88)"; ctx.strokeStyle = "#8d949c"; ctx.lineWidth = 3;
    rect(g.x - 4, g.y - 4, g.w + 8, g.h + 8, 12); ctx.fill(); ctx.stroke();
    var zx, zy, zw, zh, fx, fy, fw, fh;
    if (g.vert) {
      zx = g.x; zw = g.w; zh = g.h * (GAUGE.hi - GAUGE.lo); zy = g.y + g.h * (1 - GAUGE.hi);
      fx = g.x; fw = g.w; fh = g.h * v; fy = g.y + g.h - fh;
    } else {
      zy = g.y; zh = g.h; zx = g.x + g.w * GAUGE.lo; zw = g.w * (GAUGE.hi - GAUGE.lo);
      fy = g.y; fh = g.h; fx = g.x; fw = g.w * v;
    }
    ctx.fillStyle = "rgba(46,229,157,.55)"; ctx.fillRect(zx, zy, zw, zh);
    ctx.fillStyle = v > GAUGE.hi ? "#e8573a" : zona ? "#1c9a62" : "#f6b40e";
    if (fw > 0 && fh > 0) ctx.fillRect(fx, fy, fw, fh);
    ctx.strokeStyle = "#1c7a52"; ctx.lineWidth = 3; ctx.strokeRect(zx, zy, zw, zh);
    var et = !e.cargando ? "Mantené apretado" : v < GAUGE.lo ? "Poco…" : v <= GAUGE.hi ? "¡Soltá ya!" : "¡Demasiado!";
    var ec = !e.cargando ? "#5a3c1e" : v > GAUGE.hi ? "#c8321e" : zona ? "#1c9a62" : "#5a3c1e";
    txt(et, g.x + g.w / 2, g.y - (g.vert ? 20 : 18), 14, ec);
    // cuchara sobre la empanada
    var p = empPos(e);
    ctx.save(); ctx.translate(p.x, p.y - p.r - 36);
    ctx.strokeStyle = "#8d949c"; ctx.lineWidth = 6; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(26, -8); ctx.lineTo(80, -30); ctx.stroke(); ctx.lineCap = "butt";
    ctx.fillStyle = "#c9d2da"; ctx.strokeStyle = "#8d949c"; ctx.lineWidth = 3; ell(0, 0, 30, 16); ctx.fill(); ctx.stroke();
    if (v > 0) { ctx.fillStyle = "#9c3b2a"; ell(0, -2 - v * 7, 26 * Math.min(1, 0.3 + v), 4 + v * 14); ctx.fill(); }
    ctx.restore();
  }

  /* ---------- dibujo: horno ---------- */
  function tempColor(c) {
    if (c <= 1) return mezcla([240, 220, 174], [217, 154, 58], c);
    return mezcla([217, 154, 58], [70, 36, 20], (c - 1) / 0.6);
  }
  function miniEmp(x, y, w, col) {
    ctx.fillStyle = col; ctx.strokeStyle = "rgba(60,30,10,.55)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y + w * 0.2, w / 2, PI, TAU); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.setLineDash([w * 0.07, w * 0.06]); ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,240,200,.6)";
    ctx.beginPath(); ctx.arc(x, y + w * 0.2, w / 2 - 4, 1.1 * PI, 1.9 * PI); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255,255,255,.3)"; ell(x - w * 0.14, y - w * 0.06, w * 0.12, w * 0.05); ctx.fill();
  }
  function hornoGeom() {
    var ow = Math.min(W - 50, 400), oh = 190;
    return { ow: ow, oh: oh, ox: W / 2 - ow / 2, oy: MOVIL ? 110 : 100, gw: Math.min(W - 70, 460) };
  }
  function tx2(g, t) { return g.x0 + (t - 100) / 160 * g.gw; }
  function dibHorno() {
    var G = hornoGeom(), ox = G.ox, oy = G.oy, ow = G.ow, oh = G.oh;
    var glow = cl((horno.temp - 100) / 160, 0, 1);
    // cuerpo
    ctx.fillStyle = "rgba(0,0,0,.16)"; rect(ox + 4, oy + 8, ow, oh, 18); ctx.fill();
    var gr = ctx.createLinearGradient(0, oy, 0, oy + oh);
    gr.addColorStop(0, "#aeb6be"); gr.addColorStop(1, "#7f8892");
    ctx.fillStyle = gr; ctx.strokeStyle = "#5e6670"; ctx.lineWidth = 3; rect(ox, oy, ow, oh, 18); ctx.fill(); ctx.stroke();
    // perillas
    for (var k = 0; k < 3; k++) {
      var kx = ox + ow * (0.25 + k * 0.25), ky = oy + 18;
      ctx.fillStyle = "#e8edf1"; ctx.strokeStyle = "#5e6670"; ctx.lineWidth = 2; ell(kx, ky, 9, 9); ctx.fill(); ctx.stroke();
      var a = -PI * 0.75 + glow * PI * 1.5;
      ctx.strokeStyle = "#e8573a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(kx + Math.cos(a) * 7, ky + Math.sin(a) * 7); ctx.stroke();
    }
    // ventana
    var wx = ox + 22, wy = oy + 36, ww = ow - 44, wh = oh - 56;
    ctx.fillStyle = mezcla([38, 24, 20], [255, 128, 40], glow); rect(wx, wy, ww, wh, 10); ctx.fill();
    ctx.save(); rect(wx, wy, ww, wh, 10); ctx.clip();
    var gl = ctx.createLinearGradient(0, wy + wh, 0, wy);
    gl.addColorStop(0, "rgba(255,200,80," + (0.15 + glow * 0.7) + ")"); gl.addColorStop(1, "rgba(255,120,40,0)");
    ctx.fillStyle = gl; ctx.fillRect(wx, wy, ww, wh);
    ctx.strokeStyle = "rgba(255,200,120," + (0.25 + glow * 0.6) + ")"; ctx.lineWidth = 3;
    ctx.beginPath(); for (var z = 0; z < 9; z++) { var zx = wx + 10 + z * (ww - 20) / 8; ctx.lineTo(zx, wy + wh - 8 - (z % 2) * 6); } ctx.stroke();
    ctx.fillStyle = "#b6bdc4"; rect(wx + 6, wy + wh * 0.66, ww - 12, 7, 3); ctx.fill();
    var ew = Math.min(70, ww / 3 - 12), col = tempColor(horno.coc);
    for (var i = 0; i < N_EMP; i++) miniEmp(wx + ww * (1 + 2 * i) / 6, wy + wh * 0.6, ew, col);
    ctx.fillStyle = "rgba(255,255,255,.12)";
    ctx.beginPath(); ctx.moveTo(wx + 10, wy); ctx.lineTo(wx + 60, wy); ctx.lineTo(wx + 20, wy + wh); ctx.lineTo(wx, wy + wh); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#4a525a"; ctx.lineWidth = 4; rect(wx, wy, ww, wh, 10); ctx.stroke();
    // barra de tiempo
    var ty = oy - 24;
    ctx.fillStyle = "rgba(255,255,255,.6)"; rect(W / 2 - G.gw / 2, ty - 8, G.gw, 16, 8); ctx.fill();
    ctx.fillStyle = "#f6b40e"; rect(W / 2 - G.gw / 2, ty - 8, Math.max(16, G.gw * cl(horno.t / DUR_HORNO, 0, 1)), 16, 8); ctx.fill();
    txt("Minuto " + Math.min(Math.floor(horno.t), DUR_HORNO) + " de " + DUR_HORNO, W / 2, ty - 24, 14, "#5a3c1e");
    // termómetro
    var gy = oy + oh + (MOVIL ? 46 : 42), gx0 = W / 2 - G.gw / 2; G.x0 = gx0;
    var gg = ctx.createLinearGradient(gx0, 0, gx0 + G.gw, 0);
    gg.addColorStop(0, "#74acdf"); gg.addColorStop(0.5, "#f6b40e"); gg.addColorStop(1, "#e8573a");
    ctx.fillStyle = gg; rect(gx0, gy, G.gw, 22, 11); ctx.fill();
    ctx.fillStyle = "rgba(46,229,157,.95)"; ctx.fillRect(tx2(G, 200), gy - 5, tx2(G, 220) - tx2(G, 200), 32);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.strokeRect(tx2(G, 200), gy - 5, tx2(G, 220) - tx2(G, 200), 32);
    txt("200–220 °C", (tx2(G, 200) + tx2(G, 220)) / 2, gy - 18, 13, "#1c7a52");
    var nx = tx2(G, cl(horno.temp, 100, 260));
    ctx.fillStyle = "#2b2b30"; ctx.beginPath(); ctx.moveTo(nx, gy + 26); ctx.lineTo(nx - 9, gy + 42); ctx.lineTo(nx + 9, gy + 42); ctx.closePath(); ctx.fill();
    var enZona = horno.temp >= 200 && horno.temp <= 220;
    txt(Math.round(horno.temp) + " °C", W / 2, gy + 62, 26, enZona ? "#1c9a62" : horno.temp > 232 ? "#c8321e" : "#5a3c1e");
    txt("100 °C", gx0, gy + 38, 12, "#5a3c1e", "left"); txt("260 °C", gx0 + G.gw, gy + 38, 12, "#5a3c1e", "right");
    // botón
    var bw = Math.min(W - 60, 380), by = H - (MOVIL ? 44 : 38);
    ctx.fillStyle = "rgba(0,0,0,.15)"; rect(W / 2 - bw / 2 + 2, by - 24 + 5, bw, 48, 24); ctx.fill();
    ctx.fillStyle = horno.hold ? "#e8573a" : "#ffffff"; ctx.strokeStyle = "#e8573a"; ctx.lineWidth = 3; rect(W / 2 - bw / 2, by - 24, bw, 48, 24); ctx.fill(); ctx.stroke();
    txt(horno.on ? "MANTENÉ APRETADO PARA CALENTAR" : "APRETÁ PARA ENCENDER EL HORNO", W / 2, by, MOVIL ? 13 : 16, horno.hold ? "#fff" : "#e8573a");
    if (horno.hold) for (var q = 0; q < 2; q++) vaporLlama(ox + ow * (0.3 + q * 0.4), oy + oh - 30);
  }
  function vaporLlama() { /* decorativo: se resuelve con partículas */ }

  /* ---------- dibujo: final ---------- */
  function dibFin() {
    var cx = W / 2, cy = MOVIL ? 285 : 290, pw = MOVIL ? 150 : 210;
    // banderines
    for (var i = 0; i < 9; i++) {
      var bx = (i + 0.5) * W / 9, by = TY - 20 + Math.sin(i * 0.9 + T * 2) * 4;
      ctx.fillStyle = i % 2 ? "#ffffff" : "#74acdf"; ctx.strokeStyle = "rgba(0,0,0,.1)";
      ctx.beginPath(); ctx.moveTo(bx - 18, by - 34); ctx.lineTo(bx + 18, by - 34); ctx.lineTo(bx, by + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = "rgba(0,0,0,.16)"; ell(cx, cy + pw * 0.42, pw * 1.05, pw * 0.34); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#cfd8df"; ctx.lineWidth = 3; ell(cx, cy + 10, pw * 1.05, pw * 0.5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#eef3f7"; ell(cx, cy + 10, pw * 0.82, pw * 0.38); ctx.fill();
    var col = tempColor(res.coc);
    miniEmp(cx - pw * 0.52, cy + 18, pw * 0.5, col); miniEmp(cx + pw * 0.52, cy + 18, pw * 0.5, col); miniEmp(cx, cy - 2, pw * 0.56, col);
    if (Math.random() < 0.25) vapor(cx, cy - 20, 1);
  }

  /* ---------- lógica de fases ---------- */
  function mezclar(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function crearItems() {
    var ids = mezclar(fase.sirven.concat(fase.extra));
    items = ids.map(function (id) {
      return { id: id, ok: fase.sirven.indexOf(id) >= 0, estado: "shelf", x: 0, y: 0, hx: 0, hy: 0, t: 0, sx: 0, sy: 0, fx: 0, fy: 0, dur: 0.38, shake: 0 };
    });
    colocar();
  }
  function setConsigna(s) { elCons.textContent = s; }
  function irA(i) {
    fi = i; fase = FASES[i]; fase.hecho = false; tapN = 0; drag = null; items = []; pulso = 0;
    var P = PASO[fase.id];
    elPasos.textContent = P ? "Paso " + P[0] + " de 4 · " + P[1] : "";
    setConsigna(fase.cons);
    if (P && (fase.id === "masa" || fase.id === "corte" || fase.id === "armar" || fase.id === "horno")) banner = { txt: "Paso " + P[0] + " · " + P[1], t: 0 };
    if (fase.dest) crearItems();
    if (fase.id === "masa") { contenido.bol = []; contenido.sarten = []; masaListo = false; }
    if (fase.id === "corte") crearPiezas();
    if (fase.id === "relleno") { agregarBlobs(contenido.sarten, "#9c3b2a", 14, 0.13, 0.7); chispas(tgt.x, tgt.y, "#b5413a", 14, 120); vapor(tgt.x, tgt.y, 6); }
    if (fase.id === "armar") { emps = []; empI = 0; nuevoEmp(0); }
    if (fase.id === "horno") { horno = { temp: 100, t: 0, on: false, hold: false, zona: 0, coc: 0, fin: false }; }
    if (fase.id === "fin") terminar();
  }
  function avanzar() { irA(fi + 1); }

  function terminar() {
    estado = "fin";
    res.coc = horno.coc;
    var horOk = horno.coc >= 0.8 && horno.coc <= 1.25;
    var e = 3 - (errores >= 4 ? 1 : 0) - (errores >= 8 ? 1 : 0) - (horOk ? 0 : 1);
    res.estrellas = Math.max(1, e);
    var est = "★★★".slice(0, res.estrellas) + "☆☆☆".slice(0, 3 - res.estrellas);
    setConsigna("¡Listo! Las empanadas están servidas.");
    var cierre = horno.coc < 0.8 ? "Se hornearon poco: faltó calor." : horno.coc > 1.25 ? "Se pasaron de horno." : "Quedaron doradas y bien cocidas.";
    confeti(90);
    despues(1.6, function () {
      mostrarOv("Resultado: " + est, res.estrellas === 3 ? "¡Empanadas de campeonato!" : res.estrellas === 2 ? "¡Muy ricas!" : "¡Salieron, pero se puede mejorar!",
        cierre + " Cometiste " + errores + (errores === 1 ? " error" : " errores") + " entre ingredientes, pedidos y relleno. Dato: el borde decorativo se llama repulgue, y en la empanada tucumana la carne se corta a cuchillo.",
        "Jugar de nuevo", reiniciar, "Ver la receta completa");
    });
  }
  function reiniciar() {
    ocultarOv(); errores = 0; setErrores(); estado = "jugando"; masaListo = false; bandeja = []; parts = [];
    contenido = { bol: [], sarten: [] }; elMsg.textContent = ""; irA(0);
  }

  /* ---- armado ---- */
  /* sub: 0 = elegir el relleno según el pedido, 1 = cargar la cuchara, 2 = cerrar, 3 = repulgue */
  function nuevoEmp(k) {
    var pool = PEDIDOS[Math.min(k, PEDIDOS.length - 1)];
    var ped = pool[Math.floor(Math.random() * pool.length)];
    emps.push({
      k: k, sub: 0, fill: 0, fillTo: 1, fold: 0, sig: 0, llega: 0, slide: 0, listo: false, plegando: 0,
      order: ped, sel: { cebolla: false, huevo: false, aji: false }, g: 0, cargando: false, over: false, blobs: []
    });
    empI = k;
    setConsigna("El cliente dice: «" + ped.t + "» Armá el relleno tocando los ingredientes y después apretá LISTO.");
  }
  function empActual() { return emps[empI]; }
  function alternarIng(e, i) {
    var id = ING_ARMAR[i];
    e.sel[id] = !e.sel[id]; pulso = 1;
    mensaje((e.sel[id] ? "Con " : "Sin ") + ITEMS[id].n.toLowerCase() + ".", "ok");
  }
  function armarRelleno(e) {
    var b = [];
    agregarBlobs(b, "#9c3b2a", 12, 0.13, 0.7);
    if (e.sel.cebolla) agregarBlobs(b, "#f0d9a0", 5, 0.1, 0.7);
    if (e.sel.huevo) agregarBlobs(b, "#ffe58a", 4, 0.1, 0.7);
    if (e.sel.aji) agregarBlobs(b, "#d4331f", 5, 0.06, 0.7);
    e.blobs = b;
  }
  function confirmarPedido(e) {
    var p = empPos(e);
    var ok = ING_ARMAR.every(function (id, i) { return !!e.sel[id] === !!e.order.r[i]; });
    if (!ok) {
      errores++; setErrores(); sac = 6;
      mensaje("Ese relleno no es lo que pidió el cliente. Releé el pedido y probá de nuevo.", "mal");
      flotante(p.x, p.y - 40, "¡No es eso!", "#c8321e");
      return;
    }
    armarRelleno(e); e.sub = 1; e.g = 0;
    chispas(p.x, p.y, "#f6b40e", 10, 110); flotante(p.x, p.y - 40, "¡Ese es el pedido!", "#1c9a62");
    mensaje("Ahora la cuchara: mantené apretado y soltá en la zona verde.", "ok");
    setConsigna("Mantené apretado para cargar la cuchara y soltá cuando la barra esté en la zona verde. Poco queda sosa; mucho se revienta.");
  }
  function cargarInicio() {
    var e = empActual();
    if (!e || e.sub !== 1 || e.listo || e.llega < 1 || e.rellenando || e.plegando || e.cargando) return;
    e.cargando = true; e.g = 0;
  }
  function cargarFin() {
    var e = empActual();
    if (!e || !e.cargando) return;
    e.cargando = false;
    var p = empPos(e), v = e.g;
    if (v < GAUGE.lo) {
      errores++; setErrores(); sac = 6; e.g = 0;
      mensaje("¡Quedó sosa! Faltó relleno: probá de nuevo con más.", "mal");
      flotante(p.x, p.y - 40, "¡Sosa!", "#c8321e");
    } else {
      e.over = v > GAUGE.hi;
      e.fillTo = e.over ? 1.3 : 1; e.fill = 0.001; e.rellenando = 1;
      chispas(p.x, p.y, "#9c3b2a", 10, 100);
      if (e.over) mensaje("Mucho relleno… a ver si cierra.", ""); else mensaje("Una buena cucharada, justa.", "ok");
    }
  }
  function reventar(e) {
    var p = empPos(e);
    errores++; setErrores(); sac = 10;
    chispas(p.x, p.y, "#9c3b2a", 22, 200); flotante(p.x, p.y - 40, "¡Se reventó!", "#c8321e");
    mensaje("¡Se reventó! Era demasiado relleno. Hay que rehacerla con menos.", "mal");
    e.fold = 0; e.fill = 0; e.fillTo = 1; e.over = false; e.g = 0; e.sub = 1;
    setConsigna("Rehacé la empanada: mantené apretado y soltá en la zona verde.");
  }
  function tapArmar(px, py) {
    var e = empActual();
    if (!e || e.listo || e.llega < 1 || e.plegando || e.rellenando) return;
    var p = empPos(e);
    if (e.sub === 0) {
      if (px === null) { confirmarPedido(e); return; }
      var u = armarUI();
      for (var i = 0; i < u.tog.length; i++) {
        if (Math.hypot(px - u.tog[i].x, py - u.tog[i].y) < u.tog[i].r + 6) { alternarIng(e, i); return; }
      }
      var o = u.ok;
      if (px >= o.x && px <= o.x + o.w && py >= o.y && py <= o.y + o.h) confirmarPedido(e);
    } else if (e.sub === 1) {
      cargarInicio();
    } else if (e.sub === 2) {
      if (px !== null && Math.hypot(px - p.x, py - p.y) > p.r * 1.15) return;
      e.plegando = 1; mensaje("Cerrala por la mitad.", "ok");
    } else if (e.sub === 3) {
      var idx = -1;
      if (px === null) idx = e.sig;
      else {
        var best = 30;
        for (var k = 0; k < N_PUNTOS; k++) {
          var q = puntoBorde(p.x, p.y, p.r, k), d = Math.hypot(px - q.x, py - q.y);
          if (d < best && k >= e.sig) { best = d; idx = k; }
        }
      }
      if (idx < 0) return;
      if (idx === e.sig) {
        var q2 = puntoBorde(p.x, p.y, p.r, idx);
        e.sig++; pulso = 1; chispas(q2.x, q2.y, "#f3e2b8", 6, 70);
        if (e.sig === N_PUNTOS) {
          e.listo = true; mensaje("¡Repulgue terminado! Así se cierra una empanada.", "ok"); flotante(p.x, p.y - 30, "¡Repulgue!", "#fff");
          despues(0.5, function () { e.slide = 0.001; });
        }
      } else {
        errores++; setErrores(); sac = 6; mensaje("El repulgue se hace en orden, siguiendo el borde: tocá el punto que brilla.", "mal");
      }
    }
    var ee = e;
    if (ee.sub === 3 && !ee.listo) setConsigna("Repulgue: tocá los puntos del borde en orden, empezando por el que brilla.");
  }
  function actualizarArmar(dt) {
    emps.forEach(function (e) {
      if (e.llega < 1) e.llega = Math.min(1, e.llega + dt / 0.7);
      if (e.cargando) e.g = Math.min(1, e.g + dt * GAUGE.rate);
      if (e.rellenando && e.fill < e.fillTo) {
        e.fill = Math.min(e.fillTo, e.fill + dt / 0.5);
        if (e.fill >= e.fillTo) { e.rellenando = 0; e.sub = 2; setConsigna("Ahora tocá la masa para cerrarla por la mitad."); }
      }
      if (e.plegando && e.fold < 1) {
        e.fold = Math.min(1, e.fold + dt / 0.6);
        if (e.fold >= 1) {
          e.plegando = 0;
          if (e.over) reventar(e);
          else { e.sub = 3; setConsigna("Repulgue: tocá los puntos del borde en orden, empezando por el que brilla."); chispas(tgt.x, tgt.y + 40, "#f3e2b8", 8, 90); }
        }
      }
      if (e.slide > 0 && e.slide < 1) {
        e.slide = Math.min(1, e.slide + dt / 0.7);
        if (e.slide >= 1 && !e.llegoBandeja) {
          e.llegoBandeja = true; bandeja.push(e.k);
          if (e.k < N_EMP - 1) { nuevoEmp(e.k + 1); } else { despues(0.6, avanzar); }
        }
      }
    });
  }

  /* ---- horno ---- */
  function actualizarHorno(dt) {
    var h = horno;
    if (h.fin) return;
    if (h.hold && !h.on) { h.on = true; mensaje("Mantené la temperatura entre 200 y 220 °C.", "ok"); }
    h.temp += (h.hold ? 62 : -26) * dt;
    h.temp = cl(h.temp, 100, 260);
    if (!h.on) return;
    h.t += dt;
    if (h.temp >= 200 && h.temp <= 220) h.zona += dt;
    var f = h.temp < 140 ? 0.2 : h.temp < 190 ? 0.75 : h.temp <= 232 ? 1 : 1.6;
    h.coc += dt / DUR_HORNO * f;
    if (h.temp > 235 && Math.random() < dt * 8) vapor(W / 2 + rr(-80, 80), hornoGeom().oy + 40, 1);
    if (h.t >= DUR_HORNO) { h.fin = true; h.hold = false; flotante(W / 2, 160, "¡Salieron las empanadas!", "#fff"); despues(1.2, avanzar); }
  }

  /* ---- arrastrar / soltar ---- */
  function enDestino(x, y) { return Math.hypot(x - tgt.x, y - tgt.y) < tgt.r * 1.15; }
  function volarAlDestino(it) {
    it.estado = "fly"; it.t = 0; it.sx = it.x; it.sy = it.y; it.fx = tgt.x; it.fy = tgt.y - 10; it.dur = 0.36;
  }
  function resolver(it) {
    var def = ITEMS[it.id];
    if (it.ok) {
      it.estado = "gone";
      var lista = fase.dest === "bol" ? contenido.bol : contenido.sarten;
      agregarBlobs(lista, def.c, 7, it.id === "agua" ? 0.2 : 0.14);
      chispas(tgt.x, tgt.y - 10, def.c, 14, 150);
      flotante(tgt.x, tgt.y - 50, "¡Bien!", "#1c9a62");
      mensaje(def.ok, "ok");
      if (fase.dest === "sarten") vapor(tgt.x, tgt.y, 3);
      var quedan = items.filter(function (i) { return i.ok && i.estado !== "gone"; }).length;
      if (!quedan) {
        if (fase.id === "masa") despues(0.7, avanzar);
        else despues(0.7, avanzar);
      }
    } else {
      errores++; setErrores(); sac = 8;
      it.estado = "back"; it.t = 0; it.sx = tgt.x; it.sy = tgt.y; it.dur = 0.4; it.shake = 0.5;
      chispas(tgt.x, tgt.y, "#e8573a", 8, 120);
      flotante(tgt.x, tgt.y - 82, "¡No va!", "#c8321e");
      mensaje(def.mal, "mal");
    }
  }
  function tocarTap() {
    if (fase.hecho) return;
    tapN++; pulso = 1;
    var c = fase.tap === "tabla" ? "#b5413a" : fase.tap === "bol" ? "#fff6d8" : "#ffffff";
    chispas(tgt.x + rr(-30, 30), tgt.y, c, 6, 110);
    if (fase.tap === "sarten") vapor(tgt.x, tgt.y, 1);
    if (tapN >= fase.n) {
      if (fase.id === "amasar") { masaListo = true; mensaje("¡La masa quedó suave y uniforme! Hay que dejarla reposar.", "ok"); }
      if (fase.id === "corte") mensaje("Carne cortada a cuchillo en trozos pequeños.", "ok");
      if (fase.id === "enfriar") mensaje("El relleno ya está frío.", "ok");
      flotante(tgt.x, tgt.y - 60, "¡Listo!", "#1c9a62");
      fase.hecho = true;
      despues(0.8, avanzar);
    }
  }

  /* ---------- entrada ---------- */
  function coords(e) {
    var r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) * W / (r.width || 1), y: (e.clientY - r.top) * H / (r.height || 1) };
  }
  function jugable() { return estado === "jugando" && ovEl.hidden; }
  function alBajar(e) {
    if (!jugable()) return;
    var p = coords(e);
    if (fase.id === "horno") { horno.hold = true; e.preventDefault && e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) { /* nada */ } return; }
    if (fase.id === "armar") {
      tapArmar(p.x, p.y);
      try { cv.setPointerCapture(e.pointerId); } catch (x) { /* nada */ }
      return;
    }
    if (fase.dest) {
      for (var i = items.length - 1; i >= 0; i--) {
        var it = items[i];
        if (it.estado === "shelf" && Math.hypot(p.x - it.x, p.y - it.y) < 40) {
          it.estado = "drag"; drag = { it: it, sx: p.x, sy: p.y, mov: 0 };
          it.x = p.x; it.y = p.y;
          try { cv.setPointerCapture(e.pointerId); } catch (x) { /* nada */ }
          return;
        }
      }
    } else if (fase.tap) {
      if (enDestino(p.x, p.y)) tocarTap();
    }
  }
  function alMover(e) {
    if (!drag) return;
    var p = coords(e);
    drag.it.x = p.x; drag.it.y = p.y;
    drag.mov = Math.max(drag.mov, Math.hypot(p.x - drag.sx, p.y - drag.sy));
  }
  function alSoltar(e) {
    if (fase.id === "horno") { horno.hold = false; return; }
    if (fase.id === "armar") { cargarFin(); return; }
    if (!drag) return;
    var it = drag.it, mov = drag.mov, p = coords(e);
    drag = null;
    if (mov < 12 || enDestino(p.x, p.y)) { it.x = enDestino(p.x, p.y) ? p.x : it.x; it.y = enDestino(p.x, p.y) ? p.y : it.y; volarAlDestino(it); }
    else { it.estado = "back"; it.t = 0; it.sx = it.x; it.sy = it.y; it.dur = 0.28; }
  }
  cv.addEventListener("pointerdown", alBajar);
  cv.addEventListener("pointermove", alMover);
  cv.addEventListener("pointerup", alSoltar);
  cv.addEventListener("pointercancel", alSoltar);
  cv.style.touchAction = "none";

  window.addEventListener("keydown", function (e) {
    if (!jugable()) return;
    var k = e.key;
    if (fase.id === "armar" && /^[1-3]$/.test(k)) {
      var ea = empActual();
      if (ea && ea.sub === 0 && !ea.listo && ea.llega >= 1) alternarIng(ea, Number(k) - 1);
      return;
    }
    if (fase.dest && /^[1-9]$/.test(k)) {
      var libres = items.filter(function (i) { return i.estado === "shelf"; });
      var it = libres[Number(k) - 1];
      if (it) volarAlDestino(it);
      return;
    }
    if (k === " " || k === "Enter") {
      e.preventDefault();
      if (e.repeat && fase.id !== "horno") return;
      if (fase.id === "horno") horno.hold = true;
      else if (fase.id === "armar") {
        var eb = empActual();
        if (eb && eb.sub === 1) cargarInicio(); else tapArmar(null, null);
      }
      else if (fase.tap) tocarTap();
    }
  });
  window.addEventListener("keyup", function (e) {
    if (e.key !== " " && e.key !== "Enter") return;
    if (fase.id === "horno") horno.hold = false;
    else if (fase.id === "armar") cargarFin();
  });

  /* ---------- bucle ---------- */
  function actualizar(dt) {
    T += dt;
    sac = Math.max(0, sac - dt * 30);
    pulso = Math.max(0, pulso - dt * 4);
    if (msgT > 0) { msgT -= dt; if (msgT <= 0) { elMsg.textContent = ""; elMsg.className = "emp-mensaje"; } }
    if (banner) { banner.t += dt; if (banner.t > 1.8) banner = null; }
    for (var i = temporizadores.length - 1; i >= 0; i--) {
      temporizadores[i].t -= dt;
      if (temporizadores[i].t <= 0) { var f = temporizadores[i].fn; temporizadores.splice(i, 1); f(); }
    }
    items.forEach(function (it) {
      if (it.shake > 0) it.shake = Math.max(0, it.shake - dt);
      if (it.estado === "fly") {
        it.t += dt / it.dur; var p = eo(it.t);
        it.x = lerp(it.sx, it.fx, p); it.y = lerp(it.sy, it.fy, p) - Math.sin(PI * Math.min(it.t, 1)) * 40;
        if (it.t >= 1) resolver(it);
      } else if (it.estado === "back") {
        it.t += dt / it.dur; var q = eo(it.t);
        it.x = lerp(it.sx, it.hx, q); it.y = lerp(it.sy, it.hy, q);
        if (it.t >= 1) { it.estado = "shelf"; it.x = it.hx; it.y = it.hy; }
      }
    });
    if (fase.id === "armar") actualizarArmar(dt);
    if (fase.id === "horno") actualizarHorno(dt);
    if (fase.id === "relleno" || fase.id === "relleno2" || fase.id === "enfriar") {
      var intens = fase.id === "enfriar" ? 1 - tapN / fase.n : 0.6;
      if (Math.random() < dt * 5 * intens) vapor(tgt.x, tgt.y - 10, 1);
    }
    for (var j = parts.length - 1; j >= 0; j--) {
      var pt = parts[j]; pt.life -= dt;
      if (pt.life <= 0) { parts.splice(j, 1); continue; }
      pt.x += pt.vx * dt; pt.y += pt.vy * dt;
      if (pt.g) pt.vy += pt.g * dt;
      if (pt.k === "c") pt.a += pt.va * dt;
      if (pt.k === "v") pt.r += dt * 10;
    }
  }
  function dibujarPartes() {
    parts.forEach(function (p) {
      var a = cl(p.life / p.max, 0, 1);
      if (p.k === "p") { ctx.globalAlpha = a; ctx.fillStyle = p.c; ell(p.x, p.y, p.r, p.r); ctx.fill(); }
      else if (p.k === "v") { ctx.globalAlpha = a * 0.35; ctx.fillStyle = "#fff"; ell(p.x, p.y, p.r, p.r); ctx.fill(); }
      else if (p.k === "t") { ctx.globalAlpha = Math.min(1, a * 1.6); txt(p.s, p.x, p.y, 22, p.c); }
      else if (p.k === "c") { ctx.globalAlpha = 1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r); ctx.restore(); }
      ctx.globalAlpha = 1;
    });
  }
  function dibujarBanner() {
    if (!banner) return;
    var a = banner.t < 0.3 ? banner.t / 0.3 : banner.t > 1.4 ? (1.8 - banner.t) / 0.4 : 1;
    var y = lerp(-30, MOVIL ? 28 : 34, ob(banner.t / 0.4));
    ctx.globalAlpha = cl(a, 0, 1);
    ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#74acdf"; ctx.lineWidth = 3;
    var w = MOVIL ? 250 : 320; rect(W / 2 - w / 2, y - 22, w, 44, 22); ctx.fill(); ctx.stroke();
    txt(banner.txt, W / 2, y, MOVIL ? 18 : 22, "#1f5f99");
    ctx.globalAlpha = 1;
  }
  function dibujar() {
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (sac > 0.2) ctx.translate(rr(-sac, sac) * 0.5, rr(-sac, sac) * 0.5);
    fondo(); mesa();
    if (fase.id === "armar") dibArmar();
    else if (fase.id === "horno") dibHorno();
    else if (fase.id === "fin") dibFin();
    else if (fase.id === "intro") { /* nada */ }
    else { dibObjetivo(); dibujarItems(); }
    dibujarPartes();
    dibujarBanner();
    ctx.restore();
  }
  var ultimo = 0;
  function bucle(ts) {
    var dt = Math.min(0.05, (ts - (ultimo || ts)) / 1000);
    ultimo = ts;
    if (!document.hidden) { actualizar(dt); dibujar(); }
    window.requestAnimationFrame(bucle);
  }

  /* ---------- arranque ---------- */
  function empezar() {
    ocultarOv(); estado = "jugando"; errores = 0; setErrores();
    contenido = { bol: [], sarten: [] }; irA(0);
  }
  function inicio() {
    medir();
    fase = { id: "intro", cons: "" };
    elCons.textContent = "Seguí la receta de la empanada tucumana, paso por paso.";
    elPasos.textContent = ""; setErrores();
    mostrarOv("Arte culinario", "Armá tu empanada",
      "Cociná la empanada tucumana como en la feria: preparás la masa, hacés el relleno, atendés los pedidos de los clientes, armás con repulgue y las llevás al horno. Arrastrá (o tocá) los ingredientes correctos y cuidado con los que no van.",
      "¡A cocinar!", empezar, "");
    window.requestAnimationFrame(bucle);
  }
  window.addEventListener("resize", function () { medir(); });
  inicio();
})();
