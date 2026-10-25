# Ghostbusters

Google Maps for DPWH public works. Citizens find ongoing infrastructure projects near them and file reports that get a tracking number and a visible status until resolved.

Data comes from the [DPWH Transparency Portal](https://transparency.dpwh.gov.ph). Ghostbusters owns only reports, issues, and their history.

→ Full product spec: [`ghostbusters-spec.md`](./ghostbusters-spec.md)

<img width="1469" height="833" alt="image" src="https://github.com/user-attachments/assets/063bdb7b-b459-40a2-8da1-b3cab00ca71c" />

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend framework | React 19 + Vite 8 + TypeScript (strict) |
| Map | MapLibre GL JS + MapTiler (dataviz-v4 style) |
| Styling | Tailwind v4 with a custom design token layer |
| Package manager | pnpm 10+ (workspaces) |
| Router | Custom file-based router (`lib/`) |
| Schema validation | Zod v4 |
| Forms | React Hook Form |

---

## Repository structure

```
ghostbusters/
├── ghostbusters-client/     # React app
│   ├── src/
│   │   ├── data/            # Mock data (GeoJSON FeatureCollections)
│   │   ├── features/map/    # Map components, types, hooks
│   │   │   ├── components/
│   │   │   │   ├── MapView.tsx          # MapLibre GL map
│   │   │   │   ├── FilterChips.tsx      # Status + type filters
│   │   │   │   └── ProjectSidebar.tsx   # Pin-click detail panel
│   │   │   └── types.ts     # Project schema + color constants
│   │   ├── routes/          # File-based routes (auto-generated tree)
│   │   │   └── _map/
│   │   │       └── index.tsx  # Map home page
│   │   └── styles/
│   │       └── globals.css  # Tailwind + design token imports
│   ├── config.template.toml # Copy to config.toml and fill in secrets
│   └── vite.config.ts
└── lib/                     # Shared router library
    ├── router/
    │   ├── RouterProvider.tsx
    │   ├── route.ts
    │   ├── hooks.ts
    │   └── generate-routes.js   # Run to regenerate routeTree.gen.ts
    └── styles/
        └── globals.css          # Design tokens (CSS variables)
```

---

## Getting started

**Prerequisites:** Node ≥ 20, pnpm ≥ 10

```bash
# Install dependencies
pnpm install

# Configure secrets
cp ghostbusters-client/config.template.toml ghostbusters-client/config.toml
# Fill in your MapTiler API key in config.toml

# Start dev server
pnpm --filter ghostbusters-client dev
```

The app runs at `http://localhost:5173`.

### Regenerate routes

The route tree is committed to `src/routeTree.gen.ts`. Regenerate it after adding or renaming route files:

```bash
pnpm --filter ghostbusters-client generate-routes
```

---

## Map setup

The map uses [MapLibre GL JS](https://maplibre.org) for rendering and [MapTiler](https://maptiler.com) for tile hosting. MapTiler has a generous free tier (100k map loads/month). Get an API key at cloud.maptiler.com and add it to `config.toml`.

**Important:** `maplibre-gl` must be excluded from Vite's pre-bundling or the worker file gets corrupted:

```ts
// vite.config.ts
optimizeDeps: { exclude: ['maplibre-gl'] }
```

### Clustering

MapLibre's built-in clustering is used (`cluster: true` on the GeoJSON source). Projects cluster automatically when zoomed out and expand on click. Individual pins render as colored teardrop SVGs loaded via `map.addImage()`.

---

## Design system

Design tokens live in `lib/styles/globals.css` as CSS variables and are imported by the client. The four project status colors:

| Status | Variable | Hex |
| --- | --- | --- |
| On track | `--color-support-blue` | `#155DFC` |
| Delayed | `--color-support-orange` | `#FF8904` |
| Completed | `--color-support-green` | `#00C951` |
| Report | `--color-support-red` | `#E7000B` |

Use CSS variables in React components (`style={{ color: "var(--color-support-blue)" }}`). Use the hex constants from `types.ts` for MapLibre GL paint properties, which can't read CSS variables.

---

## Project schema

The `Project` interface is defined in `src/features/map/types.ts`. It maps closely to DPWH Transparency Portal fields plus a citizen layer added by Ghostbusters.

Key fields:

```ts
// From DPWH portal
contractId, contractName, abc, cost, revisedCost
contractor, department, fundingSource
startDate, targetDate, endDate, awardDate
statusCode, infrastructureYear, variationOrders

// Ghostbusters additions
title           // human-readable: "Road Repair in Legazpi, Makati"
status          // derived: on_track | delayed | completed
verificationStatus, rating, reportCount, openReportCount
images, documents, biddingVideoUrl
```

`abc` is the Approved Budget for the Contract (the ceiling before bidding). `cost` is the actual awarded amount. `revisedCost` reflects approved Variation Orders (VOs), which are the DPWH mechanism for mid-contract scope and cost changes under RA 9184.

---

## What's built

- [x] Full-screen map with MapTiler tiles
- [x] Clustered project pins colored by status
- [x] Status + type filter chips
- [x] Pin click → project detail sidebar (left)
- [x] Project schema with DPWH fields + citizen layer
- [x] Mock data: 10 Metro Manila + Bulacan projects

## What's next

- [ ] Report flow: "Report a problem" button → form → reference number
- [ ] My Reports: list of reports filed or followed
- [ ] Real data: sync from DPWH Transparency Portal
- [ ] Mobile bottom sheet (currently desktop-only sidebar)
- [ ] Linear projects: road segments as LineString, not a single pin
- [ ] "Search this area" button after panning
- [ ] Staff triage and DEO queues (separate app or role-gated views)
