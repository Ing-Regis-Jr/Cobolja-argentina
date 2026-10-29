/* Mini-trivia reutilizable.
   Uso en una página:
     <div id="mini-trivia"></div>
     <script>window.MINI_TRIVIA = { preguntas: [ ... ] };</script>
     <script src="../js/mini-trivia.js"></script>
   Cada pregunta: { pregunta, opciones: [...], correcta: indice, explicacion } */
(function () {
  "use strict";

  const datos = window.MINI_TRIVIA;
  const raiz = document.getElementById("mini-trivia");

  if (!datos || !raiz || !Array.isArray(datos.preguntas) || datos.preguntas.length === 0) {
    return;
  }

  const preguntas = datos.preguntas;
  let indice = 0;
  let puntos = 0;

  function crear(etiqueta, clase, texto) {
    const nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
  }

  function mezclar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temporal = copia[i];
      copia[i] = copia[j];
      copia[j] = temporal;
    }
    return copia;
  }

  function mensajeFinal(porcentaje) {
    if (porcentaje === 100) {
      return "¡Excelente! Contestaste todo correctamente. Conocés muy bien este tema.";
    }
    if (porcentaje >= 60) {
      return "¡Buen trabajo! Ya reconocés varios datos importantes. Repasá las explicaciones e intentalo otra vez.";
    }
    if (porcentaje >= 20) {
      return "¡Es un buen comienzo! Volvé a explorar las tarjetas de esta sección y jugá de nuevo.";
    }
    return "¡Seguí aprendiendo! Recorré la sección con calma y volvé a intentarlo.";
  }

  function mostrarFinal() {
    const porcentaje = Math.round((puntos / preguntas.length) * 100);

    raiz.replaceChildren();
    raiz.appendChild(crear("p", "mt-progreso", "Trivia completada"));

    const resumen = crear("div", "mt-resumen");
    resumen.appendChild(crear("h3", "", "¡Este es tu resultado!"));
    resumen.appendChild(
      crear(
        "p",
        "",
        "Obtuviste " + puntos + " de " + preguntas.length + " respuestas correctas (" + porcentaje + "%)."
      )
    );
    resumen.appendChild(crear("p", "", mensajeFinal(porcentaje)));

    const reiniciar = crear("button", "btn btn-ghost", "Volver a jugar");
    reiniciar.type = "button";
    reiniciar.addEventListener("click", function () {
      indice = 0;
      puntos = 0;
      mostrarPregunta();
    });
    resumen.appendChild(reiniciar);

    raiz.appendChild(resumen);
  }

  function mostrarPregunta() {
    const actual = preguntas[indice];
    const esUltima = indice === preguntas.length - 1;
    let respondida = false;

    raiz.className = "mt-card";
    raiz.replaceChildren();
    raiz.appendChild(
      crear("p", "mt-progreso", "Pregunta " + (indice + 1) + " de " + preguntas.length)
    );

    const formulario = crear("form", "mt-form");
    const grupo = crear("fieldset", "mt-pregunta");
    grupo.appendChild(crear("legend", "", actual.pregunta));

    const lista = crear("div", "mt-opciones");
    const opciones = mezclar(
      actual.opciones.map(function (texto, i) {
        return { texto: texto, correcta: i === actual.correcta };
      })
    );

    opciones.forEach(function (opcion) {
      const etiqueta = crear("label", "mt-opcion");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "mt-respuesta";
      radio.value = opcion.correcta ? "ok" : "no";
      etiqueta.appendChild(radio);
      etiqueta.appendChild(crear("span", "", opcion.texto));
      lista.appendChild(etiqueta);
    });

    grupo.appendChild(lista);
    formulario.appendChild(grupo);

    const acciones = crear("div", "mt-acciones");
    const comprobar = crear("button", "btn btn-primary", "Comprobar respuesta");
    comprobar.type = "submit";

    const siguiente = crear(
      "button",
      "btn btn-ghost",
      esUltima ? "Ver resultado final" : "Siguiente pregunta"
    );
    siguiente.type = "button";
    siguiente.hidden = true;

    acciones.append(comprobar, siguiente);
    formulario.appendChild(acciones);

    const resultado = crear("p", "mt-resultado");
    resultado.setAttribute("role", "status");
    resultado.setAttribute("aria-live", "polite");
    formulario.appendChild(resultado);

    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();
      if (respondida) return;

      const elegida = formulario.querySelector('input[name="mt-respuesta"]:checked');

      if (!elegida) {
        resultado.textContent = "Elegí una opción antes de comprobar tu respuesta.";
        resultado.className = "mt-resultado error";
        return;
      }

      respondida = true;
      const acerto = elegida.value === "ok";

      formulario.querySelectorAll(".mt-opcion").forEach(function (etiqueta) {
        const radio = etiqueta.querySelector("input");
        radio.disabled = true;
        if (radio.value === "ok") {
          etiqueta.classList.add("es-correcta");
        } else if (radio.checked) {
          etiqueta.classList.add("es-incorrecta");
        }
      });

      if (acerto) {
        puntos++;
        resultado.textContent = "¡Muy bien! " + actual.explicacion;
        resultado.className = "mt-resultado ok";
      } else {
        resultado.textContent =
          "Esta vez no. La respuesta correcta era: «" +
          actual.opciones[actual.correcta] +
          "». " +
          actual.explicacion;
        resultado.className = "mt-resultado error";
      }

      comprobar.hidden = true;
      siguiente.hidden = false;
      siguiente.focus();
    });

    siguiente.addEventListener("click", function () {
      if (!respondida) return;
      if (esUltima) {
        mostrarFinal();
      } else {
        indice++;
        mostrarPregunta();
      }
    });

    raiz.appendChild(formulario);
  }

  mostrarPregunta();
})();
