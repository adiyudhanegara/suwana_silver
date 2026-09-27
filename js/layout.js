/*
 * Shared header, footer and helpers for every page.
 * Needs data/content.js loaded first.
 */
(function () {
  var S = window.SUWANA;
  var B = S.business;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function waLink(message) {
    var url = "https://wa.me/" + S.WHATSAPP_NUMBER;
    return message ? url + "?text=" + encodeURIComponent(message) : url;
  }

  function idr(n) {
    return "IDR " + n.toLocaleString("en-US");
  }

  function usd(n) {
    return "about US$" + Math.round(n / S.IDR_PER_USD).toLocaleString("en-US");
  }

  var directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(B.mapQuery);
  var mapEmbedUrl = "https://www.google.com/maps?q=" + encodeURIComponent(B.mapQuery) + "&z=15&output=embed";

  var NAV = [
    { id: "collection", href: "collection.html", label: "Collection" },
    { id: "class", href: "class.html", label: "Silver class" },
    { id: "contact", href: "contact.html", label: "Visit and contact" }
  ];

  function header(current) {
    var links = NAV.map(function (n) {
      return '<li><a href="' + n.href + '"' + (n.id === current ? ' aria-current="page"' : "") + ">" + n.label + "</a></li>";
    }).join("");
    return (
      '<a class="skip-link" href="#main">Skip to content</a>' +
      '<header class="site-header"><div class="wrap">' +
      '<a class="logo" href="index.html"' + (current === "home" ? ' aria-current="page"' : "") + ">" + esc(B.name) + "</a>" +
      '<nav class="site-nav" id="site-nav" aria-label="Main"><ul>' + links + "</ul></nav>" +
      '<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>' +
      '<a class="btn btn-primary" href="class.html#book">Book a class</a>' +
      "</div></header>"
    );
  }

  function footer() {
    return (
      '<footer class="site-footer"><div class="wrap"><div class="cols">' +
      "<div>" +
      '<a class="logo" href="index.html">' + esc(B.name) + "</a>" +
      "<address>" + esc(B.address) + "</address>" +
      "<p>" + esc(B.hours) + "</p>" +
      "</div>" +
      '<nav aria-label="Footer"><ul>' +
      NAV.map(function (n) { return '<li><a href="' + n.href + '">' + n.label + "</a></li>"; }).join("") +
      "</ul></nav>" +
      "<ul>" +
      '<li><a href="' + waLink() + '">WhatsApp ' + esc(S.WHATSAPP_DISPLAY) + "</a></li>" +
      '<li><a href="https://instagram.com/' + esc(B.instagram) + '">Instagram @' + esc(B.instagram) + "</a></li>" +
      '<li><a href="mailto:' + esc(B.email) + '">' + esc(B.email) + "</a></li>" +
      "</ul>" +
      "</div>" +
      '<p class="fine">Handmade in Celuk since ' + B.founded + ", by the family of " + esc(B.founder) + ".</p>" +
      "</div></footer>"
    );
  }

  function mount(selector, html) {
    var el = document.querySelector(selector);
    if (el) el.outerHTML = html;
  }

  function initMenu() {
    var btn = document.querySelector(".menu-toggle");
    var nav = document.getElementById("site-nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "Menu";
        btn.focus();
      }
    });
  }

  // Fill any element marked data-fill="..." with business details.
  function fillBusiness() {
    var values = {
      address: B.address,
      hours: B.hours,
      whatsapp: S.WHATSAPP_DISPLAY,
      email: B.email,
      instagram: "@" + B.instagram
    };
    document.querySelectorAll("[data-fill]").forEach(function (el) {
      var v = values[el.getAttribute("data-fill")];
      if (v) el.textContent = v;
    });
    document.querySelectorAll("[data-wa]").forEach(function (el) {
      el.href = waLink(el.getAttribute("data-wa"));
    });
    document.querySelectorAll("[data-directions]").forEach(function (el) {
      el.href = directionsUrl;
    });
    document.querySelectorAll("iframe[data-map]").forEach(function (el) {
      el.src = mapEmbedUrl;
    });
  }

  window.SuwanaLayout = {
    esc: esc,
    waLink: waLink,
    idr: idr,
    usd: usd,
    render: function (current) {
      mount("[data-site-header]", header(current));
      mount("[data-site-footer]", footer());
      initMenu();
      fillBusiness();
    }
  };
})();
