# Kyx — www.kyx.cz

Static site for the big band **Kyx**, built with [Zola](https://www.getzola.org/) and
Bootstrap 5. Czech is the default language, English lives under `/en/`.

For design/coding conventions (colors, templating rules, i18n setup, image rules, etc.)
see [`CLAUDE.md`](CLAUDE.md) — that file is the source of truth for how this project is
built and must be kept up to date as the project evolves.

## Repo layout

```
.
├── CLAUDE.md                  # dev conventions — keep in sync with the project
├── README.md                  # this file
├── Makefile                   # shortcuts for local serve/build
├── mockups/                   # throwaway design mockups (gitignored, local only)
├── .pre-commit-config.yaml    # local Conventional Commits check (commit-msg hook)
├── .github/workflows/
│   ├── deploy.yml              # GitHub Pages CI (demo deploy on push to main)
│   └── commitlint.yml          # Conventional Commits check on pull requests
└── kyx/                       # the actual Zola project — all zola commands run from here
    ├── zola.toml
    ├── package.json           # Bootstrap 5, copied into static/ via postinstall
    ├── content/                # cs + en markdown, e.g. o-nas/_index.md + _index.en.md
    ├── templates/
    └── static/
```

## Prerequisites

- [Zola](https://www.getzola.org/documentation/getting-started/installation/) (tested with 0.23.x)
- Node.js + npm (for Bootstrap 5)

## Setup

```bash
cd kyx
npm install   # pulls in Bootstrap 5 and copies its CSS/JS into static/
```

Run this once, and again any time `package.json` changes.

Also install the local Conventional Commits check (one-time per clone):

```bash
pip install pre-commit   # or: pipx install pre-commit / brew install pre-commit
pre-commit install --hook-type commit-msg
```

This rejects a non-conforming commit message locally instead of waiting for CI — see
[`CLAUDE.md`](CLAUDE.md#commit-conventions) for the message format.

## Local development

```bash
make serve
```

Serves the site at `http://127.0.0.1:1111` with live reload. Equivalent to:

```bash
cd kyx && zola serve
```

## Production build

```bash
make build
```

Builds the site into `kyx/public/` using the production `base_url`
(`https://www.kyx.cz`) from `zola.toml`. Equivalent to `cd kyx && zola build`.

To check content/templates for errors without a full build:

```bash
cd kyx && zola check
```

## Editing content

- Content lives in `kyx/content/`. Each section has a Czech file (`_index.md`) and an
  English one (`_index.en.md`) side by side — not in a separate `en/` folder.
- Structured data (band members, events, gallery photos, products, contact info) lives in
  each file's `[extra]` TOML table, read by that section's template
  (`templates/about.html`, `calendar.html`, `multimedia.html`, `shop.html`,
  `contact.html`).
- Section front matter (`_index.md`) does **not** support a `date` field in Zola — only
  regular pages do. Sections just need `title` + `description`.
- Nav order is controlled by the `weight` field in each section's front matter, not by
  file/directory name.

## Deployment

- **Demo (GitHub Pages):** `.github/workflows/deploy.yml` builds and deploys automatically
  on every push to `main`, publishing to `https://jankopacek.github.io/kyx/`. One-time
  manual step: in the GitHub repo, set **Settings → Pages → Source** to "GitHub Actions".
- **Commit messages:** `.github/workflows/commitlint.yml` checks every commit in a pull
  request follows [Conventional Commits](https://www.conventionalcommits.org/) (e.g.
  `fix: ...`, `feat: ...`, `docs: ...`) — see [`CLAUDE.md`](CLAUDE.md#commit-conventions)
  for the full list of types.
- **Production (`www.kyx.cz`):** not automated yet — `zola.toml`'s `base_url` is already
  set to the production domain, so `make build` produces production-ready output in
  `kyx/public/`; how that gets uploaded to the live host is still to be defined.

## License

This site's content is licensed under [Creative Commons Attribution 4.0 International
(CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

In short, you are free to share and adapt the content — including for commercial
purposes — as long as you give appropriate credit, provide a link to the license, and
indicate if changes were made.
