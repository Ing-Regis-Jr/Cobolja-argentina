/* Cazá el dato · 5 personajes argentinos, uno por página
   Cada página tiene su personaje, que pasa una vez y esconde un dato curioso:
     Identidad .............. hornero que vuela (ave nacional)
     Cultura ................ llama que camina (Andes del noroeste)
     Deportes ............... pelota que rebota (fútbol argentino)
     Ciencia y tecnología ... satélite que cruza el cielo
     Legislación ............ Sol de Mayo que cuelga y se balancea

   - Aparece una vez a los pocos segundos y, si no lo tocan, vuelve una sola vez más.
   - Si ya encontraste el dato de esa página, no vuelve a aparecer.
   - Se muestra solo hasta la fecha HASTA (inclusive).
   - ?hornero=1      → fuerza que aparezca (aunque pase la fecha) y sale enseguida.
   - ?hornero=reset  → borra la colección guardada (útil para mostrarlo en la feria).
   - Para apagarlo del todo: borrá la línea que carga este archivo al final de js/nav.js. */
(function () {
  const HASTA = "2099-12-31"; // AAAA-MM-DD (prácticamente sin límite)
  const CLAVE = "cobolja-cazadatos-v2";

  // Qué personaje va en cada página (nombre del archivo).
  const MAPA = {
    "identidad.html": "hornero",
    "cultura.html": "llama",
    "deportes.html": "pelota",
    "ciencia-tecnologia.html": "satelite",
    "legislacion.html": "sol",
  };
  const ORDEN = ["hornero", "llama", "pelota", "satelite", "sol"];
  const TOTAL = ORDEN.length;

  const q = window.location.search;
  const forzado = /[?&]hornero=1\b/.test(q);
  const archivo = (window.location.pathname.split("/").pop() || "").toLowerCase();
  const id = MAPA[archivo];
  if (!id) return;

  const hoy = new Date();
  const hoyTxt =
    hoy.getFullYear() + "-" +
    String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
    String(hoy.getDate()).padStart(2, "0");
  if (!forzado && hoyTxt > HASTA) return;
  if (document.getElementById("hornero-ave")) return;

  const esMovil = () => window.matchMedia("(max-width: 720px)").matches;

  // ---- Dibujos ----
  function rayosSol() {
    let r = "";
    for (let i = 0; i < 8; i++) {
      r += `<polygon points="0,-46 4.5,-25 -4.5,-25" fill="#f6b40e" transform="rotate(${i * 45})"/>`;
      r += `<path d="M0 -25 Q5.5 -31 0 -36 T0 -47" fill="none" stroke="#f6b40e" stroke-width="3.2" stroke-linecap="round" transform="rotate(${i * 45 + 22.5})"/>`;
    }
    return r;
  }
  const SOL_CARA = `
    ${rayosSol()}
    <circle r="23" fill="#f6b40e" stroke="#e08a00" stroke-width="2"/>
    <circle r="17" fill="#ffd25a"/>
    <ellipse cx="-7" cy="-4" rx="2" ry="3" fill="#7a4300"/><ellipse cx="7" cy="-4" rx="2" ry="3" fill="#7a4300"/>
    <path d="M0 -3 L-1.6 4.5 L1.6 4.5" fill="none" stroke="#b36b00" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M-7 9 Q0 15 7 9" fill="none" stroke="#7a4300" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="-11" cy="5" r="3.2" fill="#ff9f43" opacity=".45"/><circle cx="11" cy="5" r="3.2" fill="#ff9f43" opacity=".45"/>`;

  const SVG_HORNERO = `
    <svg viewBox="0 0 100 70" focusable="false" aria-hidden="true">
      <path class="hn-ala hn-ala-lejana" d="M52 32 Q40 6 20 12 Q34 24 50 38Z" fill="#8c4a28"/>
      <polygon points="32,36 6,30 8,44 30,44" fill="#9a4f27"/>
      <g stroke="#5a4632" stroke-width="2" stroke-linecap="round">
        <line x1="52" y1="49" x2="50" y2="60"/><line x1="59" y1="49" x2="61" y2="60"/>
      </g>
      <ellipse cx="52" cy="38" rx="24" ry="13" fill="#b5653a"/>
      <path d="M32 42 Q52 58 76 42 Q64 50 52 50 Q40 50 32 42Z" fill="#ecd2ad"/>
      <circle cx="75" cy="29" r="10" fill="#b5653a"/>
      <path d="M68 33 Q76 40 83 33 Q80 38 76 39 Q71 38 68 33Z" fill="#ecd2ad"/>
      <polygon points="84,27 98,31 84,33" fill="#5b4126"/>
      <circle cx="78" cy="27" r="2.3" fill="#1b1b1b"/><circle cx="78.7" cy="26.3" r=".8" fill="#fff"/>
      <path class="hn-ala" d="M52 32 Q44 4 22 10 Q38 22 54 38Z" fill="#a85a2e"/>
    </svg>`;

  const SVG_LLAMA = `
    <svg viewBox="0 0 120 104" focusable="false" aria-hidden="true">
      <ellipse cx="26" cy="54" rx="5" ry="3.5" fill="#f3e9d6"/>
      <g class="hn-pata hn-pata-2" style="transform-origin:72px 70px"><line x1="72" y1="70" x2="73" y2="99" stroke="#cdb896" stroke-width="6" stroke-linecap="round"/><ellipse cx="73" cy="101" rx="4" ry="2.5" fill="#6b4a2b"/></g>
      <g class="hn-pata" style="transform-origin:42px 70px"><line x1="42" y1="70" x2="41" y2="99" stroke="#cdb896" stroke-width="6" stroke-linecap="round"/><ellipse cx="41" cy="101" rx="4" ry="2.5" fill="#6b4a2b"/></g>
      <ellipse cx="55" cy="60" rx="29" ry="17" fill="#f3e9d6"/>
      <path d="M36 48 Q54 39 74 48 L72 63 Q54 56 38 63Z" fill="#d9433b"/>
      <path d="M37 54 Q54 46 73 54 L72.6 57 Q54 50 37.4 57Z" fill="#74acdf"/>
      <path d="M37.6 59 Q54 52 72.4 59 L72 61 Q54 55 38 61Z" fill="#f6b40e"/>
      <g class="hn-pata" style="transform-origin:64px 72px"><line x1="64" y1="72" x2="65" y2="99" stroke="#e3d3b8" stroke-width="6" stroke-linecap="round"/><ellipse cx="65" cy="101" rx="4" ry="2.5" fill="#6b4a2b"/></g>
      <g class="hn-pata hn-pata-2" style="transform-origin:34px 72px"><line x1="34" y1="72" x2="33" y2="99" stroke="#e3d3b8" stroke-width="6" stroke-linecap="round"/><ellipse cx="33" cy="101" rx="4" ry="2.5" fill="#6b4a2b"/></g>
      <path d="M74 54 Q88 48 88 30 L99 32 Q100 54 86 68Z" fill="#f3e9d6"/>
      <path d="M92 22 Q88 9 92 3 Q97 10 96 21Z" fill="#f3e9d6"/><path d="M98 21 Q98 8 103 3 Q105 11 102 22Z" fill="#f3e9d6"/>
      <path d="M93 20 Q91 11 92.5 7 Q95 12 95 19Z" fill="#e8b9a8"/><path d="M99.5 19 Q99.5 11 102.5 7 Q103.5 12 102 20Z" fill="#e8b9a8"/>
      <ellipse cx="98" cy="27" rx="10" ry="7.5" transform="rotate(-8 98 27)" fill="#f3e9d6"/>
      <ellipse cx="106" cy="29" rx="5" ry="4" fill="#e6d4b4"/>
      <circle cx="109" cy="28" r="1.3" fill="#6b4a2b"/><circle cx="99" cy="25" r="1.8" fill="#1b1b1b"/>
    </svg>`;

  const SVG_PELOTA = `
    <svg viewBox="-20 -20 40 40" focusable="false" aria-hidden="true">
      <defs><clipPath id="hn-clip"><circle r="18"/></clipPath></defs>
      <circle r="18" fill="#fff" stroke="#123354" stroke-width="1.6"/>
      <g clip-path="url(#hn-clip)" fill="#123354" stroke="#123354">
        <polygon points="0,-6.5 6.2,-2 3.8,5.3 -3.8,5.3 -6.2,-2" stroke-width="1"/>
        <g fill="none" stroke-width="1.2">
          <line x1="0" y1="-6.5" x2="0" y2="-13"/><line x1="6.2" y1="-2" x2="12.4" y2="-4"/>
          <line x1="3.8" y1="5.3" x2="7.6" y2="10.5"/><line x1="-3.8" y1="5.3" x2="-7.6" y2="10.5"/>
          <line x1="-6.2" y1="-2" x2="-12.4" y2="-4"/>
        </g>
        <circle cx="9.4" cy="-12.9" r="4.2"/><circle cx="15.2" cy="4.9" r="4.2"/><circle cx="0" cy="16" r="4.2"/>
        <circle cx="-15.2" cy="4.9" r="4.2"/><circle cx="-9.4" cy="-12.9" r="4.2"/>
      </g>
    </svg>`;

  const SVG_SATELITE = `
    <svg viewBox="0 0 120 60" focusable="false" aria-hidden="true">
      <g class="hn-panel" stroke="#74acdf" stroke-width=".8">
        <rect x="3" y="20" width="42" height="20" fill="#1c4a73" stroke="#123354" stroke-width="1.2"/>
        <line x1="13.5" y1="20" x2="13.5" y2="40"/><line x1="24" y1="20" x2="24" y2="40"/><line x1="34.5" y1="20" x2="34.5" y2="40"/><line x1="3" y1="30" x2="45" y2="30"/>
        <rect x="75" y="20" width="42" height="20" fill="#1c4a73" stroke="#123354" stroke-width="1.2"/>
        <line x1="85.5" y1="20" x2="85.5" y2="40"/><line x1="96" y1="20" x2="96" y2="40"/><line x1="106.5" y1="20" x2="106.5" y2="40"/><line x1="75" y1="30" x2="117" y2="30"/>
      </g>
      <line x1="45" y1="30" x2="48" y2="30" stroke="#123354" stroke-width="2"/><line x1="72" y1="30" x2="75" y2="30" stroke="#123354" stroke-width="2"/>
      <rect x="48" y="17" width="24" height="26" rx="3" fill="#74acdf" stroke="#123354" stroke-width="1.4"/>
      <rect x="48" y="25" width="24" height="10" fill="#fff"/>
      <circle cx="60" cy="30" r="3.4" fill="#f6b40e" stroke="#e08a00" stroke-width=".8"/>
      <line x1="60" y1="17" x2="60" y2="9" stroke="#123354" stroke-width="1.6"/>
      <path d="M52 7 Q60 16 68 7Z" fill="#fff" stroke="#123354" stroke-width="1.2" stroke-linejoin="round"/>
      <circle cx="60" cy="9" r="1.5" fill="#f6b40e"/>
    </svg>`;

  const SVG_SOL = `
    <svg viewBox="0 0 70 160" focusable="false" aria-hidden="true">
      <line class="hn-hilo" x1="35" y1="0" x2="35" y2="104" stroke="#123354" stroke-width="1.6"/>
      <g class="hn-tocable" transform="translate(35 130) scale(.56)">${SOL_CARA}</g>
    </svg>`;
  const SVG_SOL_MINI = `<svg viewBox="-50 -50 100 100" focusable="false" aria-hidden="true">${SOL_CARA}</svg>`;

  // ---- Movimiento de cada personaje ----
  function rebote(t) {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) { t -= 1.5 / d; return n * t * t + 0.75; }
    if (t < 2.5 / d) { t -= 2.25 / d; return n * t * t + 0.9375; }
    t -= 2.625 / d; return n * t * t + 0.984375;
  }
  const SUELO_MOVIL = 92; // deja libre la barra de abajo en el celular

  const PERS = {
    hornero: {
      svg: SVG_HORNERO,
      dim: [[84, 59], [64, 45]],
      pista: [-8, -30],
      rotulo: "Hornero · Ave nacional de Argentina",
      titulo: "El ave que construye su casa de barro",
      dato: "El hornero es el ave nacional de Argentina. Construye su nido con barro, con forma de horno, y de ahí viene su nombre.",
      fuente: "Fundación Azara / Administración de Parques Nacionales",
      crear({ W, H, w }) {
        const der = Math.random() < 0.5;
        const yBase = H * (0.16 + Math.random() * 0.34);
        const amp = 14 + Math.random() * 18;
        const ond = 1.6 + Math.random() * 1.2;
        const x0 = der ? -w - 10 : W + 10, x1 = der ? W + 10 : -w - 10;
        return {
          dur: Math.max(7000, (W / 150) * 1000), reposo: 0.5,
          f(p) {
            const pen = Math.cos(p * Math.PI * 2 * ond) * amp * 0.12;
            return { x: x0 + (x1 - x0) * p, y: yBase + Math.sin(p * Math.PI * 2 * ond) * amp, rot: der ? pen : -pen, flip: !der };
          },
          salida: (r, { H: alto }) => ({ x: r.x, y: -alto - 100, rot: -25, flip: r.flip, dur: 900, ease: "ease-in" }),
        };
      },
    },
    llama: {
      svg: SVG_LLAMA,
      dim: [[110, 95], [82, 71]],
      pista: [10, -34],
      rotulo: "Llama · Animal de los Andes del noroeste argentino",
      titulo: "Arte de hace 9.000 años",
      dato: "En la Cueva de las Manos (Santa Cruz) hay pinturas de manos de hace más de 9.000 años, con escenas de caza de guanacos, parientes de la llama. Es Patrimonio de la Humanidad desde 1999.",
      fuente: "UNESCO",
      crear({ W, H, w, h, m }) {
        const suelo = H - h - (m ? SUELO_MOVIL : 12);
        const der = Math.random() < 0.5;
        const x0 = der ? -w - 10 : W + 10, x1 = der ? W + 10 : -w - 10;
        const dur = Math.max(11000, (W / 65) * 1000);
        const pasos = Math.round(dur / 600);
        return {
          dur, reposo: 0.5,
          f(p) { return { x: x0 + (x1 - x0) * p, y: suelo - Math.abs(Math.sin(p * Math.PI * pasos)) * 3, rot: 0, flip: !der }; },
          salida: (r, { W: ancho }) => ({ x: r.x + (r.flip ? -1 : 1) * ancho, y: r.y, rot: 0, flip: r.flip, dur: 1000, ease: "ease-in" }),
        };
      },
    },
    pelota: {
      svg: SVG_PELOTA,
      dim: [[56, 56], [44, 44]],
      pista: [-12, -34],
      sinSombra: true,
      rotulo: "Pelota · Fútbol argentino",
      titulo: "Tres estrellas",
      dato: "La selección argentina de fútbol fue campeona del mundo en 1978, 1986 y 2022. Por eso su escudo lleva tres estrellas.",
      fuente: "FIFA / AFA",
      crear({ W, H, w, h, m }) {
        const suelo = H - h - (m ? SUELO_MOVIL : 12);
        const der = Math.random() < 0.5;
        const x0 = der ? -w - 10 : W + 10, x1 = der ? W + 10 : -w - 10;
        const salto = m ? 70 : 90, rebotes = 5;
        const recorrido = W + 2 * w + 20;
        return {
          dur: Math.max(8000, (W / 120) * 1000), reposo: 0.2,
          f(p) {
            return {
              x: x0 + (x1 - x0) * p,
              y: suelo - Math.abs(Math.sin(p * Math.PI * rebotes)) * salto,
              rot: (der ? 1 : -1) * ((p * recorrido) / (h / 2)) * (180 / Math.PI),
              flip: false,
            };
          },
          salida: (r, { H: alto }) => ({ x: r.x + (r.x > W / 2 ? 120 : -120), y: -alto, rot: r.rot + 720, flip: false, dur: 1000, ease: "cubic-bezier(.2,.8,.4,1)" }),
        };
      },
    },
    satelite: {
      svg: SVG_SATELITE,
      dim: [[112, 56], [84, 42]],
      pista: [0, -34],
      rotulo: "Satélite · Ciencia y tecnología argentinas",
      titulo: "Tres Nobel de ciencias",
      dato: "Bernardo Houssay, Luis Leloir y César Milstein ganaron el Premio Nobel en medicina o química. Son los tres Nobel científicos de Argentina.",
      fuente: "NobelPrize.org",
      crear({ W, H, w, m }) {
        const der = Math.random() < 0.5;
        const yBase = (m ? 84 : 88) + Math.random() * H * 0.12;
        const baja = H * 0.1;
        const x0 = der ? -w - 10 : W + 10, x1 = der ? W + 10 : -w - 10;
        const ang = Math.atan2(baja, W) * (180 / Math.PI);
        return {
          dur: Math.max(9000, (W / 100) * 1000), reposo: 0.5,
          f(p) { return { x: x0 + (x1 - x0) * p, y: yBase + p * baja + Math.sin(p * Math.PI * 2) * 6, rot: der ? ang : -ang, flip: !der }; },
          salida: (r, { W: ancho }) => ({ x: r.x + (r.flip ? -1 : 1) * ancho * 1.2, y: r.y - 30, rot: r.rot, flip: r.flip, dur: 800, ease: "ease-in" }),
        };
      },
    },
    sol: {
      svg: SVG_SOL,
      mini: SVG_SOL_MINI,
      dim: [[70, 160], [52, 119]],
      pista: [-82, 96],
      origen: "50% 0",
      rotulo: "Sol de Mayo · Símbolo de la bandera argentina",
      titulo: "Escuela para todos",
      dato: "La Ley 1420, de 1884, estableció la educación primaria gratuita, obligatoria y laica en Argentina. Es un antecedente de la actual Ley de Educación Nacional 26.206.",
      fuente: "Ministerio de Educación de la Nación",
      crear({ W, w, h, m }) {
        const x = W - (m ? 150 : 190) - w / 2;
        const caida = 0.05, subida = 0.92;
        return {
          dur: 28000, reposo: 0.5,
          f(p) {
            let y = 0;
            if (p < caida) y = -h * (1 - rebote(p / caida));
            else if (p > subida) y = -h * Math.pow((p - subida) / (1 - subida), 2);
            const ang = p < caida || p > subida ? 0 : (13 * Math.exp(-(p - caida) * 6) + 3) * Math.sin((p - caida) * Math.PI * 2 * 10);
            return { x, y, rot: ang, flip: false };
          },
          salida: (r, { H: alto }) => ({ x: r.x, y: alto + 200, rot: 120, flip: false, dur: 1100, ease: "ease-in", corta: true }),
        };
      },
    },
  };

  const cfg = PERS[id];

  // ---- Colección guardada ----
  let memoria = [];
  function leer() {
    try {
      const v = JSON.parse(localStorage.getItem(CLAVE) || "[]");
      return Array.isArray(v) ? v.filter((n) => ORDEN.indexOf(n) !== -1) : [];
    } catch (e) { return memoria; }
  }
  function guardar(lista) {
    memoria = lista;
    try { localStorage.setItem(CLAVE, JSON.stringify(lista)); } catch (e) { /* sin almacenamiento */ }
  }
  if (/[?&]hornero=reset\b/.test(q)) guardar([]);
  let hallados = leer();

  // ---- Estilos ----
  const estilo = document.createElement("style");
  estilo.textContent = `
    #hornero-ave {
      position: fixed; left: 0; top: 0; z-index: 65; cursor: pointer;
      border: 0; padding: 0; background: none; display: none;
      will-change: transform; -webkit-tap-highlight-color: transparent;
    }
    #hornero-ave svg { width: 100%; height: 100%; overflow: visible; display: block; filter: drop-shadow(0 3px 3px rgba(18,51,84,.25)); }
    #hornero-ave.hn-sin-sombra svg { filter: none; }
    #hornero-ave:focus-visible { outline: 3px solid #123354; outline-offset: 4px; border-radius: 12px; }
    #hornero-ave.hn-sol { pointer-events: none; }
    #hornero-ave.hn-sol .hn-tocable { pointer-events: all; cursor: pointer; }
    #hornero-ave.hn-cortado .hn-hilo { opacity: 0; }
    .hn-ala { transform-origin: 52px 32px; animation: hn-aletear .22s ease-in-out infinite alternate; }
    .hn-ala-lejana { animation-delay: -.11s; opacity: .85; }
    @keyframes hn-aletear { from { transform: rotate(18deg); } to { transform: rotate(-52deg); } }
    .hn-pata { animation: hn-paso .55s ease-in-out infinite alternate; }
    .hn-pata-2 { animation-direction: alternate-reverse; }
    @keyframes hn-paso { from { transform: rotate(-24deg); } to { transform: rotate(24deg); } }
    .hn-panel { animation: hn-brillo 2.4s ease-in-out infinite alternate; }
    @keyframes hn-brillo { from { opacity: .82; } to { opacity: 1; } }
    #hornero-ave.hn-atrapado .hn-ala { animation-duration: .1s; }
    #hornero-ave.hn-atrapado .hn-pata { animation-duration: .18s; }
    #hornero-ave.hn-posado .hn-ala, #hornero-ave.hn-posado .hn-pata, #hornero-ave.hn-posado .hn-panel { animation: none; }
    #hornero-pista {
      position: fixed; left: 0; top: 0; z-index: 66; pointer-events: none;
      background: #123354; color: #fff; font: 700 .78rem/1 system-ui, sans-serif;
      padding: .4rem .6rem; border-radius: 999px; white-space: nowrap;
      box-shadow: 0 4px 10px rgba(18,51,84,.3);
    }
    #hornero-cuenta {
      position: fixed; top: 12px; right: 14px; z-index: 45;
      display: inline-flex; align-items: center; gap: .4rem;
      background: #fff; color: #123354; border: 1px solid #d5dde8;
      font: 700 .78rem/1 system-ui, sans-serif; padding: .45rem .7rem; border-radius: 999px;
      box-shadow: 0 2px 8px rgba(18,51,84,.15); pointer-events: none;
    }
    #hornero-cuenta i { width: .7rem; height: .7rem; border-radius: 50%; background: #74acdf; display: inline-block; }
    #hornero-cuenta.hn-completo { background: #f6b40e; border-color: #e08a00; }
    #hornero-cuenta.hn-completo i { background: #fff; }
    #hornero-dato {
      position: fixed; right: 16px; bottom: 24px; z-index: 90;
      width: min(380px, calc(100vw - 32px));
      background: #fff; color: #123354; border-radius: 16px;
      border-left: 6px solid #74acdf; padding: 1rem 2.6rem 1rem 1rem;
      box-shadow: 0 12px 30px rgba(18,51,84,.28);
      font: 400 .95rem/1.45 system-ui, sans-serif;
      animation: hn-subir .35s ease-out;
    }
    #hornero-dato .hn-cab { display: flex; gap: .75rem; align-items: center; margin-bottom: .6rem; }
    #hornero-dato .hn-mini { flex: 0 0 64px; height: 56px; border-radius: 12px; background: #eef5fc; display: flex; align-items: center; justify-content: center; padding: 6px; }
    #hornero-dato .hn-mini svg { max-width: 100%; max-height: 100%; width: auto; height: 100%; }
    #hornero-dato .hn-mini * { animation: none !important; }
    #hornero-dato .hn-rot { margin: 0; font-size: .74rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: #123354; line-height: 1.25; }
    #hornero-dato .hn-k { margin: .2rem 0 0; font-size: .72rem; font-weight: 700; color: #3d7eb3; }
    #hornero-dato h3 { margin: 0 0 .35rem; font-size: 1.1rem; }
    #hornero-dato p { margin: 0; }
    #hornero-dato .hn-fuente { margin-top: .5rem; font-size: .78rem; color: #5b6b7e; }
    #hornero-dato .hn-premio { margin-top: .55rem; font-weight: 800; color: #b5651d; }
    #hornero-dato button {
      position: absolute; top: .45rem; right: .5rem; width: 2rem; height: 2rem;
      border: 0; border-radius: 50%; background: #eef3f9; color: #123354; font-size: 1.1rem; cursor: pointer;
    }
    @keyframes hn-subir { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
    .hn-confeti { position: fixed; top: -12px; z-index: 95; width: 9px; height: 14px; pointer-events: none; animation: hn-caer 2.4s ease-in forwards; }
    @keyframes hn-caer { to { transform: translateY(105vh) rotate(540deg); opacity: .9; } }
    @media (max-width: 720px) {
      #hornero-cuenta { top: 14px; right: 8px; }
      #hornero-dato { right: 10px; left: 10px; width: auto; bottom: 96px; }
    }
    @media print { #hornero-ave, #hornero-cuenta, #hornero-dato, #hornero-pista { display: none !important; } }
  `;
  document.head.appendChild(estilo);

  // ---- Elementos ----
  const ave = document.createElement("button");
  ave.type = "button";
  ave.id = "hornero-ave";
  ave.setAttribute("aria-label", cfg.rotulo + ": tocalo para descubrir un dato curioso");
  ave.innerHTML = cfg.svg;
  if (id === "sol") ave.classList.add("hn-sol");
  if (cfg.sinSombra) ave.classList.add("hn-sin-sombra");
  ave.style.transformOrigin = cfg.origen || "50% 50%";
  document.body.appendChild(ave);

  const cuenta = document.createElement("div");
  cuenta.id = "hornero-cuenta";
  cuenta.setAttribute("aria-live", "polite");
  document.body.appendChild(cuenta);
  function pintarCuenta() {
    const n = hallados.length;
    cuenta.classList.toggle("hn-completo", n >= TOTAL);
    cuenta.innerHTML = n >= TOTAL ? "<i></i>¡Datos completos!" : `<i></i>Datos ${n}/${TOTAL}`;
  }
  pintarCuenta();

  let pista = null, burbuja = null, volando = false, temporizador = null, rafId = 0;
  let intento = 0, ultimo = null, dim = [0, 0];

  function programar(ms) { clearTimeout(temporizador); temporizador = setTimeout(intentar, ms); }
  function intentar() {
    if (document.hidden || burbuja || volando) { programar(3000); return; }
    lanzar();
  }

  function colocar(r) {
    ultimo = r;
    ave.style.transform = `translate(${r.x}px, ${r.y}px) scaleX(${r.flip ? -1 : 1}) rotate(${r.rot || 0}deg)`;
    if (pista) pista.style.transform = `translate(${r.x + cfg.pista[0]}px, ${r.y + cfg.pista[1]}px)`;
  }

  function medidas() {
    const m = esMovil();
    const d = cfg.dim[m ? 1 : 0];
    ave.style.width = d[0] + "px";
    ave.style.height = d[1] + "px";
    dim = d;
    return { W: window.innerWidth, H: window.innerHeight, w: d[0], h: d[1], m };
  }

  function lanzar() {
    volando = true;
    const ctx = medidas();
    const ruta = cfg.crear(ctx);
    ave.style.display = "block";
    ave.classList.remove("hn-atrapado", "hn-posado", "hn-cortado");
    if (intento === 0) {
      pista = document.createElement("div");
      pista.id = "hornero-pista";
      pista.textContent = "¡Tocame!";
      document.body.appendChild(pista);
    }
    const t0 = performance.now();
    function paso(ahora) {
      if (!volando) return;
      const p = Math.min(1, (ahora - t0) / ruta.dur);
      colocar(ruta.f(p));
      if (p < 1) rafId = requestAnimationFrame(paso); else terminarVuelo();
    }
    ave._ruta = ruta; ave._ctx = ctx;
    rafId = requestAnimationFrame(paso);
  }

  function limpiarPista() { if (pista) { pista.remove(); pista = null; } }

  function terminarVuelo() {
    volando = false;
    cancelAnimationFrame(rafId);
    ave.style.display = "none";
    limpiarPista();
    intento += 1;
    if (intento < 2) programar(40000); // vuelve una sola vez más
  }

  // ---- Atrapar ----
  function atrapar() {
    if (!volando) return;
    volando = false;
    cancelAnimationFrame(rafId);
    limpiarPista();
    ave.classList.add("hn-atrapado");

    const s = ave._ruta.salida(ultimo, ave._ctx);
    if (s.corta) ave.classList.add("hn-cortado");
    const anim = ave.animate(
      [
        { transform: ave.style.transform, opacity: 1 },
        { transform: `translate(${s.x}px, ${s.y}px) scaleX(${s.flip ? -1 : 1}) rotate(${s.rot}deg)`, opacity: id === "sol" ? 1 : 0 },
      ],
      { duration: s.dur, easing: s.ease, fill: "forwards" }
    );
    anim.onfinish = () => { ave.style.display = "none"; anim.cancel(); };

    registrar();
  }

  function registrar() {
    const nuevo = hallados.indexOf(id) === -1;
    if (nuevo) { hallados = hallados.concat(id); guardar(hallados); pintarCuenta(); }
    const completo = nuevo && hallados.length >= TOTAL;
    mostrarDato(nuevo, completo);
    if (completo) confeti();
  }

  function mostrarDato(nuevo, completo) {
    cerrarDato();
    burbuja = document.createElement("div");
    burbuja.id = "hornero-dato";
    burbuja.setAttribute("role", "status");
    burbuja.innerHTML = `
      <div class="hn-cab">
        <div class="hn-mini">${cfg.mini || cfg.svg}</div>
        <div><p class="hn-rot"></p><p class="hn-k"></p></div>
      </div>
      <h3></h3>
      <p class="hn-texto"></p>
      <p class="hn-fuente"></p>
      ${completo ? `<p class="hn-premio">¡Juntaste los ${TOTAL} datos! Ya conocés mejor a Argentina.</p>` : ""}
      <button type="button" aria-label="Cerrar dato">×</button>`;
    burbuja.querySelector(".hn-rot").textContent = cfg.rotulo;
    burbuja.querySelector(".hn-k").textContent = nuevo ? `Dato oculto · ${hallados.length} de ${TOTAL}` : "Este dato ya lo tenías";
    burbuja.querySelector("h3").textContent = cfg.titulo;
    burbuja.querySelector(".hn-texto").textContent = cfg.dato;
    burbuja.querySelector(".hn-fuente").textContent = "Fuente: " + cfg.fuente;
    burbuja.querySelector("button").addEventListener("click", cerrarDato);
    document.body.appendChild(burbuja);
    clearTimeout(mostrarDato.auto);
    mostrarDato.auto = setTimeout(cerrarDato, 14000);
  }

  function cerrarDato() {
    clearTimeout(mostrarDato.auto);
    if (burbuja) { burbuja.remove(); burbuja = null; }
  }

  function confeti() {
    
    const colores = ["#74acdf", "#ffffff", "#f6b40e", "#3d7eb3"];
    for (let n = 0; n < 40; n++) {
      const c = document.createElement("i");
      c.className = "hn-confeti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = colores[n % colores.length];
      c.style.border = "1px solid rgba(18,51,84,.25)";
      c.style.animationDelay = Math.random() * 0.6 + "s";
      c.style.animationDuration = 1.8 + Math.random() * 1.4 + "s";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }
  }

  document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarDato(); });

  // ---- Arranque ----
if (hallados.indexOf(id) !== -1) return;

// El personaje vuela automáticamente en PC y móviles.
ave.addEventListener("click", atrapar);
programar(forzado ? 800 : 5000);
})();
