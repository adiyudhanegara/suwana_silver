/*
 * Class booking and commission forms. Neither form sends data anywhere:
 * submitting builds a WhatsApp message and opens it with wa.me.
 */
(function () {
  var S = window.SUWANA.sample;
  var L = window.SuwanaLayout;

  function val(form, name) {
    var el = form.elements[name];
    return el ? String(el.value || "").trim() : "";
  }

  function showErrors(form, problems) {
    var box = form.querySelector(".error");
    if (!problems.length) {
      box.classList.remove("is-shown");
      box.textContent = "";
      return true;
    }
    box.innerHTML = "Please check: " + problems.map(function (p) { return L.esc(p.text); }).join(" ");
    box.classList.add("is-shown");
    var first = form.elements[problems[0].field];
    if (first && first.focus) (first.length && !first.tagName ? first[0] : first).focus();
    return false;
  }

  function openWhatsApp(form, message) {
    var link = L.waLink(message);
    var note = form.querySelector(".form-sent");
    note.innerHTML = 'Opening WhatsApp. If nothing happens, <a href="' + link + '">open the message in WhatsApp</a>.';
    note.hidden = false;
    window.location.href = link;
  }

  function prettyDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  function todayISO() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  // ---- Class booking ----
  var book = document.getElementById("booking-form");
  if (book) {
    var typeSel = book.elements["class"];
    var people = book.elements["people"];
    var peopleHint = document.getElementById("people-hint");
    var pendant = document.getElementById("piece-pendant");
    var pieceHint = document.getElementById("piece-hint");

    typeSel.innerHTML = S.classes.map(function (c) {
      return '<option value="' + c.id + '">' + L.esc(c.name) + ", " + L.idr(c.priceIDR) + "</option>";
    }).join("");
    book.elements["date"].min = todayISO();

    var fromUrl = new URLSearchParams(location.search).get("class");
    if (fromUrl && S.classes.some(function (c) { return c.id === fromUrl; })) typeSel.value = fromUrl;

    function currentClass() {
      return S.classes.filter(function (c) { return c.id === typeSel.value; })[0];
    }

    function syncClass() {
      var c = currentClass();
      people.max = c.maxPeople;
      people.min = c.id === "couple" ? 2 : 1;
      if (c.id === "couple") {
        people.value = 2;
        people.readOnly = true;
        peopleHint.textContent = "The couple class is for 2 people.";
      } else {
        people.readOnly = false;
        if (+people.value > c.maxPeople || !people.value) people.value = c.id === "family" ? 3 : 1;
        peopleHint.textContent = c.maxPeople === 1 ? "The single class is for 1 person." : "Up to " + c.maxPeople + " people. Children can join from 7 years.";
      }
      if (c.id === "couple") {
        book.elements["piece"].value = "Ring";
        pendant.disabled = true;
        pieceHint.textContent = "In the couple class you make a pair of rings.";
      } else {
        pendant.disabled = false;
        pieceHint.textContent = c.id === "family" ? "Each person makes one piece. Tell us in the chat if some want a pendant." : "";
      }
    }
    typeSel.addEventListener("change", syncClass);
    syncClass();

    book.addEventListener("submit", function (e) {
      e.preventDefault();
      var c = currentClass();
      var problems = [];
      var date = val(book, "date");
      var n = parseInt(val(book, "people"), 10);
      if (!date) problems.push({ field: "date", text: "Choose a date for the class." });
      else if (date < todayISO()) problems.push({ field: "date", text: "Choose a date from today onwards." });
      if (!n || n < 1 || n > c.maxPeople) problems.push({ field: "people", text: "The " + c.name.toLowerCase() + " is for up to " + c.maxPeople + (c.maxPeople === 1 ? " person." : " people.") });
      if (!showErrors(book, problems)) return;

      var lines = [
        "Hello Suwana Silver, I would like to book a silver class.",
        "Class: " + c.name + " (" + L.idr(c.priceIDR) + ")",
        "Date: " + prettyDate(date),
        "People: " + n,
        "Making: " + (c.id === "couple" ? "A pair of rings" : val(book, "piece"))
      ];
      var name = val(book, "name");
      if (name) lines.push("Name: " + name);
      lines.push("Is this date available?");
      openWhatsApp(book, lines.join("\n"));
    });
  }

  // ---- Commission inquiry ----
  var com = document.getElementById("commission-form");
  if (com) {
    var fileInput = com.elements["reference"];
    var fileNote = document.getElementById("reference-note");
    fileInput.addEventListener("change", function () {
      fileNote.textContent = fileInput.files.length
        ? "Selected: " + fileInput.files[0].name + ". WhatsApp opens without it, so attach it in the chat after sending."
        : "";
    });

    var preset = new URLSearchParams(location.search).get("piece");
    if (preset) {
      var opt = Array.prototype.filter.call(com.elements["piece"].options, function (o) { return o.value.toLowerCase() === preset.toLowerCase(); })[0];
      if (opt) com.elements["piece"].value = opt.value;
    }

    com.addEventListener("submit", function (e) {
      e.preventDefault();
      var problems = [];
      if (!val(com, "piece")) problems.push({ field: "piece", text: "Choose the type of piece." });
      if (!val(com, "idea")) problems.push({ field: "idea", text: "Tell us a little about the piece." });
      if (!showErrors(com, problems)) return;

      var lines = [
        "Hello Suwana Silver, I would like to ask about a custom piece.",
        "Piece: " + val(com, "piece"),
        "Budget: " + val(com, "budget"),
        "Timeline: " + val(com, "timeline"),
        "Idea: " + val(com, "idea")
      ];
      if (fileInput.files.length) lines.push("I have a reference image (" + fileInput.files[0].name + ") and will send it in this chat.");
      var name = val(com, "name");
      if (name) lines.push("Name: " + name);
      var where = val(com, "country");
      if (where) lines.push("I live in: " + where);
      openWhatsApp(com, lines.join("\n"));
    });
  }
})();
