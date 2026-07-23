# AGENTS.md

## Cursor Cloud specific instructions

### Project layout
- The actual application lives in the `kml-animator/` subdirectory, **not** the repo root. Run all npm commands from `kml-animator/` (or use `--prefix kml-animator`).
- `kml-animator` (branded "RouteMotion") is a single client-side Next.js 16 app (App Router, React 19, TypeScript, Tailwind v4, Leaflet). There is no backend, database, API routes, or env vars — everything (KML parsing, map, animation) runs in the browser.

### Running (dev is the primary/working path)
- Start the dev server with `npm run dev` (script in `kml-animator/package.json`); it serves on `http://localhost:3000`.
- `next dev`/`next build` automatically rewrite `kml-animator/tsconfig.json` on every run (set `jsx` to `react-jsx`, add `.next/dev/types`). This local churn is expected Next.js behavior — do not commit it.
- To exercise the core flow, upload a `.kml`/`.kmz`/`.xml` file containing a `<LineString>` or `gx:Track`; the app then renders the route on a Leaflet map and animates a vehicle marker along it. No sample file is bundled in the repo.
- Map tiles come from public providers over the internet; without egress the app still works but the map background is blank/gray.

### Known pre-existing issues (NOT caused by env setup; do not "fix" as part of setup)
- `npm ci` fails: the committed `package-lock.json` is out of sync with `package.json`. Use `npm install` (the update script does this).
- `npm run lint` fails out of the box: ESLint is not declared as a dependency, and `eslint.config.mjs` uses `FlatCompat`, which is incompatible with `eslint-config-next` 16's native flat config (crashes with "Converting circular structure to JSON"). Making lint work requires editing `eslint.config.mjs` (spread `eslint-config-next/core-web-vitals` + `/typescript` directly) plus adding the eslint devDependencies.
- `npm run build` fails: `@types/leaflet` is not declared, and there is a genuine TypeScript type error in `lib/kml-parser.ts`. Dev mode (`next dev`, Turbopack) is unaffected because it does not fail the app on type errors, so the app runs and the upload/animate flow works at runtime.
- There are no automated tests in the repo.
