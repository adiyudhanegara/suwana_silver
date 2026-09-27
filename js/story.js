/*
 * Homepage scroll story, scene by scene.
 *
 * Scroll position picks a frame from a pre-rendered WebP sequence and
 * draws it on a <canvas>. When the visitor stops scrolling, the story
 * snaps to the next scene in the direction they were going, so each
 * swipe or wheel gesture plays one scene of the video.
 *
 * - Desktop: 120 frames, 1280x720 (frames/desktop/000.webp ... 119.webp)
 * - Phones (portrait): 60 frames, 540x720, cropped around the subject
 * - prefers-reduced-motion, or GSAP failing to load: nothing here runs and
 *   the scenes stay as plain sections with still frames.
 *
 * The <html> element gets the class "scrub" from an inline script in <head>
 * before first paint, so the layout does not jump.
 */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains("scrub")) return;

  var GSAP = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";
  var ST = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js";

  var story = document.querySelector(".story");
  var wrap = story.querySelector(".story-canvas-wrap");
  var canvas = document.getElementById("story-canvas");
  var ctx = canvas.getContext("2d");
  var bar = story.querySelector(".story-progress");
  var barFill = bar.querySelector("span");
  var cue = story.querySelector(".scroll-cue");
  var header = document.querySelector(".site-header");
  var navButtons = Array.prototype.slice.call(story.querySelectorAll("[data-go]"));

  var mobile = window.matchMedia("(max-width: 767px) and (orientation: portrait)").matches;
  var SET = mobile
    ? { dir: "frames/mobile/", count: 60, step: 2 }
    : { dir: "frames/desktop/", count: 120, step: 1 };

  // Scene stops. Time runs 0..TOTAL; each whole number is a scene where the
  // story comes to rest. `frame` is the source frame (0-119) shown there.
  var STOPS = [
    { name: "doorway", frame: 0 },
    { name: "workbench", frame: 30 },
    { name: "hands", frame: 54 },
    { name: "torch", frame: 72 },
    { name: "ring", frame: 116 },
    { name: "end", frame: 119 } // ring shrinks into the page, then unpins
  ];
  var TOTAL = STOPS.length - 1;
  var RING = TOTAL - 1;          // last resting scene
  var HEADER_SWITCH = RING + 0.35;
  var SCROLL_PER_SCENE = 1; // viewport heights of scroll per scene

  var scenes = Array.prototype.slice.call(story.querySelectorAll("[data-scene]")).map(function (el) {
    return { el: el, i: +el.getAttribute("data-scene"), lines: el.querySelectorAll("[data-line]") };
  });

  function frameAt(t) {
    var i = Math.min(TOTAL - 1, Math.max(0, Math.floor(t)));
    var p = Math.min(1, Math.max(0, t - i));
    return STOPS[i].frame + (STOPS[i + 1].frame - STOPS[i].frame) * p;
  }

  // Horizontal focus for desktop frames on screens narrower than 16:9.
  var FOCUS = [[0, .47], [30, .52], [45, .62], [85, .6], [92, .42], [102, .5], [105, .62], [119, .62]];
  function focusAt(f) {
    for (var i = 0; i < FOCUS.length - 1; i++) {
      var a = FOCUS[i], b = FOCUS[i + 1];
      if (f >= a[0] && f <= b[0]) {
        var t = (f - a[0]) / (b[0] - a[0]);
        t = t * t * (3 - 2 * t);
        return a[1] + (b[1] - a[1]) * t;
      }
    }
    return .5;
  }

  // ---- Frame loading: first frame now, then coarse to fine ----
  var images = new Array(SET.count);
  var loaded = new Array(SET.count);
  var loadedCount = 0;
  var current = 0;

  function src(i) { return SET.dir + String(i).padStart(3, "0") + ".webp"; }

  function loadFrame(i, done) {
    var img = new Image();
    img.decoding = "async";
    img.onload = function () {
      images[i] = img;
      loaded[i] = true;
      loadedCount++;
      barFill.style.width = (loadedCount / SET.count * 100) + "%";
      if (loadedCount === SET.count) bar.classList.add("is-done");
      if (Math.abs(current / SET.step - i) < 3) draw();
      done && done();
    };
    img.onerror = function () { done && done(); };
    img.src = src(i);
  }

  function loadAll() {
    var order = [], seen = { 0: 1 };
    [16, 8, 4, 2, 1].forEach(function (stride) {
      for (var i = 0; i < SET.count; i += stride) if (!seen[i]) { seen[i] = 1; order.push(i); }
    });
    var inFlight = 0;
    (function next() {
      while (inFlight < 6 && order.length) {
        inFlight++;
        loadFrame(order.shift(), function () { inFlight--; next(); });
      }
    })();
  }

  function nearestLoaded(i) {
    if (loaded[i]) return i;
    for (var d = 1; d < SET.count; d++) {
      if (loaded[i - d]) return i - d;
      if (loaded[i + d]) return i + d;
    }
    return -1;
  }

  // ---- Drawing ----
  var cw = 0, ch = 0;
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = Math.round(canvas.clientWidth * dpr);
    ch = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    draw();
  }

  // Draw the frame for `current`, blending the two nearest source frames
  // so motion stays smooth between the 12 fps frames of the video.
  function draw() {
    if (!cw) return;
    var pos = Math.min(SET.count - 1, current / SET.step);
    var a = Math.floor(pos), b = Math.min(SET.count - 1, a + 1), mix = pos - a;
    var ia = nearestLoaded(a);
    if (ia < 0) return;
    paint(images[ia], ia);
    if (mix > 0.02 && b !== a && loaded[b]) {
      ctx.globalAlpha = mix;
      paint(images[b], b);
      ctx.globalAlpha = 1;
    }
  }

  function paint(img, idx) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var scale = Math.max(cw / iw, ch / ih);
    var dw = iw * scale, dh = ih * scale;
    var fx = mobile ? .5 : focusAt(idx * SET.step);
    var dx = Math.min(0, Math.max(cw - dw, cw / 2 - dw * fx));
    ctx.drawImage(img, dx, (ch - dh) / 2, dw, dh);
  }

  // ---- Scene text: each scene is fully in at its stop, gone halfway to the next ----
  var activeScene = -1;
  function updateScenes(t) {
    scenes.forEach(function (s) {
      var d = t - s.i;
      var o;
      if (s.i === 0 && d < 0) o = 1;
      else o = 1 - Math.min(1, Math.max(0, (Math.abs(d) - 0.12) / 0.3));
      if (s.i === RING && d > 0) o = 1 - Math.min(1, Math.max(0, (d - 0.3) / 0.3)); // ring text leaves before the shrink
      s.el.style.opacity = o.toFixed(3);
      s.el.style.pointerEvents = o > 0.6 ? "auto" : "none";
      // lines drift up as they arrive, down as they leave
      var shift = (1 - o) * (d < 0 ? 40 : -24);
      for (var k = 0; k < s.lines.length; k++) {
        s.lines[k].style.transform = "translate3d(0," + (shift * (1 + k * 0.35)).toFixed(1) + "px,0)";
      }
    });

    var nearest = Math.min(RING, Math.round(t));
    if (nearest !== activeScene) {
      navButtons.forEach(function (b) {
        if (+b.getAttribute("data-go") === nearest) b.setAttribute("aria-current", "step");
        else b.removeAttribute("aria-current");
      });
      activeScene = nearest;
    }

    cue.style.opacity = Math.max(0, 1 - t * 3).toFixed(2);

    // Last step: the film shrinks into a framed picture on the light page.
    var e = Math.max(0, Math.min(1, t - RING));
    e = e * e * (3 - 2 * e);
    var inset = (e * 9).toFixed(2);
    var side = (e * (mobile ? 5 : 14)).toFixed(2);
    wrap.style.clipPath = e > 0 ? "inset(" + inset + "% " + side + "% " + inset + "% " + side + "% round " + (e * 6).toFixed(1) + "px)" : "";
    if (header) header.classList.toggle("is-over", t < HEADER_SWITCH);
  }

  // ---- Boot ----
  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = url; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function fallBackToStatic() {
    root.classList.remove("scrub");
    if (header) header.classList.remove("is-over");
    scenes.forEach(function (s) {
      s.el.style.opacity = ""; s.el.style.pointerEvents = "";
      for (var k = 0; k < s.lines.length; k++) s.lines[k].style.transform = "";
    });
  }

  loadFrame(0, function () { resize(); loadAll(); });
  window.addEventListener("resize", resize);
  updateScenes(0);

  loadScript(GSAP).then(function () { return loadScript(ST); }).then(function () {
    var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    var proxy = { t: 0 };
    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: story,
        start: "top top",
        end: function () { return "+=" + Math.round(window.innerHeight * TOTAL * SCROLL_PER_SCENE); },
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        snap: {
          snapTo: "labelsDirectional",
          inertia: false,
          duration: { min: 0.9, max: 1.8 },
          delay: 0.12,
          ease: "sine.inOut"
        },
        onLeave: function () { if (header) header.classList.remove("is-over"); },
        onEnterBack: function () { if (header) header.classList.toggle("is-over", proxy.t < HEADER_SWITCH); }
      },
      onUpdate: function () {
        var f = frameAt(proxy.t);
        if (f !== current) { current = f; draw(); }
        updateScenes(proxy.t);
      }
    });

    STOPS.forEach(function (s, i) { tl.addLabel(s.name, i); });
    tl.to(proxy, { t: TOTAL, duration: TOTAL }, 0);

    navButtons.forEach(function (b) {
      b.addEventListener("click", function () {
        var y = tl.scrollTrigger.labelToScroll(STOPS[+b.getAttribute("data-go")].name);
        window.scrollTo({ top: y + 1, behavior: "smooth" });
      });
    });

    initReveals(gsap, ScrollTrigger);
  }).catch(fallBackToStatic);

  // ---- Below the story: words brighten as you read, pictures open up ----
  function initReveals(gsap, ScrollTrigger) {
    document.querySelectorAll("[data-words]").forEach(function (p) {
      var words = p.textContent.trim().split(/\s+/);
      p.setAttribute("aria-label", p.textContent.trim());
      p.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true">' + w + "</span>"; }).join(" ");
      gsap.fromTo(p.querySelectorAll(".w"), { opacity: 0.16 }, {
        opacity: 1, stagger: 0.08, ease: "none",
        scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 45%", scrub: true }
      });
    });

    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      var img = el.querySelector("img");
      gsap.fromTo(el, { clipPath: "inset(18% 0% 0% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", ease: "none",
        scrollTrigger: { trigger: el, start: "top 95%", end: "top 45%", scrub: true }
      });
      if (img) gsap.fromTo(img, { scale: 1.18 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }
})();
