/* Fills any page with content from data/content.js: collection, classes, reviews. */
(function () {
  var S = window.SUWANA.sample;
  var L = window.SuwanaLayout;
  var esc = L.esc;

  var grid = document.getElementById("collection-preview");
  if (grid) {
    grid.innerHTML = S.products.filter(function (p) { return p.featured; }).slice(0, 6).map(L.productCard).join("");
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
