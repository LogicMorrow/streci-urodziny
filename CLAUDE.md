# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-use, mobile-first birthday-gift website: a quiz/mini-game journey across a world map (Meksyk → Anglia → Hiszpania → Wietnam → Malezja → Polska). Each location unlocks the next after the player wins its game; the finale reveals a phone number and a gift message (guitar lessons). Built as plain vanilla HTML/CSS/JS for **GitHub Pages — no build step, no bundler, no dependencies, no tests.** UI text is Polish.

## Run / preview / deploy

- **Preview:** open `index.html` directly in a browser (works over `file://`). Use DevTools device mode (F12) — the site is mobile-first.
- **Deploy:** push all files (keep folder structure) to a public repo → Settings → Pages → Deploy from branch `main`, folder `/ (root)`.
- There is no lint/build/test tooling. To sanity-check JS after edits: `node --check js/<file>.js`.

## Architecture

Three globally-scoped scripts loaded in order by `index.html` (no ES modules — must work over `file://`, so everything communicates via globals, not `import`/`export`):

1. **`js/config.js`** — all editable content and game data. Defines globals `CONFIG` (friend name, phone, finale/win/lose text, photo paths), `LOCATIONS` (the ordered journey; each entry has a `game` key plus real `lat`/`lon`), `MAP_BOUNDS` (the visible geographic crop of the world map), and helpers `geoToPct(lat,lon)` / `mapViewBox()`. **This is where non-code changes go** (texts, phone, adding a location).
2. **`js/worldmap.js`** — a single generated global `WORLD_PATH`: the world's landmasses as one SVG path string in an **equirectangular** projection with `viewBox 0 0 1000 500`. Auto-generated from Natural Earth 110m land GeoJSON (see "Regenerating the map"); do not hand-edit.
3. **`js/games.js`** — one render function per game, dispatched via the `GAMES` map keyed by `LOCATIONS[i].game` (`cups`, `manchester`, `alicante`, `draw`, `placeholder`). Signature: `gameX(el, loc, cb)` where `el` is `#game-content` and `cb` is `{ onWin, onLose }`. Games never touch progress/navigation themselves — they only call `cb.onWin()` / `cb.onLose()`.
4. **`js/app.js`** — state, navigation, map rendering, modals, finale, confetti. Owns the single source of truth for progress.

Script load order in `index.html` is `config → worldmap → games → app` (app depends on all three).

### Key flows

- **Progress** is an integer in `localStorage` under `STORE_KEY` (`podroz_progress_v1`) = number of completed locations. For location index `i`: `i < progress` → done, `i === progress` → current/playable, `i > progress` → locked. Reset button clears this key.
- **Screens** (`#map-screen`, `#game-screen`, `#final-screen`) are toggled by `showScreen(name)` adding/removing `.active`. `openLocation(i)` routes to a game or, for `game: "final"`, straight to `showFinal()`.
- **Win/lose** go through `showModal({type, ...})`. Win advances progress and returns to the map; lose re-opens the same game (`openLocation(i)`) — infinite retries by design.
- **Finale** is the Polska node (`game: "final"`); reaching it sets progress to `LOCATIONS.length`.
- **World map** (`renderMap`): a horizontally-scrollable equirectangular map. The land `<svg>` uses `viewBox = mapViewBox()` (the `MAP_BOUNDS` crop of the full 1000×500 path) with `preserveAspectRatio="none"`, and the inner box's CSS `aspect-ratio` is set to the same lon/lat span so nothing distorts. Pins are HTML nodes positioned by `geoToPct()` (so they stay a fixed tap size regardless of map scale); journey lines are drawn in a `0 0 100 100` overlay SVG (`drawPaths`) in the same percentage space. On render the view auto-scrolls to the current pin (`scrollToCurrent`).

### Conventions to preserve when extending

- **Adding a game:** write a `gameX(el, loc, cb)` in `games.js`, register it in the `GAMES` map, then add/point a `LOCATIONS` entry's `game` field to it. A new location just needs real `lat`/`lon` in its `LOCATIONS` entry — the pin is placed automatically (ensure it falls inside `MAP_BOUNDS`, else widen the crop). Wietnam/Malezja are intended slots for future games.
- **Regenerating the map:** `WORLD_PATH` was produced by a one-off Node script that reads Natural Earth `ne_110m_land` GeoJSON and projects each ring equirectangularly into `viewBox 0 0 1000 500` (`x=(lon+180)/360*1000`, `y=(90-lat)/180*500`, rings joined as `M x y x y … Z`). To refresh, re-download the GeoJSON and rerun that projection — keep the 1000×500 viewBox so `mapViewBox()`/`geoToPct()` stay valid.
- **Images** use `photoHTML(src, phText)` which renders an `<img>` with an `onerror` fallback to a `📷` placeholder — so missing files degrade gracefully. Player photos live in `assets/photos/` (`wygrana.jpg`, `przegrana.jpg`, `final.jpg`); filenames are configurable in `CONFIG.photos`.
- **Visuals are self-contained:** flags/beer/hats are inline SVG data-URIs or emoji, and the background "crest" is a generic stylized shield (deliberately not the real Manchester United logo) — keep assets dependency-free and avoid shipping trademarked binaries unless the user supplies them.

## Note on `.claude/`

The `.claude/` directory holds an unrelated agent/skill "factory" (SEO, Polish-content, etc.). It is **not** part of this gift site and should be ignored when working on the site itself.
