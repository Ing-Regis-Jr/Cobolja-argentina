(function () {
  const cfg = window.RANKING_CONFIG || {};
  const NICK_MAX = cfg.nickMax || 16;
  const STORAGE_KEY = "cobolja_ranking_argentina";

  function sanitizeNick(raw) {
    const clean = String(raw || "")
      .trim()
      .replace(/[^\wáéíóúÁÉÍÓÚñÑ .-]/g, "")
      .slice(0, NICK_MAX);
    return clean;
  }

  function localList() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (err) {
      return [];
    }
  }

  function saveLocal(entry) {
    const list = localList();
    list.push(entry);
    list.sort((a, b) => b.score - a.score || a.created.localeCompare(b.created));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 20)));
  }

  function hasSupabase() {
    return Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
  }

  async function fetchRemote() {
    const url = `${cfg.supabaseUrl.replace(/\/$/, "")}/rest/v1/${cfg.table}?select=nick,score,created_at&order=score.desc&limit=10`;
    const res = await fetch(url, {
      headers: {
        apikey: cfg.supabaseAnonKey,
        Authorization: `Bearer ${cfg.supabaseAnonKey}`,
      },
    });
    if (!res.ok) {
      throw new Error("No se pudo leer el ranking remoto");
    }
    const rows = await res.json();
    return rows.map((row) => ({
      nick: row.nick,
      score: row.score,
      created: row.created_at,
    }));
  }

  async function sendRemote(entry) {
    const url = `${cfg.supabaseUrl.replace(/\/$/, "")}/rest/v1/${cfg.table}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: cfg.supabaseAnonKey,
        Authorization: `Bearer ${cfg.supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        nick: entry.nick,
        score: entry.score,
        total: entry.total,
      }),
    });
    if (!res.ok) {
      throw new Error("No se pudo guardar en el ranking remoto");
    }
  }

  function renderList(mount, items, note) {
    const list = items
      .slice(0, 10)
      .map(
        (item, i) =>
          `<li><span>${i + 1}. ${item.nick}</span><strong>${item.score}</strong></li>`
      )
      .join("");
    mount.innerHTML = `
      <h3>Ranking</h3>
      <p class="status-note">${note}</p>
      <ol class="ranking-list">${list || "<li>Todavía no hay puntajes.</li>"}</ol>
    `;
  }

  window.renderRanking = function (panel, score, total) {
    if (!panel) {
      return;
    }
    panel.innerHTML = `
      <form class="nick-form" id="rank-form">
        <label for="nick">Apodo (sin nombre real ni datos personales)</label>
        <input id="nick" name="nick" maxlength="${NICK_MAX}" required placeholder="Ej: condor2026" autocomplete="off">
        <button class="btn btn-primary" type="submit">Enviar al ranking</button>
      </form>
      <div id="rank-board"></div>
    `;

    const board = document.getElementById("rank-board");
    const note = hasSupabase()
      ? "Clasificación compartida entre dispositivos (Supabase)."
      : "Modo local: el ranking se guarda en este navegador. Para compartirlo entre PCs, carguen la URL y la clave anónima de Supabase en js/config.js.";

    async function refresh() {
      try {
        const items = hasSupabase() ? await fetchRemote() : localList();
        renderList(board, items, note);
      } catch (err) {
        const items = localList();
        renderList(board, items, "El servicio remoto no respondió. Se muestra el ranking local.");
      }
    }

    refresh();

    document.getElementById("rank-form").addEventListener("submit", async (event) => {
      event.preventDefault();
      const nick = sanitizeNick(document.getElementById("nick").value);
      if (nick.length < 2) {
        alert("El apodo debe tener entre 2 y 16 caracteres permitidos.");
        return;
      }
      if (!Number.isInteger(score) || score < 0 || score > total) {
        alert("Puntaje inválido.");
        return;
      }
      const sentKey = "cobolja_last_submit";
      const last = Number(sessionStorage.getItem(sentKey) || 0);
      if (Date.now() - last < 15000) {
        alert("Esperá unos segundos antes de volver a enviar.");
        return;
      }
      const entry = {
        nick,
        score,
        total,
        created: new Date().toISOString(),
      };
      saveLocal(entry);
      sessionStorage.setItem(sentKey, String(Date.now()));
      if (hasSupabase()) {
        try {
          await sendRemote(entry);
        } catch (err) {
          alert("Se guardó en este dispositivo, pero el ranking compartido no aceptó el envío.");
        }
      }
      refresh();
    });
  };
})();
