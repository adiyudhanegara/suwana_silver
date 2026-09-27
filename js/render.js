/* Fills any page with content from data/content.js: collection, classes, reviews. */
(function () {
  var S = window.SUWANA.sample;
  var L = window.SuwanaLayout;
  var esc = L.esc;

  var grid = document.getElementById("collection-preview");
  if (grid) {
    grid.innerHTML = S.products.map(L.productCard).join("");
  }

  var groups = document.getElementById("collection-groups");
  if (groups) {
    var TYPES = [
      { id: "rings", label: "Rings" },
      { id: "earrings", label: "Earrings" },
      { id: "pendants", label: "Pendants" },
      { id: "bracelets", label: "Bracelets" }
    ];
    groups.innerHTML = TYPES.map(function (t) {
      var items = S.products.filter(function (p) { return p.type === t.id; });
      if (!items.length) return "";
      return (
        '<section class="type-group" id="' + t.id + '" aria-labelledby="' + t.id + '-h">' +
        '<div class="wrap">' +
        '<h2 id="' + t.id + '-h">' + t.label + "</h2>" +
        '<div class="grid">' + items.map(L.productCard).join("") + "</div>" +
        "</div></section>"
      );
    }).join("");
  }

  var classes = document.getElementById("class-list");
  if (classes) {
    classes.innerHTML = S.classes.map(function (c) {
      return (
        '<li data-sample="true">' +
        "<h3>" + esc(c.name) + "</h3>" +
        '<span class="price">' + L.idr(c.priceIDR) + "</span>" +
        '<p class="details">' + esc(c.people) + ", " + esc(c.hours) + ". " + esc(c.makes) + ".</p>" +
        "</li>"
      );
    }).join("");
  }

  var includes = document.getElementById("class-includes");
  if (includes) {
    includes.textContent = "Every class includes " + S.classIncludes;
    includes.setAttribute("data-sample", "true");
  }

  var rating = document.getElementById("rating");
  if (rating) {
    rating.innerHTML = S.rating.score + " out of 5 on " + esc(S.rating.source) + ", from " + S.rating.count + " reviews.";
    rating.setAttribute("data-sample", "true");
  }

  var score = document.getElementById("score");
  if (score) {
    score.textContent = S.rating.score.toFixed(1);
    score.setAttribute("data-sample", "true");
  }

  // Horizontal collection strip: previous / next buttons.
  document.querySelectorAll("[data-strip]").forEach(function (btn) {
    var strip = document.getElementById(btn.getAttribute("aria-controls"));
    if (!strip) return;
    function update() {
      var max = strip.scrollWidth - strip.clientWidth - 2;
      document.querySelectorAll('[aria-controls="' + strip.id + '"]').forEach(function (b) {
        b.disabled = b.getAttribute("data-strip") === "-1" ? strip.scrollLeft <= 2 : strip.scrollLeft >= max;
      });
    }
    btn.addEventListener("click", function () {
      var card = strip.firstElementChild;
      var step = card ? card.getBoundingClientRect().width + 24 : strip.clientWidth * 0.8;
      strip.scrollBy({ left: step * +btn.getAttribute("data-strip"), behavior: "smooth" });
    });
    strip.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  var reviews = document.getElementById("reviews");
  if (reviews) {
    reviews.innerHTML = S.reviews.map(function (r) {
      var stars = new Array(r.stars + 1).join("★");
      return (
        '<figure class="review" data-sample="true">' +
        '<p class="stars"><span aria-hidden="true">' + stars + '</span><span class="visually-hidden">' + r.stars + " out of 5 stars</span></p>" +
        "<blockquote><p>" + esc(r.text) + "</p></blockquote>" +
        "<figcaption>" + esc(r.name) + "</figcaption>" +
        "</figure>"
      );
    }).join("");
  }
})();
