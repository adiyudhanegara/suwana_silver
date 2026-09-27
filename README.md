# Suwana Silver website

Static site: plain HTML, CSS and JavaScript, no build step. GSAP + ScrollTrigger load from jsDelivr.

- `index.html`: homepage with the scroll-scrubbed workshop story
- `collection.html`: products by type, each with an "Order on WhatsApp" link
- `class.html`: class steps, options, booking form (opens WhatsApp) and FAQ
- `contact.html`: commission form (opens WhatsApp), address, hours, map and contacts
- `data/content.js`: WhatsApp number, business details and all sample content (rendered with `data-sample="true"`)
- `js/layout.js`: shared header, footer, product card and WhatsApp helpers
- `js/render.js`: fills collection, classes and reviews from the data file
- `js/forms.js`: booking and commission forms; each builds a prefilled wa.me message
- `js/story.js`: canvas frame scrubbing, scene-by-scene snapping, text and image reveals
- `frames/desktop` (120 × 1280x720) and `frames/mobile` (60 × 540x720, cropped around the subject): WebP frames from the source video, with the sparkle watermark masked
- `img/key-*.webp`: four still frames used when `prefers-reduced-motion` is on
- `img/v-*.webp`: crops from the workshop video used as section images (doorway, tools, hands, flame, ring)

Run locally: `python3 -m http.server` and open http://localhost:8000.
