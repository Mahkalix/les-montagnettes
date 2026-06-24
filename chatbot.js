(function () {
  "use strict";

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’‘`´]/g, "'")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function initConcierge(root) {
    if (root.dataset.maiConciergeReady === "true") return;
    root.dataset.maiConciergeReady = "true";

    var response = root.querySelector(".mai-concierge-response");
    var cart = root.querySelector(".mai-cart-items");
    var cartItems = [];
    if (!response || !cart) return;

    function renderCart() {
      cart.innerHTML = "";
      if (!cartItems.length) {
        var empty = document.createElement("span");
        empty.className = "mai-cart-empty";
        empty.textContent = "Aucune option ajoutée.";
        cart.appendChild(empty);
        return;
      }

      cartItems.forEach(function (item) {
        var row = document.createElement("div");
        var label = document.createElement("span");
        var remove = document.createElement("button");
        row.className = "mai-cart-item";
        label.textContent = item.label;
        remove.className = "mai-remove-cart";
        remove.type = "button";
        remove.textContent = "Retirer";
        remove.addEventListener("click", function () {
          cartItems = cartItems.filter(function (entry) {
            return entry.type !== item.type;
          });
          renderCart();
        });
        row.appendChild(label);
        row.appendChild(remove);
        cart.appendChild(row);
      });
    }

    root.querySelectorAll("[data-concierge]").forEach(function (button) {
      button.addEventListener("click", function () {
        var type = button.dataset.concierge;
        var lang = root.dataset.language || "fr";
        var links = {
          spa: root.dataset.spaUrl || "/spa/",
          restaurant: root.dataset.restaurantUrl || "/restaurant/",
          stay: root.dataset.resultsUrl || "/hebergements/"
        };
        var content = {
          fr: {
            stay: ["Je vous conseille de commencer par le type de séjour, l’hôtel et vos priorités.", "Préparer mon séjour"],
            spa: ["Une expérience spa peut enrichir votre séjour, sous réserve de disponibilité.", "Découvrir le spa"],
            restaurant: ["Nous pouvons vous suggérer une expérience au restaurant. La table reste à confirmer.", "Découvrir le restaurant"]
          },
          en: {
            stay: ["Start with your type of stay, preferred hotel and priorities.", "Plan my stay"],
            spa: ["A spa experience can enhance your stay, subject to availability.", "Discover the spa"],
            restaurant: ["We can suggest a restaurant experience. The table remains subject to confirmation.", "Discover the restaurant"]
          },
          es: {
            stay: ["Empiece por el tipo de estancia, el hotel y sus prioridades.", "Preparar mi estancia"],
            spa: ["Una experiencia de spa puede enriquecer su estancia, sujeta a disponibilidad.", "Descubrir el spa"],
            restaurant: ["Podemos sugerirle una experiencia en el restaurante. La mesa debe confirmarse.", "Descubrir el restaurante"]
          }
        };
        var selectedContent = content[lang] || content.fr;
        response.innerHTML = "";
        response.appendChild(document.createTextNode(selectedContent[type][0]));
        var link = document.createElement("a");
        link.href = links[type];
        link.textContent = selectedContent[type][1];
        response.appendChild(document.createElement("br"));
        response.appendChild(link);

        if (type === "spa" || type === "restaurant") {
          var actions = document.createElement("div");
          var add = document.createElement("button");
          actions.className = "mai-offer-actions";
          add.className = "mai-add-offer";
          add.type = "button";
          add.textContent = lang === "en"
            ? (type === "spa" ? "Add spa experience" : "Add restaurant")
            : lang === "es"
              ? (type === "spa" ? "Añadir experiencia spa" : "Añadir restaurante")
              : (type === "spa" ? "Ajouter l’expérience spa" : "Ajouter le restaurant");
          add.addEventListener("click", function () {
            if (!cartItems.some(function (item) { return item.type === type; })) {
              cartItems.push({
                type: type,
                label: type === "spa" ? "Expérience spa à confirmer" : "Table au restaurant à confirmer"
              });
            }
            renderCart();
          });
          actions.appendChild(add);
          response.appendChild(actions);
        }
      });
    });

  }

  function init(root) {
    if (root.dataset.maiExternalReady === "true") return;
    root.dataset.maiExternalReady = "true";

    var status = root.querySelector(".mai-status");
    var toggle = root.querySelector(".mai-toggle");
    var input = root.querySelector(".mai-input");
    var form = root.querySelector(".mai-search-form");
    var guide = root.querySelector(".mai-guide");
    var steps = root.querySelectorAll(".mai-guide-step");
    var results = root.querySelector(".mai-results");
    var loading = root.querySelector(".mai-loading");
    var criteria = root.querySelector(".mai-criteria");
    var personaName = root.querySelector(".mai-persona-name");
    var personaSummary = root.querySelector(".mai-persona-summary");
    var viewLink = root.querySelector(".mai-view");
    var chatBody = root.querySelector(".mai-chat-body");
    var language = root.querySelector(".mai-language");
    var conciergeLink = root.querySelector(".mai-page-concierge-link");
    var conciergeQrLink = root.querySelector(".mai-concierge-qr-link");
    var conciergeQrImage = root.querySelector(".mai-concierge-qr-img");
    var selectionSummary = root.querySelector(".mai-selection-summary");
    var selectionChips = root.querySelector(".mai-selection-chips");

    if (!status || !toggle || !form || !input) return;

    status.innerHTML = "<i></i> Assistant Les Montagnettes · En ligne";
    root.classList.add("is-ready");
    root.dataset.language = "fr";
    var conciergeUrl = root.dataset.conciergeUrl || "conciergerie-client.html";
    var absoluteConciergeUrl = new URL(conciergeUrl, window.location.href).href;
    if (conciergeLink) {
      conciergeLink.href = conciergeUrl;
    }
    if (conciergeQrLink && conciergeQrImage) {
      conciergeQrLink.href = conciergeUrl;
      conciergeQrImage.src =
        "https://api.qrserver.com/v1/create-qr-code/?size=216x216&margin=12&data=" +
        encodeURIComponent(absoluteConciergeUrl);
    }

    var translations = {
      fr: {
        status: "Assistant Les Montagnettes · En ligne",
        greeting: "Bonjour ! Je suis l’assistant Les Montagnettes. Je peux vous conseiller, préparer une demande de séjour ou vous orienter vers notre équipe.",
        placeholder: "Écrivez votre demande...",
        launcher: "Besoin d’aide ?",
        services: ["Disponibilités", "Questions fréquentes", "Spa & restaurant", "Check-in mobile", "Parler à l’équipe"],
        concierge: ["Votre séjour", "La conciergerie"],
        cancel: "Annuler",
        selection: "Votre sélection",
        loading: "J’analyse votre demande...",
        resultTitle: "Voici ce que j’ai compris :",
        controlNote: "Vous pouvez modifier ces critères avant de continuer.",
        actions: {
          restart: "Recommencer",
          edit: "Modifier",
          view: "Voir les hébergements"
        },
        privacy: {
          text: "Assistant Les Montagnettes · Ne partagez pas de données sensibles.",
          link: "Confidentialité"
        },
        guide: {
          persona: { question: "Pour quel type de séjour ?" },
          room: { question: "Quel hébergement préférez-vous ?" },
          destination: { question: "Quel hôtel souhaitez-vous découvrir ?" },
          moment: { question: "Quand se déroule le séjour ?" },
          priorities: { question: "Qu’est-ce qui compte le plus ?", help: "Plusieurs choix possibles", continue: "Voir ma sélection" }
        },
        guideChoices: {
          persona: {
            business: { text: "💼 Business", label: "Déplacement professionnel" },
            couple: { text: "♡ Couple", label: "Séjour en couple" },
            senior: { text: "♜ Retraité actif", label: "Séjour confortable pour retraité actif" },
            family: { text: "⌂ Famille", label: "Séjour en famille" }
          },
          room: {
            hotel: { text: "Chambre d’hôtel", label: "une chambre d’hôtel" },
            apartment: { text: "Appartement", label: "un appartement" },
            residence: { text: "Résidence", label: "une résidence hôtelière" },
            chalet: { text: "Chalet", label: "un chalet" }
          },
          destination: {
            "villa-caroline": { text: "La Villa Caroline", label: "à La Villa Caroline" },
            "parc-victoria": { text: "Parc Victoria", label: "au Parc Victoria, Pays basque" },
            "excelsior-chamonix": { text: "Hôtel Excelsior", label: "à l’Hôtel Excelsior, Chamonix" },
            flexible: { text: "Me conseiller", label: "dans l’hôtel le plus adapté" }
          },
          moment: {
            weekday: { text: "En semaine · Loisirs", label: "en semaine, pour un séjour loisirs" },
            weekend: { text: "Week-end · Business", label: "le week-end, pour un séjour business" }
          }
        },
        priorities: {
          parking: "Parking",
          wifi: "Wi-Fi",
          spa: "Spa",
          ski: "Proche des pistes",
          breakfast: "Petit-déjeuner",
          view: "Vue montagne",
          kids: "Adapté aux enfants",
          invoice: "Facture entreprise"
        },
        specialLabels: {
          weekdayLeisure: "Séjour loisirs en semaine",
          weekendBusiness: "Séjour business le week-end"
        }
      },
      en: {
        status: "Les Montagnettes assistant · Online",
        greeting: "Hello! I’m Les Montagnettes’ assistant. I can recommend a stay, prepare a booking request or connect you with our team.",
        placeholder: "Write your request...",
        launcher: "Need help?",
        services: ["Availability", "Frequently asked questions", "Spa & restaurant", "Mobile check-in", "Speak to our team"],
        concierge: ["Your stay", "Concierge"],
        cancel: "Remove",
        selection: "Your selection",
        loading: "I’m reviewing your request...",
        resultTitle: "Here is what I understood:",
        controlNote: "You can adjust these criteria before continuing.",
        actions: {
          restart: "Start again",
          edit: "Edit",
          view: "View stays"
        },
        privacy: {
          text: "Les Montagnettes assistant · Do not share sensitive data.",
          link: "Privacy"
        },
        guide: {
          persona: { question: "What type of stay are you planning?" },
          room: { question: "What accommodation would you prefer?" },
          destination: { question: "Which hotel would you like to discover?" },
          moment: { question: "When will the stay take place?" },
          priorities: { question: "What matters most?", help: "Several choices possible", continue: "View my selection" }
        },
        guideChoices: {
          persona: {
            business: { text: "💼 Business", label: "Business trip" },
            couple: { text: "♡ Couple", label: "Couple stay" },
            senior: { text: "♜ Active senior", label: "Comfortable active senior stay" },
            family: { text: "⌂ Family", label: "Family stay" }
          },
          room: {
            hotel: { text: "Hotel room", label: "a hotel room" },
            apartment: { text: "Apartment", label: "an apartment" },
            residence: { text: "Residence", label: "a serviced residence" },
            chalet: { text: "Chalet", label: "a chalet" }
          },
          destination: {
            "villa-caroline": { text: "La Villa Caroline", label: "at La Villa Caroline" },
            "parc-victoria": { text: "Parc Victoria", label: "at Parc Victoria, Basque Country" },
            "excelsior-chamonix": { text: "Hôtel Excelsior", label: "at Hôtel Excelsior, Chamonix" },
            flexible: { text: "Advise me", label: "in the most suitable hotel" }
          },
          moment: {
            weekday: { text: "Weekday · Leisure", label: "during the week, for a leisure stay" },
            weekend: { text: "Weekend · Business", label: "at the weekend, for a business stay" }
          }
        },
        priorities: {
          parking: "Parking",
          wifi: "Wi-Fi",
          spa: "Spa",
          ski: "Near the slopes",
          breakfast: "Breakfast",
          view: "Mountain view",
          kids: "Child-friendly",
          invoice: "Company invoice"
        },
        specialLabels: {
          weekdayLeisure: "Leisure stay during the week",
          weekendBusiness: "Business stay at the weekend"
        }
      },
      es: {
        status: "Asistente Les Montagnettes · En línea",
        greeting: "¡Hola! Soy el asistente de Les Montagnettes. Puedo recomendarle una estancia, preparar una solicitud o ponerle en contacto con nuestro equipo.",
        placeholder: "Escriba su solicitud...",
        launcher: "¿Necesita ayuda?",
        services: ["Disponibilidad", "Preguntas frecuentes", "Spa y restaurante", "Check-in móvil", "Hablar con el equipo"],
        concierge: ["Su estancia", "Conserjería"],
        cancel: "Quitar",
        selection: "Su selección",
        loading: "Estoy revisando su solicitud...",
        resultTitle: "Esto es lo que he entendido:",
        controlNote: "Puede modificar estos criterios antes de continuar.",
        actions: {
          restart: "Empezar de nuevo",
          edit: "Modificar",
          view: "Ver alojamientos"
        },
        privacy: {
          text: "Asistente Les Montagnettes · No comparta datos sensibles.",
          link: "Privacidad"
        },
        guide: {
          persona: { question: "¿Qué tipo de estancia busca?" },
          room: { question: "¿Qué alojamiento prefiere?" },
          destination: { question: "¿Qué hotel desea descubrir?" },
          moment: { question: "¿Cuándo será la estancia?" },
          priorities: { question: "¿Qué es lo más importante?", help: "Puede elegir varias opciones", continue: "Ver mi selección" }
        },
        guideChoices: {
          persona: {
            business: { text: "💼 Negocios", label: "Viaje de negocios" },
            couple: { text: "♡ Pareja", label: "Estancia en pareja" },
            senior: { text: "♜ Jubilado activo", label: "Estancia cómoda para jubilado activo" },
            family: { text: "⌂ Familia", label: "Estancia en familia" }
          },
          room: {
            hotel: { text: "Habitación de hotel", label: "una habitación de hotel" },
            apartment: { text: "Apartamento", label: "un apartamento" },
            residence: { text: "Residencia", label: "una residencia hotelera" },
            chalet: { text: "Chalet", label: "un chalet" }
          },
          destination: {
            "villa-caroline": { text: "La Villa Caroline", label: "en La Villa Caroline" },
            "parc-victoria": { text: "Parc Victoria", label: "en Parc Victoria, País Vasco" },
            "excelsior-chamonix": { text: "Hôtel Excelsior", label: "en Hôtel Excelsior, Chamonix" },
            flexible: { text: "Aconséjeme", label: "en el hotel más adecuado" }
          },
          moment: {
            weekday: { text: "Entre semana · Ocio", label: "entre semana, para una estancia de ocio" },
            weekend: { text: "Fin de semana · Negocios", label: "el fin de semana, para una estancia de negocios" }
          }
        },
        priorities: {
          parking: "Parking",
          wifi: "Wi-Fi",
          spa: "Spa",
          ski: "Cerca de las pistas",
          breakfast: "Desayuno",
          view: "Vista a la montaña",
          kids: "Adaptado a niños",
          invoice: "Factura de empresa"
        },
        specialLabels: {
          weekdayLeisure: "Estancia de ocio entre semana",
          weekendBusiness: "Estancia de negocios el fin de semana"
        }
      }
    };

    function applyLanguage(lang) {
      var copy = translations[lang] || translations.fr;
      root.dataset.language = lang;
      status.innerHTML = "<i></i> " + copy.status;
      root.querySelector(".mai-chat-body .mai-bubble-bot").textContent = copy.greeting;
      input.placeholder = copy.placeholder;
      root.querySelector(".mai-launcher-text").textContent = copy.launcher;
      root.querySelectorAll("[data-service]").forEach(function (button, index) {
        button.textContent = copy.services[index];
      });
      root.querySelectorAll(".mai-guide-step").forEach(function (step) {
        var stepCopy = copy.guide[step.dataset.step];
        if (!stepCopy) return;
        var question = step.querySelector(".mai-guide-question");
        var help = step.querySelector(".mai-guide-help");
        if (question) question.textContent = stepCopy.question;
        if (help && stepCopy.help) help.textContent = stepCopy.help;
      });
      root.querySelectorAll("[data-guide]").forEach(function (button) {
        var item = copy.guideChoices[button.dataset.guide] &&
          copy.guideChoices[button.dataset.guide][button.dataset.value];
        if (!item) return;
        button.textContent = item.text;
        button.dataset.label = item.label;
      });
      root.querySelectorAll("[data-priority]").forEach(function (button) {
        button.textContent = copy.priorities[button.dataset.priority] || button.textContent;
      });
      root.querySelector(".mai-guide-continue").textContent = copy.guide.priorities.continue;
      root.querySelector(".mai-selection-summary > span").textContent = copy.selection;
      root.querySelector(".mai-loading p").textContent = copy.loading;
      root.querySelector(".mai-result-title").textContent = copy.resultTitle;
      root.querySelector(".mai-control-note").textContent = copy.controlNote;
      root.querySelector(".mai-restart").textContent = copy.actions.restart;
      root.querySelector(".mai-edit").textContent = copy.actions.edit;
      root.querySelector(".mai-view").textContent = copy.actions.view;
      root.querySelector(".mai-privacy").innerHTML =
        copy.privacy.text + ' <a class="mai-privacy-link" href="' +
        (root.dataset.privacyUrl || "/politique-de-confidentialite/") +
        '">' + copy.privacy.link + "</a>";
      if (conciergeLink) {
        conciergeLink.innerHTML =
          "<span>" + copy.concierge[0] + "</span>" + copy.concierge[1];
      }
      if (choices) {
        ["persona", "room", "destination", "moment"].forEach(function (type) {
          if (choices[type]) {
            var choiceCopy = copy.guideChoices[type][choices[type].value];
            if (choiceCopy) choices[type].label = choiceCopy.label;
          }
        });
        choices.priorities = Array.from(root.querySelectorAll("[data-priority].is-selected")).map(function (button) {
          return button.textContent.trim();
        });
        renderSelection();
      }
    }

    language.addEventListener("change", function () {
      applyLanguage(language.value);
    });

    var choices = {
      persona: null,
      room: null,
      destination: null,
      moment: null,
      priorities: []
    };

    var hotels = {
      "villa-caroline": {
        name: "La Villa Caroline",
        place: "Collection depuis décembre 2023",
        audiences: "Clientèles française et suisse",
        languages: "Français"
      },
      "parc-victoria": {
        name: "Parc Victoria",
        place: "Côte Ouest · Pays basque · Juillet 2025",
        audiences: "Clientèles française, espagnole et anglo-saxonne",
        languages: "Français · Español · English"
      },
      "excelsior-chamonix": {
        name: "Hôtel Excelsior",
        place: "Chamonix · Nouvel établissement",
        audiences: "Clientèles française, anglaise et asiatique",
        languages: "Français · English · 中文"
      }
    };

    var profiles = {
      business: {
        name: "Déplacement professionnel",
        summary: "Une recherche rapide avec les services essentiels au séjour professionnel.",
        defaults: ["Wi-Fi performant", "Parking", "Facture entreprise", "Annulation flexible"]
      },
      couple: {
        name: "Escapade en couple",
        summary: "Un séjour élégant à deux, centré sur le confort et le cadre.",
        defaults: ["Confort prioritaire", "Vue montagne", "Spa & bien-être", "Petit-déjeuner"]
      },
      senior: {
        name: "Confort & montagne",
        summary: "Un séjour clair et rassurant avec un accès simple et un bon niveau de confort.",
        defaults: ["Confort prioritaire", "Accès facile", "Parking", "Petit-déjeuner"]
      },
      family: {
        name: "Séjour en famille",
        summary: "Un séjour pratique et confortable adapté aux besoins des parents et des enfants.",
        defaults: ["Adapté aux enfants", "Cuisine équipée", "Parking", "Proche des pistes"]
      }
    };

    function showStep(name) {
      steps.forEach(function (step) {
        step.classList.toggle("is-active", step.dataset.step === name);
      });
      chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }

    function renderSelection() {
      selectionChips.innerHTML = "";
      var entries = [];

      ["persona", "room", "destination", "moment"].forEach(function (type) {
        if (choices[type]) entries.push({
          type: type,
          label: choices[type].label
        });
      });

      choices.priorities.forEach(function (label) {
        entries.push({ type: "priority", label: label });
      });

      selectionSummary.hidden = entries.length === 0;

      entries.forEach(function (entry) {
        var chip = document.createElement("span");
        var text = document.createElement("span");
        var remove = document.createElement("button");
        chip.className = "mai-selection-chip";
        text.textContent = entry.label;
        remove.type = "button";
        remove.setAttribute("aria-label", "Annuler " + entry.label);
        remove.textContent = "×";
        remove.addEventListener("click", function () {
          if (entry.type === "priority") {
            choices.priorities = choices.priorities.filter(function (label) {
              return label !== entry.label;
            });
            root.querySelectorAll("[data-priority]").forEach(function (button) {
              if (button.textContent.trim() === entry.label) {
                button.classList.remove("is-selected");
              }
            });
          } else {
            choices[entry.type] = null;
            if (entry.type === "persona") {
              choices.room = null;
              choices.destination = null;
              choices.moment = null;
              showStep("persona");
            } else if (entry.type === "room") {
              choices.destination = null;
              choices.moment = null;
              showStep("room");
            } else if (entry.type === "destination") {
              choices.moment = null;
              showStep("destination");
            } else {
              showStep("moment");
            }
          }
          renderSelection();
        });
        chip.appendChild(text);
        chip.appendChild(remove);
        selectionChips.appendChild(chip);
      });
    }

    function addUserMessage(text) {
      var line = document.createElement("div");
      var bubble = document.createElement("div");
      line.className = "mai-user-line";
      bubble.className = "mai-bubble mai-bubble-user";
      bubble.textContent = text;
      line.appendChild(bubble);
      chatBody.insertBefore(line, loading);
    }

    function showResult(profileId, labels) {
      var profile = profiles[profileId] || profiles.senior;
      var hotel = choices.destination && hotels[choices.destination.value];
      personaName.textContent = profile.name;
      personaSummary.textContent = profile.summary +
        (hotel
          ? " Hôtel conseillé : " + hotel.name + " — " + hotel.place +
            ". " + hotel.audiences + ". Accueil : " + hotel.languages + "."
          : "");
      criteria.innerHTML = "";

      labels.concat(profile.defaults).filter(function (label, index, list) {
        return label && list.indexOf(label) === index;
      }).slice(0, 8).forEach(function (label) {
        var tag = document.createElement("span");
        tag.className = "mai-criterion";
        tag.textContent = label;
        criteria.appendChild(tag);
      });

      var base = root.dataset.resultsUrl || "/hebergements/";
      var separator = base.indexOf("?") === -1 ? "?" : "&";
      viewLink.href = base + separator +
        "profil=" + encodeURIComponent(profileId) +
        "&criteres=" + encodeURIComponent(labels.join(","));
      if (choices.destination) {
        viewLink.href += "&hotel=" + encodeURIComponent(choices.destination.value);
      }
      if (choices.moment) {
        viewLink.href += "&moment=" + encodeURIComponent(choices.moment.value);
      }

      loading.hidden = true;
      results.hidden = false;
      guide.hidden = true;
      chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }

    function analyzeText(text) {
      var normalized = normalizeText(text);
      var profile = /professionnel|business|travail|facture|collegue/.test(normalized)
        ? "business"
        : /famille|enfant/.test(normalized)
          ? "family"
          : /couple|romantique|amoureux/.test(normalized)
            ? "couple"
            : "senior";
      var labels = [];
      [
        ["parking", "Parking"],
        ["wifi", "Wi-Fi performant"],
        ["wi-fi", "Wi-Fi performant"],
        ["spa", "Spa & bien-être"],
        ["piste", "Proche des pistes"],
        ["petit-dejeuner", "Petit-déjeuner"],
        ["petit dejeuner", "Petit-déjeuner"],
        ["vue", "Vue montagne"],
        ["facture", "Facture entreprise"],
        ["restaurant", "Restaurant"],
        ["detente", "Spa & bien-être"],
        ["bien-etre", "Spa & bien-être"]
      ].forEach(function (entry) {
        if (normalized.indexOf(entry[0]) !== -1) labels.push(entry[1]);
      });
      return { profile: profile, labels: labels };
    }

    root.querySelectorAll("[data-guide]").forEach(function (button) {
      button.addEventListener("click", function () {
        var type = button.dataset.guide;
        choices[type] = {
          value: button.dataset.value,
          label: button.dataset.label
        };
        renderSelection();
        addUserMessage(button.textContent.trim());
        if (type === "persona") showStep("room");
        if (type === "room") showStep("destination");
        if (type === "destination") showStep("moment");
        if (type === "moment") {
          if (button.dataset.value === "weekday" && choices.persona && choices.persona.value === "business") {
            choices.persona = {
              value: "senior",
              label: "Séjour loisirs en semaine"
            };
          }
          if (button.dataset.value === "weekend") {
            choices.persona = {
              value: "business",
              label: "Séjour business le week-end"
            };
          }
          renderSelection();
          showStep("priorities");
        }
      });
    });

    root.querySelectorAll("[data-priority]").forEach(function (button) {
      button.addEventListener("click", function () {
        button.classList.toggle("is-selected");
        var label = button.textContent.trim();
        if (button.classList.contains("is-selected")) {
          if (choices.priorities.indexOf(label) === -1) choices.priorities.push(label);
        } else {
          choices.priorities = choices.priorities.filter(function (item) {
            return item !== label;
          });
        }
        renderSelection();
      });
    });

    root.querySelector(".mai-guide-continue").addEventListener("click", function () {
      if (!choices.persona || !choices.room || !choices.destination || !choices.moment) {
        showStep(
          !choices.persona ? "persona" :
          !choices.room ? "room" :
          !choices.destination ? "destination" : "moment"
        );
        return;
      }
      loading.hidden = false;
      addUserMessage(
        choices.persona.label + ", " +
        choices.room.label + " " +
        choices.destination.label + ", " +
        choices.moment.label
      );
      window.setTimeout(function () {
        showResult(
          choices.persona.value,
          [choices.room.label, choices.destination.label, choices.moment.label].concat(choices.priorities)
        );
      }, 350);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = input.value.trim();
      if (!value) {
        input.focus();
        return;
      }
      addUserMessage(value);
      input.value = "";
      loading.hidden = false;
      results.hidden = true;
      guide.hidden = true;
      var analysis = analyzeText(value);
      window.setTimeout(function () {
        showResult(analysis.profile, analysis.labels);
      }, 350);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });

    root.querySelector(".mai-restart").addEventListener("click", function () {
      choices = { persona: null, room: null, destination: null, moment: null, priorities: [] };
      root.querySelectorAll(".is-selected").forEach(function (button) {
        button.classList.remove("is-selected");
      });
      results.hidden = true;
      loading.hidden = true;
      guide.hidden = false;
      renderSelection();
      showStep("persona");
    });

    toggle.addEventListener("change", function () {
      if (toggle.checked) window.setTimeout(function () { input.focus(); }, 100);
    });
  }

  function initAll() {
    document.querySelectorAll(".montagnettes-ai-module").forEach(init);
  }

  window.initMontagnettesAI = initAll;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
