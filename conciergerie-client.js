(function () {
  "use strict";

  var root = document.querySelector(".guest-concierge");
  var panel = document.querySelector(".guest-panel");
  var itemsBox = document.querySelector(".guest-items");
  var count = document.querySelector(".guest-count");
  var send = document.querySelector(".guest-send");
  var language = document.querySelector("#guest-language");
  var selections = [];

  var content = {
    fr: {
      spa: ["Le spa", "Une parenthèse de calme, imaginée selon votre rythme.", ["Massage relaxant", "Soin signature", "Accès à l’espace bien-être"]],
      restaurant: ["La table", "Notre équipe vous accompagne dans le choix de votre dîner.", ["Demander une table", "Découvrir le menu", "Préciser une préférence alimentaire"]],
      activities: ["Découvrir", "Quelques idées choisies autour de l’hôtel et selon la saison.", ["Balade à proximité", "Expérience en montagne", "Sortie en famille"]],
      team: ["La réception", "Nous sommes à votre écoute pour toute attention particulière.", ["Faire une demande", "Demander une assistance", "Organiser un transfert"]],
      add: "Choisir",
      remove: "Retirer",
      send: "Transmettre à la réception",
      sent: "Votre sélection est prête. La réception reviendra vers vous pour confirmer les disponibilités."
    },
    en: {
      spa: ["The spa", "A peaceful interlude, arranged around your own pace.", ["Relaxing massage", "Signature treatment", "Wellness area access"]],
      restaurant: ["The table", "Our team will help you choose the right dinner experience.", ["Request a table", "Discover the menu", "Share a dietary preference"]],
      activities: ["Discover", "A few selected ideas around the hotel and for the season.", ["Nearby walk", "Mountain experience", "Family outing"]],
      team: ["Reception", "We remain at your service for any special attention.", ["Make a request", "Ask for assistance", "Arrange a transfer"]],
      add: "Choose",
      remove: "Remove",
      send: "Send to reception",
      sent: "Your selection is ready. Reception will contact you to confirm availability."
    },
    es: {
      spa: ["El spa", "Un momento de calma organizado a su propio ritmo.", ["Masaje relajante", "Tratamiento exclusivo", "Acceso al espacio bienestar"]],
      restaurant: ["La mesa", "Nuestro equipo le acompañará para elegir su cena.", ["Solicitar una mesa", "Descubrir el menú", "Indicar una preferencia alimentaria"]],
      activities: ["Descubrir", "Algunas ideas seleccionadas cerca del hotel y según la temporada.", ["Paseo cercano", "Experiencia de montaña", "Salida familiar"]],
      team: ["Recepción", "Estamos a su disposición para cualquier atención especial.", ["Hacer una solicitud", "Pedir asistencia", "Organizar un traslado"]],
      add: "Elegir",
      remove: "Retirar",
      send: "Enviar a recepción",
      sent: "Su selección está lista. Recepción le contactará para confirmar la disponibilidad."
    }
  };

  function copy() {
    return content[language.value] || content.fr;
  }

  function renderSelection() {
    var texts = copy();
    itemsBox.innerHTML = "";
    if (!selections.length) {
      var empty = document.createElement("p");
      empty.className = "guest-empty";
      empty.textContent = language.value === "en" ? "No request added." : language.value === "es" ? "Ninguna solicitud añadida." : "Aucun souhait ajouté.";
      itemsBox.appendChild(empty);
    }
    selections.forEach(function (label) {
      var row = document.createElement("div");
      var text = document.createElement("span");
      var remove = document.createElement("button");
      row.className = "guest-item";
      text.textContent = label;
      remove.className = "guest-remove";
      remove.type = "button";
      remove.textContent = texts.remove;
      remove.addEventListener("click", function () {
        selections = selections.filter(function (item) { return item !== label; });
        renderSelection();
      });
      row.appendChild(text);
      row.appendChild(remove);
      itemsBox.appendChild(row);
    });
    count.textContent = selections.length + (selections.length > 1 ? " sélections" : " sélection");
    send.disabled = selections.length === 0;
    send.textContent = texts.send;
  }

  function renderService(type) {
    var texts = copy();
    var service = texts[type];
    panel.innerHTML = "<h2></h2><p></p><div class='guest-recommendations'></div>";
    panel.querySelector("h2").textContent = service[0];
    panel.querySelector("p").textContent = service[1];
    var list = panel.querySelector(".guest-recommendations");
    service[2].forEach(function (label) {
      var row = document.createElement("div");
      var text = document.createElement("span");
      var add = document.createElement("button");
      row.className = "guest-recommendation";
      text.textContent = label;
      add.type = "button";
      add.textContent = texts.add;
      add.addEventListener("click", function () {
        if (selections.indexOf(label) === -1) selections.push(label);
        renderSelection();
      });
      row.appendChild(text);
      row.appendChild(add);
      list.appendChild(row);
    });
  }

  document.querySelectorAll("[data-guest-service]").forEach(function (button) {
    button.addEventListener("click", function () {
      document.querySelectorAll("[data-guest-service]").forEach(function (item) {
        item.classList.remove("is-active");
      });
      button.classList.add("is-active");
      renderService(button.dataset.guestService);
    });
  });

  language.addEventListener("change", function () {
    var active = document.querySelector("[data-guest-service].is-active");
    if (active) renderService(active.dataset.guestService);
    renderSelection();
  });

  send.addEventListener("click", function () {
    alert(copy().sent + "\n\n" + selections.join("\n"));
  });

  renderSelection();
})();
