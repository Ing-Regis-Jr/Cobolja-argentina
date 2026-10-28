(function () {
  const STORAGE_KEY = "cobolja_preguntas_banco";
  const playRoot = document.getElementById("trivia-app");
  const editorRoot = document.getElementById("trivia-editor");
  if (!playRoot) {
    return;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function defaults() {
    return (window.PREGUNTAS || []).map((q) => ({ ...q, opciones: [...q.opciones] }));
  }

  function loadBank() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (Array.isArray(saved) && saved.length) {
        return saved;
      }
    } catch (err) {
      /* usar base */
    }
    return defaults();
  }

  function saveBank(bank) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bank));
  }

  let bank = loadBank();
  let index = 0;
  let score = 0;
  let locked = false;
  let editingId = "";

  function setMode(mode) {
    document.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.mode === mode);
    });
    playRoot.hidden = mode !== "play";
    if (editorRoot) {
      editorRoot.hidden = mode !== "edit";
    }
    if (mode === "play") {
      index = 0;
      score = 0;
      renderQuestion();
    } else {
      renderEditor();
    }
  }

  function renderQuestion() {
    if (!bank.length) {
      playRoot.innerHTML =
        "<p>No hay preguntas. Abrí el banco, creá al menos una y volvé a jugar.</p>";
      return;
    }
    if (index >= bank.length) {
      index = 0;
    }
    const q = bank[index];
    const percent = Math.round((index / bank.length) * 100);
    playRoot.innerHTML = `
      <p class="muted">Pregunta ${index + 1} de ${bank.length}</p>
      <div class="progress" aria-hidden="true"><span style="width:${percent}%"></span></div>
      <h2>${escapeHtml(q.pregunta)}</h2>
      <div class="options" role="group" aria-label="Opciones"></div>
      <p class="feedback" id="feedback"></p>
      <button class="btn btn-dark" id="next-btn" hidden>Siguiente</button>
    `;
    const group = playRoot.querySelector(".options");
    q.opciones.forEach((texto, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = texto;
      btn.addEventListener("click", () => choose(i, btn, group));
      group.appendChild(btn);
    });
    locked = false;
  }

  function choose(choice, btn, group) {
    if (locked) {
      return;
    }
    locked = true;
    const q = bank[index];
    const buttons = [...group.querySelectorAll("button")];
    buttons.forEach((el, i) => {
      el.disabled = true;
      if (i === q.correcta) {
        el.classList.add("is-correct");
      }
    });
    const feedback = document.getElementById("feedback");
    if (choice === q.correcta) {
      score += 1;
      feedback.textContent = "Correcto. " + q.explicacion;
      feedback.style.color = "var(--ok)";
    } else {
      btn.classList.add("is-wrong");
      feedback.textContent = "No era esa. " + q.explicacion;
      feedback.style.color = "var(--error)";
    }
    const next = document.getElementById("next-btn");
    next.hidden = false;
    next.addEventListener("click", () => {
      index += 1;
      if (index >= bank.length) {
        renderEnd();
      } else {
        renderQuestion();
      }
    });
  }

  function renderEnd() {
    window.__TRIVIA_RESULT__ = { score, total: bank.length };
    playRoot.innerHTML = `
      <h2>Resultado final</h2>
      <p>Obtuviste <strong>${score}</strong> de <strong>${bank.length}</strong> puntos.</p>
      <p class="muted">Podés repetir la trivia, editar el banco de preguntas o enviar un apodo al ranking.</p>
      <p>
        <button class="btn btn-primary" id="replay" type="button">Volver a jugar</button>
        <button class="btn btn-ghost" id="goto-edit" type="button">Editar preguntas</button>
      </p>
      <div id="ranking-panel"></div>
    `;
    document.getElementById("replay").addEventListener("click", () => {
      index = 0;
      score = 0;
      renderQuestion();
    });
    document.getElementById("goto-edit").addEventListener("click", () => setMode("edit"));
    if (typeof window.renderRanking === "function") {
      window.renderRanking(document.getElementById("ranking-panel"), score, bank.length);
    }
  }

  function formValues() {
    const pregunta = document.getElementById("q-text").value.trim();
    const opciones = [1, 2, 3, 4].map((n) => document.getElementById("opt-" + n).value.trim());
    const correcta = Number(document.getElementById("q-correct").value);
    const explicacion = document.getElementById("q-explain").value.trim();
    return { pregunta, opciones, correcta, explicacion };
  }

  function fillForm(q) {
    document.getElementById("q-text").value = q ? q.pregunta : "";
    [0, 1, 2, 3].forEach((i) => {
      document.getElementById("opt-" + (i + 1)).value = q ? q.opciones[i] || "" : "";
    });
    document.getElementById("q-correct").value = q ? String(q.correcta) : "0";
    document.getElementById("q-explain").value = q ? q.explicacion : "";
    document.getElementById("save-q").textContent = q ? "Guardar cambios" : "Crear pregunta";
  }

  function renderEditor() {
    if (!editorRoot) {
      return;
    }
    editorRoot.innerHTML = `
      <h2>Banco de preguntas</h2>
      <p class="muted">Las preguntas nuevas se guardan en este navegador. Sirve para ensayar en el colegio y sumar ítems del curso. “Restablecer” vuelve a las 12 preguntas originales.</p>
      <form class="form-grid" id="q-form">
        <label>Pregunta
          <textarea id="q-text" rows="2" required maxlength="240"></textarea>
        </label>
        <label>Opción A <input id="opt-1" required maxlength="120"></label>
        <label>Opción B <input id="opt-2" required maxlength="120"></label>
        <label>Opción C <input id="opt-3" required maxlength="120"></label>
        <label>Opción D <input id="opt-4" required maxlength="120"></label>
        <label>Respuesta correcta
          <select id="q-correct">
            <option value="0">A</option>
            <option value="1">B</option>
            <option value="2">C</option>
            <option value="3">D</option>
          </select>
        </label>
        <label>Explicación
          <textarea id="q-explain" rows="2" required maxlength="280"></textarea>
        </label>
        <p>
          <button class="btn btn-primary" id="save-q" type="submit">Crear pregunta</button>
          <button class="btn btn-ghost" id="cancel-q" type="button">Cancelar edición</button>
          <button class="btn btn-danger" id="reset-bank" type="button">Restablecer originales</button>
        </p>
      </form>
      <div class="bank-list" id="bank-list"></div>
    `;
    fillForm(null);
    const list = document.getElementById("bank-list");
    list.innerHTML = bank
      .map(
        (q, i) => `
      <article class="bank-item">
        <div>
          <strong>${i + 1}. ${escapeHtml(q.pregunta)}</strong>
          <p class="muted">Correcta: ${escapeHtml(q.opciones[q.correcta] || "")}</p>
        </div>
        <div class="bank-actions">
          <button class="btn btn-dark" type="button" data-edit="${escapeHtml(q.id)}">Editar</button>
          <button class="btn btn-danger" type="button" data-del="${escapeHtml(q.id)}">Eliminar</button>
        </div>
      </article>`
      )
      .join("");

    document.getElementById("q-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const data = formValues();
      if (data.opciones.some((opt) => !opt) || !data.pregunta || !data.explicacion) {
        alert("Completá la pregunta, las cuatro opciones y la explicación.");
        return;
      }
      if (editingId) {
        bank = bank.map((q) => (q.id === editingId ? { ...q, ...data } : q));
      } else {
        bank = bank.concat({ id: "c" + Date.now(), ...data });
      }
      saveBank(bank);
      editingId = "";
      renderEditor();
    });

    document.getElementById("cancel-q").addEventListener("click", () => {
      editingId = "";
      fillForm(null);
    });

    document.getElementById("reset-bank").addEventListener("click", () => {
      if (!confirm("¿Volver a las preguntas originales? Se borran las creadas en este navegador.")) {
        return;
      }
      localStorage.removeItem(STORAGE_KEY);
      bank = defaults();
      editingId = "";
      renderEditor();
    });

    list.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        editingId = btn.dataset.edit;
        fillForm(bank.find((q) => q.id === editingId));
        document.getElementById("q-text").focus();
      });
    });

    list.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.del;
        const q = bank.find((item) => item.id === id);
        if (!q || !confirm("¿Eliminar esta pregunta?")) {
          return;
        }
        bank = bank.filter((item) => item.id !== id);
        saveBank(bank);
        if (editingId === id) {
          editingId = "";
        }
        renderEditor();
      });
    });
  }

  document.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  setMode("play");
})();
