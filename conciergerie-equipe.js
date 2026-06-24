(function () {
  "use strict";

  var hotel = document.querySelector("#staff-hotel");
  var moment = document.querySelector("#staff-moment");
  var language = document.querySelector("#staff-language");
  var name = document.querySelector("#staff-name");
  var notes = document.querySelector("#staff-notes");
  var output = document.querySelector("#staff-output");
  var generate = document.querySelector("#staff-generate");
  var copy = document.querySelector("#staff-copy");
  var reset = document.querySelector("#staff-reset");

  function services() {
    return Array.from(document.querySelectorAll("fieldset input:checked"))
      .map(function (input) { return input.value; });
  }

  function serviceText(items, lang) {
    var labels = {
      fr: { spa: "une expérience au spa", restaurant: "une table au restaurant", activity: "une activité locale", transfer: "un transfert" },
      en: { spa: "a spa experience", restaurant: "a restaurant table", activity: "a local activity", transfer: "a transfer" },
      es: { spa: "una experiencia de spa", restaurant: "una mesa en el restaurante", activity: "una actividad local", transfer: "un traslado" }
    };
    return items.map(function (item) { return labels[lang][item]; }).join(", ");
  }

  generate.addEventListener("click", function () {
    var lang = language.value;
    var client = name.value.trim() || (lang === "en" ? "Guest" : lang === "es" ? "Cliente" : "Madame, Monsieur");
    var offers = serviceText(services(), lang);
    var extra = notes.value.trim();
    var during = moment.value === "during";
    var after = moment.value === "after";

    if (lang === "en") {
      output.value = "Dear " + client + ",\n\n" +
        (after ? "We hope you enjoyed your stay at " : during ? "We hope you are enjoying your stay at " : "We look forward to welcoming you to ") +
        hotel.value + "." +
        (offers ? "\n\nOur team would be delighted to arrange " + offers + "." : "") +
        (extra ? "\n\nPersonal note: " + extra : "") +
        "\n\nPlease let us know if we may assist you further.\n\nKind regards,\nThe hotel team";
    } else if (lang === "es") {
      output.value = "Hola " + client + ",\n\n" +
        (after ? "Esperamos que haya disfrutado de su estancia en " : during ? "Esperamos que esté disfrutando de su estancia en " : "Nos complace darle pronto la bienvenida a ") +
        hotel.value + "." +
        (offers ? "\n\nNuestro equipo estará encantado de organizar " + offers + "." : "") +
        (extra ? "\n\nNota personalizada: " + extra : "") +
        "\n\nQuedamos a su disposición.\n\nAtentamente,\nEl equipo del hotel";
    } else {
      output.value = "Bonjour " + client + ",\n\n" +
        (after ? "Nous espérons que vous avez apprécié votre séjour à " : during ? "Nous espérons que votre séjour se déroule agréablement à " : "Nous sommes heureux de vous accueillir prochainement à ") +
        hotel.value + "." +
        (offers ? "\n\nNotre équipe serait ravie d’organiser " + offers + "." : "") +
        (extra ? "\n\nNote personnalisée : " + extra : "") +
        "\n\nNous restons à votre disposition.\n\nBien cordialement,\nL’équipe de l’hôtel";
    }
    copy.disabled = false;
  });

  copy.addEventListener("click", function () {
    if (!output.value) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(output.value);
    } else {
      output.select();
      document.execCommand("copy");
    }
    copy.textContent = "Copié";
    setTimeout(function () { copy.textContent = "Copier l’email"; }, 1300);
  });

  reset.addEventListener("click", function () {
    document.querySelectorAll("input[type='checkbox']").forEach(function (input) {
      input.checked = false;
    });
    name.value = "";
    notes.value = "";
    output.value = "";
    copy.disabled = true;
  });
})();
