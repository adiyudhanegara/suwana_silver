/* Homepage: fills the collection preview, class list and reviews from data/content.js. */
(function () {
  var S = window.SUWANA.sample;
  var L = window.SuwanaLayout;
  var esc = L.esc;

  function orderMessage(p) {
    return "Hello Suwana Silver, I would like to order the " + p.name + " (" + L.idr(p.priceIDR) + "). Is it available?";
  }

  var grid = document.getElementById("collection-preview");
  if (grid) {
    grid.innerHTML = S.products.filter(function (p) { return p.featured; }).slice(0, 6).map(function (p) {
      return (
        '<article class="product" data-sample="true">' +
        '<div class="ph" role="img" aria-label="Photo placeholder: ' + esc(p.photo) + '">Photo: ' + esc(p.photo) + "</div>" +
        "<h3>" + esc(p.name) + "</h3>" +
        '<p class="price">' + L.idr(p.priceIDR) + '<br><span class="usd">' + L.usd(p.priceIDR) + "</span></p>" +
        '<p class="muted">' + esc(p.technique) + "</p>" +
        '<a class="order" href="' + L.waLink(orderMessage(p)) + '">Order on WhatsApp<span class="visually-hidden">: ' + esc(p.name) + "</span></a>" +
        "</article>"
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
