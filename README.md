# Alison Greenway Art

WWS-native recreation of [alisongreenwayart.com](https://alisongreenwayart.com).

Astro 7 + TypeScript + Tailwind CSS 4. Content is editable via `src/cms/content.json`.

## Setup

```bash
npm install
```

## Develop

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## WWS GitHub import

- `src/cms/content.json` holds `pageContent`, keyed by the original URL path. The home entry also holds shared site details.
- Each URL has a matching `.astro` file under `src/pages/`; shared layout and templates render the page object from `content.json`.
- Images are stored in `public/assets` and referenced by `/assets/...` paths.
- The import contract is in `.cursor/rules/wws-github-import.mdc`.

The sibling pipeline's legacy `prepare:site` generator still writes `pages.json` and a catch-all route. Adapt its output to this import format before using a refreshed capture.

## Pages

47 routes including product pages, collections, blog posts, gift vouchers, commissions, about, and contact. URLs preserve original paths (e.g. `/about+alison+greenway`).
