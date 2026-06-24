(function () {
  "use strict";

  var steps = {
    before: [
      { type: "day", text: "J-3 · Préparation du séjour" },
      {
        from: "hotel",
        time: "10:30",
        title: "Bonjour Claire,",
        text: "Votre arrivée aux Montagnettes approche. Vous pouvez préparer votre check-in mobile pour gagner du temps à la réception.",
        actions: ["Faire mon check-in mobile", "Ajouter une heure d’arrivée"]
      },
      {
        from: "client",
        time: "10:34",
        text: "Check-in terminé, arrivée prévue vers 18h30."
      }
    ],
    arrival: [
      { type: "day", text: "Jour J · Arrivée" },
      {
        from: "hotel",
        time: "17:15",
        title: "Votre arrivée est préparée.",
        text: "Votre check-in est bien enregistré. Votre parking est confirmé et la réception vous attend à partir de 18h30.",
        actions: ["Voir mon itinéraire", "Contacter la réception"]
      }
    ],
    stay: [
      { type: "day", text: "J+1 · Pendant le séjour" },
      {
        from: "hotel",
        time: "11:00",
        title: "Bonjour,",
        text: "Nous espérons que votre première nuit s’est bien passée. Souhaitez-vous que la réception vous propose un créneau spa ou une table au restaurant ce soir ?",
        actions: ["Voir le spa", "Réserver une table"]
      },
      {
        from: "client",
        time: "11:08",
        text: "Une table pour 4 à 20h si possible."
      }
    ],
    review: [
      { type: "day", text: "J+5 · Après le séjour" },
      {
        from: "hotel",
        time: "10:45",
        title: "Merci pour votre séjour.",
        text: "Nous espérons que votre expérience aux Montagnettes vous a plu. Si vous avez deux minutes, votre avis Google aide beaucoup nos équipes.",
        actions: ["Laisser un avis Google", "Répondre à l’équipe"]
      },
      {
        from: "client",
        time: "10:52",
        text: "Avec plaisir, merci pour l’accueil."
      }
    ]
  };

  var screen = document.querySelector(".chat-screen");
  var tabs = document.querySelectorAll("[data-step]");
  var next = document.querySelector(".next-message");
  var currentStep = "before";
  var visibleCount = 0;

  if (!screen || !tabs.length || !next) return;

  function createMessage(item) {
    if (item.type === "day") {
      var separator = document.createElement("div");
      separator.className = "day-separator";
      separator.textContent = item.text;
      return separator;
    }

    var message = document.createElement("article");
    message.className = "message " + item.from;

    if (item.title) {
      var strong = document.createElement("strong");
      strong.textContent = item.title;
      message.appendChild(strong);
    }

    var text = document.createElement("div");
    text.textContent = item.text;
    message.appendChild(text);

    if (item.actions) {
      var actions = document.createElement("div");
      actions.className = "message-actions";
      item.actions.forEach(function (label) {
        var button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        actions.appendChild(button);
      });
      message.appendChild(actions);
    }

    var time = document.createElement("span");
    time.className = "message-time";
    time.textContent = item.time;
    message.appendChild(time);

    return message;
  }

  function render(step, count) {
    var messages = steps[step] || steps.before;
    screen.innerHTML = "";
    messages.slice(0, count).forEach(function (item) {
      screen.appendChild(createMessage(item));
    });
    if (typeof screen.scrollTo === "function") {
      screen.scrollTo({ top: screen.scrollHeight, behavior: "smooth" });
    } else {
      screen.scrollTop = screen.scrollHeight;
    }
    next.textContent = count >= messages.length ? "Rejouer le scénario" : "Voir la suite";
  }

  function setStep(step) {
    currentStep = step;
    visibleCount = Math.min(2, steps[step].length);
    tabs.forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.step === step);
    });
    render(currentStep, visibleCount);
  }

  tabs.forEach(function (button) {
    button.addEventListener("click", function () {
      setStep(button.dataset.step);
    });
  });

  next.addEventListener("click", function () {
    var total = steps[currentStep].length;
    visibleCount = visibleCount >= total ? Math.min(2, total) : visibleCount + 1;
    render(currentStep, visibleCount);
  });

  setStep(currentStep);
})();
