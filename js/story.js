/*
 * Homepage scroll story.
 *
 * Scroll position picks a frame from a pre-rendered WebP sequence and draws
 * it on a <canvas>. The video never plays by itself.
 *
 * - Desktop: 120 frames, 1280x720 (frames/desktop/000.webp ... 119.webp)
 * - Phones (portrait): 60 frames, 540x720, pre-cropped around the subject
 *   (frames/mobile/000.webp ... 059.webp)
 * - prefers-reduced-motion, or GSAP failing to load: nothing here runs and
 *   the scenes stay as plain sections with four still frames.
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
  var canvas = document.getElementById("story-canvas");
  var ctx = canvas.getContext("2d");
  var bar = document.querySelector(".story-progress");
  var barFill = bar.querySelector("span");

  var mobile = window.matchMedia("(max-width: 767px) and (orientation: portrait)").matches;
  var SET = mobile
    ? { dir: "frames/mobile/", count: 60, step: 2 }
    : { dir: "frames/desktop/", count: 120, step: 1 };

  // Timeline, in "story seconds". Each segment maps a scroll span to a
  // span of source frames (0-119 at 12 fps). Slower segments get more
  // scroll so the text has time to be read.
  var SEGMENTS = [
    { t0: 0.0, t1: 1.6, f0: 0, f1: 24 },    // 1 Doorway
    { t0: 1.6, t1: 3.2, f0: 24, f1: 38 },   // 2 Workbench
    { t0: 3.2, t1: 6.2, f0: 38, f1: 74 },   // 3 Hands and torch
    { t0: 6.2, t1: 7.6, f0: 74, f1: 100 },  // 4 Fire flare
    { t0: 7.6, t1: 8.6, f0: 100, f1: 119 }, // 5 Ring reveal
    { t0: 8.6, t1: 9.4, f0: 119, f1: 119 }  //   hold on the ring
  ];
  var TOTAL = 9.4;
  var SCROLL_PER_SECOND = 0.8; // viewport heights of scroll per story second

  // Text overlays: [fade in start, fully in, fade out start, fully out]
  var SCENES = [
    { el: ".scene-doorway", at: [-1, 0, 1.1, 1.5] },
    { el: ".scene-workbench", at: [1.7, 1.9, 3.0, 3.2] },
    { el: ".scene-process", at: [3.3, 3.5, 6.0, 6.2] },
    { el: ".scene-ring", at: [8.0, 8.3, 99, 99] }
  ].map(function (s) { s.node = document.querySelector(s.el); return s; });

  var steps = Array.prototype.slice.call(document.querySelectorAll(".scene-process .steps li"));
  var STEPS_FROM = 3.4, STEPS_TO = 6.0;

  // Horizontal focus point for desktop frames when the screen is narrower
  // than 16:9 (keeps the doorway, the artisan's hands and the ring in view).
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

  function frameAt(t) {
    for (var i = 0; i < SEGMENTS.length; i++) {
      var s = SEGMENTS[i];
      if (t <= s.t1 || i === SEGMENTS.length - 1) {
        var p = Math.min(1, Math.max(0, (t - s.t0) / (s.t1 - s.t0)));
        return s.f0 + (s.f1 - s.f0) * p;
      }
    }
    return 0;
  }

  // ---- Frame loading ----
  var images = new Array(SET.count);
  var loaded = new Array(SET.count);
  var loadedCount = 0;

  function src(i) {
    return SET.dir + String(i).padStart(3, "0") + ".webp";
  }

  // Coarse to fine: every 16th frame first, then fill in, so scrubbing
  // works early and gets smoother as frames arrive.
  function loadOrder() {
    var order = [], seen = {};
    [16, 8, 4, 2, 1].forEach(function (stride) {
      for (var i = 0; i < SET.count; i += stride) {
        if (!seen[i]) { seen[i] = 1; order.push(i); }
      }
    });
    return order;
  }

  function loadFrame(i, done) {
    var img = new Image();
    img.decoding = "async";
    img.onload = function () {
      images[i] = img;
      loaded[i] = true;
      loadedCount++;
      barFill.style.width = (loadedCount / SET.count * 100) + "%";
      if (loadedCount === SET.count) bar.classList.add("is-done");
      if (Math.round(current / SET.step) === i || needsRedraw) draw();
      done && done();
    };
    img.onerror = function () { done && done(); };
    img.src = src(i);
  }

  function loadAll() {
    var queue = loadOrder().slice(1); // frame 0 is loaded first, on its own
    var inFlight = 0, MAX = 6;
    function next() {
      while (inFlight < MAX && queue.length) {
        inFlight++;
        loadFrame(queue.shift(), function () { inFlight--; next(); });
      }
    }
    next();
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
  var current = 0; // source frame, 0-119
  var needsRedraw = true;
  var cw = 0, ch = 0;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = Math.round(canvas.clientWidth * dpr);
    ch = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
    draw();
  }

  function draw() {
    var idx = nearestLoaded(Math.min(SET.count - 1, Math.round(current / SET.step)));
    if (idx < 0 || !cw) { needsRedraw = true; return; }
    needsRedraw = false;
    var img = images[idx];
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var scale = Math.max(cw / iw, ch / ih);
    var dw = iw * scale, dh = ih * scale;
    var fx = mobile ? .5 : focusAt(idx * SET.step);
    var dx = Math.min(0, Math.max(cw - dw, cw / 2 - dw * fx));
    var dy = (ch - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // ---- Text overlays ----
  function ramp(t, a) {
    if (t <= a[0] || t >= a[3]) return 0;
    if (t < a[1]) return (t - a[0]) / (a[1] - a[0]);
    if (t <= a[2]) return 1;
    return 1 - (t - a[2]) / (a[3] - a[2]);
  }

  var activeStep = -1;
  function updateText(t) {
    SCENES.forEach(function (s) {
      var o = ramp(t, s.at);
      s.node.style.opacity = o.toFixed(3);
      s.node.style.pointerEvents = o > 0.5 ? "auto" : "none";
    });
    var i = Math.floor((t - STEPS_FROM) / (STEPS_TO - STEPS_FROM) * steps.length);
    i = Math.max(0, Math.min(steps.length - 1, i));
    if (i !== activeStep) {
      steps.forEach(function (li, n) {
        li.classList.toggle("is-active", n === i);
        if (n === i) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      });
      activeStep = i;
    }
  }

  // ---- Boot ----
  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = url;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function fallBackToStatic() {
    root.classList.remove("scrub");
    SCENES.forEach(function (s) { s.node.style.opacity = ""; s.node.style.pointerEvents = ""; });
  }

  // First frame right away (it is also preloaded in <head>).
  loadFrame(0, function () { resize(); loadAll(); });
  window.addEventListener("resize", resize);
  updateText(0);

  loadScript(GSAP).then(function () { return loadScript(ST); }).then(function () {
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.config({ ignoreMobileResize: true });

    var proxy = { t: 0 };
    gsap.to(proxy, {
      t: TOTAL,
      ease: "none",
      scrollTrigger: {
        trigger: story,
        start: "top top",
        end: function () { return "+=" + Math.round(window.innerHeight * TOTAL * SCROLL_PER_SECOND); },
        pin: true,
        scrub: 0.3,
        anticipatePin: 1,
        invalidateOnRefresh: true
      },
      onUpdate: function () {
        var f = frameAt(proxy.t);
        if (Math.round(f / SET.step) !== Math.round(current / SET.step)) {
          current = f;
          draw();
        } else {
          current = f;
        }
        updateText(proxy.t);
      }
    });
  }).catch(fallBackToStatic);
})();
