# Image assets

The site works fully **without any photos** — sections fall back to styled
placeholders. To make it shine, drop real photos in here using these exact
filenames and the site will pick them up automatically (no code changes needed):

| Filename                | Where it appears                              | Suggested shot                          |
| ----------------------- | --------------------------------------------- | --------------------------------------- |
| `factory-kiln.jpg`      | Manufacturing section, left media panel       | The rotary activation kiln / production line |

> The page references images via `data-img="assets/<file>"`. If the file is
> missing, JavaScript keeps the placeholder. If present, it loads as a darkened
> background so white text stays readable.

## Adding more photos
To wire up additional images (e.g. the charcoal hero, the team photo, product
close-ups from the deck), add a `data-img="assets/your-file.jpg"` attribute to
any element and the loader in `script.js` will handle it the same way.

**Recommended specs:** JPG/WebP, ~1600px wide, optimized < 400 KB each.
