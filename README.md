# Suwana Silver website

Static site: plain HTML, CSS and JavaScript, no build step. GSAP + ScrollTrigger load from jsDelivr.

- `index.html`: homepage with the scroll-scrubbed workshop story
- `data/content.js`: WhatsApp number, business details and all sample content (rendered with `data-sample="true"`)
- `js/layout.js`: shared header, footer and WhatsApp helpers
- `js/story.js`: canvas frame scrubbing
- `frames/desktop` (120 × 1280x720) and `frames/mobile` (60 × 540x720, cropped around the subject): WebP frames from the source video, with the sparkle watermark masked
- `img/key-*.webp`: four still frames used when `prefers-reduced-motion` is on

Run locally: `python3 -m http.server` and open http://localhost:8000.
