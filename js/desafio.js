(function () {
  const datos = window.DATOS_IMPACTANTES || [];
  const mount = document.getElementById("desafio");
  if (!mount || !datos.length) {
    return;
  }

  mount.innerHTML = `
    <p>Tocá cada tarjeta para descubrir el dato. Hay ${datos.length} desafíos.</p>
    <div class="challenge-grid"></div>
  `;
  const grid = mount.querySelector(".challenge-grid");
  datos.forEach((item, i) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "flip-card";
    card.setAttribute("aria-expanded", "false");
    card.innerHTML = `
      <div class="flip-inner">
        <div class="flip-face flip-front">
          <p class="section-kicker" style="color:#74acdf">Dato ${i + 1}</p>
          <h3>${item.titulo}</h3>
          <p>Revelar</p>
        </div>
        <div class="flip-face flip-back">
          <p>${item.dato}</p>
          <p class="muted"><small>Fuente: ${item.fuente}</small></p>
        </div>
      </div>
    `;
    card.addEventListener("click", () => {
      card.classList.toggle("is-flipped");
      card.setAttribute("aria-expanded", card.classList.contains("is-flipped") ? "true" : "false");
    });
    grid.appendChild(card);
  });
})();
