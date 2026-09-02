# Geoaxis – CLAUDE.md

## Keeping this file up to date

This file is the source of truth for how the Kyx site is built. **Update it every time
something important changes** — project structure, templates, commands, deploy targets,
conventions, or anything else a future contributor (human or AI) would need to know but
can't easily re-derive from the code. Stale instructions here are worse than none, since
they get followed as if still true.

## Project Overview

Static website for bigband  **Kyx** (www.kyx.cz).
Create same context as on kyx.cz, but in completely new template which will be up to date to current design trends
Examples:
- firefox.com
- www.redhat.com
Use red/black/white as primary colors, suggest several variants with mobile first principle 
---

## Tech Stack

- **Generator:** [Zola](https://www.getzola.org/) (Rust-based static site generator)
- **CSS framework:** [Bootstrap 5](https://getbootstrap.com/) (local, installed via npm)
- **Languages:** Czech (primary), English (translation) — Zola i18n
- **Deployment:** static files, domain `www.kyx.cz`
- **Demo:** GitHub Pages — https://jankopacek.github.io/kyx/

---

## Project Structure

```
.
├── README.md             # how to operate this repo (setup, serve, build, deploy)
├── Makefile              # `make serve` / `make build` shortcuts
├── mockups/              # throwaway design mockups, gitignored, not part of the build
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Pages deployment (demo target)
└── kyx/                  # the Zola project — all zola commands run from here
    ├── zola.toml         # base_url, languages, [languages.<lang>.translations]
    ├── package.json      # Bootstrap 5 dep; postinstall copies dist CSS/JS into static/
    ├── content/
    │   ├── _index.md / _index.en.md            # Home
    │   ├── o-nas/_index.md / _index.en.md      # About — template = about.html
    │   ├── multimedia/_index.md / _index.en.md # template = multimedia.html
    │   ├── kalendar/_index.md / _index.en.md   # template = calendar.html
    │   ├── shop/_index.md / _index.en.md       # template = shop.html
    │   └── kontakt/_index.md / _index.en.md    # template = contact.html
    ├── templates/
    │   ├── base.html      # layout: navbar (built from get_section subsections), footer
    │   ├── index.html, section.html, page.html   # generic
    │   └── about.html, multimedia.html, calendar.html, shop.html, contact.html
    │       # each extends base.html; content-only, per-section structured markup
    ├── static/
    │   ├── img/gallery/    # real kyx.cz archive photos, JPEG + WebP pairs
    │   ├── css/{bootstrap.min.css, custom.css}
    │   └── js/bootstrap.bundle.min.js
    ├── sass/                 # unused in v1, kept per original spec
    └── .gitignore            # public/, node_modules/, .DS_Store
```

Translated content is **co-located**, not in a separate `en/` folder: `content/o-nas/_index.md`
(cs) sits next to `content/o-nas/_index.en.md` (en).

---

## Development Rules

### General

- Code must be **valid HTML5** and **valid CSS3**.
- **Zero browser console errors** — no 404s, JS errors, or CSP warnings.
- Compatible with all major browsers: Chrome, Firefox, Safari, Edge (last 2 versions).
- Use semantic HTML tags: `<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`.
- All images must have meaningful `alt` attributes.
- `<html lang="cs">` for Czech pages, `<html lang="en">` for English pages.
- Every page must have `charset`, `viewport`, and `description` meta tags.

### Bootstrap 5

- **Mobile-first:** design for mobile breakpoints first, then scale up.
- Use Bootstrap 5 grid: `.container`, `.row`, `.col-*`.
- No jQuery — Bootstrap 5 does not require it.
- Custom CSS goes only in `static/css/custom.css`, never inline.
- Avoid `!important` — use more specific selectors instead.

### Zola Templating

- Layout (navbar, footer) lives exclusively in `templates/base.html`. Pages inherit it via `{% extends "base.html" %}`.
- Content (text, structured data) belongs in Markdown files under `content/`.
- Visual design (colors, fonts, spacing) is **decoupled** from HTML structure — changes happen only in CSS/SCSS.
- Navigation menu is generated dynamically from Zola sections and pages — never hardcode link lists in templates.
- Active menu item is marked using the Zola `current_path` variable.
- Every **page** front matter must include: `title`, `description`, `date`. **Sections**
  (`_index.md`) only take `title` + `description` — Zola's schema rejects `date` on
  sections, so don't add it there. Nav order across sections is controlled by a `weight`
  field in front matter, not by folder name.

### Calendar events

Concerts are individual Zola pages, not an `extra` array. To add one, create a matching
pair of content files in `content/kalendar/`: `<slug>.md` (cs) and `<slug>.en.md` (en),
with front matter `title`, `description`, `date` (the show's date/time) and
`[extra] venue = "..."` (plus optional `extra.venue_url` for an external ticket link).
The Markdown body is the event description. The section's `page_template = "event.html"`
(set in `content/kalendar/_index.md`) means no per-event `template = "..."` line is
needed. `calendar.html` picks new events up automatically — sorted by date and split into
upcoming/past — with no template changes required.

### Multilingual

- Primary language: `cs` (default, no URL prefix)
- Secondary language: `en` (URL prefix `/en/`)
- Zola i18n via `[languages.<lang>.translations]` in `zola.toml` and `trans()` macro in templates.
- **Note:** Zola 0.22 does NOT read translations from `i18n/*.toml` files — they must be in `zola.toml`.

### Images

- Preferred format: **WebP** with `<picture>` fallback to JPEG/PNG for older browsers.
- Always specify `width` and `height` attributes to prevent layout shift (CLS).
- Compress large images — target under 200 KB.
- Use lazy loading: `loading="lazy"` on below-the-fold images.

### Performance

- Bootstrap 5 and custom CSS loaded in `<head>`.
- JS scripts loaded before `</body>` or with `defer`.
- No blocking third-party scripts without `async`/`defer`.
- Google Maps iframe on contact page: use `loading="lazy"`.

---

## Gitignore

`kyx/.gitignore` must include:

```
public/
node_modules/
.DS_Store
```

Repo-root `.gitignore` must include:

```
mockups/
```

---

## Commands

```bash
# From the repo root, via Makefile
make serve   # local dev server (http://127.0.0.1:1111)
make build   # production build into kyx/public/

# Equivalent, run from the kyx/ subdirectory directly
cd kyx
npm install  # once, or whenever package.json changes — pulls in Bootstrap 5
zola serve
zola build
zola check   # validate content/templates without a full build
```

---

## Zola/Tera gotchas learned the hard way

- The `starting_with` Tera test takes a named arg: `path is starting_with(pat=other_path)`,
  not a positional one.
- `get_section`/`get_url` calls for another language must use the **default-language**
  content path plus `lang=lang` (e.g. `get_section(path="kalendar/_index.md", lang=lang)`).
  Passing an already-suffixed path like `kalendar/_index.en.md` while rendering the `en`
  version double-suffixes internally and fails to resolve.
- There's no `concat` filter for building arrays in a loop; to split a list into two
  groups (e.g. upcoming vs. past events) just loop over the source list twice with an
  `{% if %}` per pass, rather than accumulating into `set_global` arrays.

## Notes

- No inline styles (`style="..."`) — everything goes in CSS files.
- No deprecated HTML attributes (e.g. `frameborder`, unquoted `allowfullscreen`).
- Wrap YouTube and Google Maps embeds in Bootstrap's responsive helper (`.ratio.ratio-16x9`).
- Footer includes copyright `© kyx.cz` and site author credit.
- Print stylesheet: hide navigation, show email as plain text (preserve behaviour from old site).
