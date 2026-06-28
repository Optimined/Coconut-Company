# Philippines Golden Coconut Shell Co., Ltd. — Website

A single-page marketing site for **Philippines Golden Coconut Shell Co., Ltd.**,
a direct manufacturer of premium coconut shell activated carbon operating an
integrated *“Domestic Operations + Overseas Manufacturing”* model.

Built as a fast, dependency-free **static site** (HTML + CSS + vanilla JS) — no
build step, hosts anywhere.

**Brand direction:** a bright, tropical identity on a compact, information-dense
layout — vivid teal, lime, mango, and coral on a mint base; a classic serif
display face; a palm-crest seal; and restrained motion.

## Run it locally

Just open `index.html` in a browser. That's it.

For a nicer dev experience (so relative paths and fonts behave exactly like
production), serve it from a local web server:

```bash
# Python 3
python -m http.server 8000
# then visit http://localhost:8000

# …or Node
npx serve .
```

## Project structure

```
index.html        # All page content & sections
styles.css        # Design system + responsive layout + animations
script.js         # Sticky nav, scroll reveals, counters, spec rings, hero particles
assets/
  favicon.svg     # Brand mark
  README.md       # How to drop in real product/factory photos
```

## Sections (mirrors the company deck)

1. **Hero** — wax-seal crest, serif headline, ledger of key spec stats
2. **Company Overview** — the two entities + integrated synergy
3. **Domestic Operations** — Changzhou Archimedes (6 capabilities)
4. **Manufacturing** — Philippines base, 3 strengths + 4 production pillars
5. **Technical Parameters** — animated rings (volatile ≤15%, ash ≤2%, moisture ≤13%)
6. **Applications** — water, gold, food & pharma, air, new energy
7. **Production Process** — 4-step timeline
8. **Core Advantages** — 8 advantage cards incl. named customers
9. **Partners** — the 3 partner companies
10. **Future Outlook** — 4 strategic pillars
11. **Contact** — both China & Philippines offices

## Customizing

- **Text/contact details:** edit directly in `index.html`.
- **Colors & type:** all tokens live at the top of `styles.css` under `:root`
  (bright tropical — teal / lime / mango / coral on mint; `Playfair Display`
  headings, `Source Sans 3` body).
- **Crest / founding year:** the hero seal is inline SVG in `index.html`
  (`.hero__crest`). The lower arc reads `ACTIVATED CARBON` — swap it for
  `EST. <year>` once you have a founding year.
- **Photos:** see `assets/README.md` — drop a JPG in `assets/` and it's picked
  up automatically.

## Deploy

It's a static site — push the folder to any host:

- **GitHub Pages:** Settings → Pages → deploy from the repo root.
- **Netlify / Vercel / Cloudflare Pages:** drag-and-drop the folder, no build
  command needed (output = the folder itself).

## Accessibility & performance

- Respects `prefers-reduced-motion` (disables particles, animations, smooth scroll).
- Semantic landmarks, keyboard-navigable, focus-friendly.
- Zero external JS dependencies; one Google Fonts request (degrades gracefully).
