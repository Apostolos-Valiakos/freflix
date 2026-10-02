# freflix

Movie and TV browser built on [TMDB](https://www.themoviedb.org/) data.
Nuxt 4 (client-only) + Tailwind CSS, packaged for Android with Capacitor.

## Setup

```bash
# install dependencies
npm install

# dev server with hot reload at localhost:3000
npm run dev

# static build into .output/public (also linked as dist/)
npm run generate

# serve the static build locally
npx serve .output/public
```

The TMDB read token lives in `nuxt.config.ts` (`runtimeConfig.public.tmdbToken`).
Set `NUXT_PUBLIC_TMDB_TOKEN` to override it.

## Android

```bash
npm run generate
npx cap sync android
npx cap open android
```

## Layout

| Path | What it holds |
| --- | --- |
| `app/pages` | Routes: home, `movies`, `series`, `movie/[id]`, `tv/[id]`, `person/[id]`, `provider/[id]`, `category/[type]/[slug]`, `search`, `lists`, `auth-callback` |
| `app/components` | UI pieces (nav, hero slider, rows, cards, filters, detail page, player, watch party) |
| `app/composables` | TMDB fetch + cache, TMDB account login, watchlist/history, ambient colour, infinite lists |
| `app/utils` | Image/format helpers and `config.ts` (watch region, country list) |
| `app/middleware/legacy.global.ts` | Redirects from the old URLs (`/info?id=`, `/infoSeries?id=`, `/watchlist`, ...) |
| `public` | Static files served as-is (`_headers`, `_redirects`, `peerjs.min.js`, sitemap) |

Provider tiles and the provider filter use the region in `app/utils/config.ts`
(`WATCH_REGION`, default `US`).
