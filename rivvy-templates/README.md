# Rivvy Templates

Scaffold templates for new Rivvy services.

| Template | Description |
|---|---|
| [`backend/`](./backend/) | Go HTTP service (config, middlewares, models, repositories, server) |
| [`frontend/`](./frontend/) | React + Vite webapp (routing, API layer, Zod types, context) |

Each template has its own `README.md` with a quick-start checklist.

---

## Adding a Service to This Monorepo

If you're adding a new service **inside the existing `rivvy` monorepo**, the templates
are ready to use with minimal changes. Follow the template READMEs and skip the rest of
this document.

---

## Setting Up a New Separate Repository

If you're creating a **brand new repository** from scratch that follows the same structure,
this section covers what the template READMEs assume is already in place.

### Requirements

| Tool | Version |
|---|---|
| Node | `24.19.0` (pin with `.nvmrc`) |
| pnpm | `>=10.0.0` |
| Go | `1.26+` |

### 1. Repository Structure

A repo using these templates should mirror this layout:

```
your-repo/
├── package.json          Root package — tooling only, no app code
├── pnpm-workspace.yaml   Lists all JS packages + shared dependency catalog
├── pnpm-lock.yaml        Committed lockfile
├── go-pkg/               Shared Go library (database client, config utils, etc.)
├── rivvy-ui/             Shared React component library
├── your-frontend-app/    Copied from rivvy-templates/frontend/
├── your-backend-service/ Copied from rivvy-templates/backend/
└── ...
```

### 2. Root `package.json`

The root package enforces Node and pnpm versions and holds shared dev tooling (ESLint, Prettier).
It does **not** contain any app-specific dependencies.

```json
{
  "name": "your-repo",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": "24.19.0",
    "pnpm": ">=10.0.0"
  },
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "eslint": "catalog:",
    "prettier": "catalog:",
    "prettier-plugin-tailwindcss": "catalog:"
  }
}
```

### 3. `pnpm-workspace.yaml`

This file does two things: tells pnpm which directories are workspace packages,
and defines the `catalog:` version pins shared across all packages.

```yaml
packages:
  - rivvy-ui
  - your-frontend-app
  # Add each new frontend app here

allowBuilds:
  esbuild: true
  sharp: true
  '@parcel/watcher': true

catalog:
  # Core frameworks
  react: 19.2.7
  react-dom: 19.2.7

  # Vite
  vite: ^8.1.1
  '@vitejs/plugin-react': ^6.0.3
  '@tailwindcss/vite': ^4.3.3

  # Styling
  tailwindcss: ^4
  bootstrap-icons: ^1.13.1

  # Forms
  react-hook-form: ^7.63.0
  '@hookform/resolvers': ^5.2.2

  # ESLint & Prettier
  eslint: ^9.39.3
  eslint-plugin-react-hooks: ^7.1.1
  eslint-plugin-react-refresh: ^0.5.3
  globals: ^15.15.0
  prettier: ^3.8.1
  prettier-plugin-tailwindcss: ^0.8.1

  # Testing
  '@testing-library/dom': ^10.4.1
  '@testing-library/react': ^16.3.0

  # Types
  '@types/node': ^20
  '@types/react': ^19
  '@types/react-dom': ^19

  # React Compiler / Babel
  '@babel/core': ^7.29.7
  '@rolldown/plugin-babel': ^0.2.3
  '@types/babel__core': ^7.20.5
  babel-plugin-react-compiler: ^1.0.0

  # Utilities
  zod: 4.1.12
  toml: ^3.0.0
  date-fns: ^4.1.0
  typescript: ^5
  knip: ^5.63.1
  ts-node: ^10.9.2
```

Any package that lists `"rivvy-ui": "workspace:*"` in its dependencies will resolve to
the local `rivvy-ui/` directory. No npm publish needed.

### 4. Relative Paths for `rivvy-ui`

The frontend template contains three places with paths that point to `rivvy-ui`.
All three are relative to the file's location, so they depend on how deep your
app sits from the repo root.

Assuming your app is **one level deep** from the repo root (e.g. `your-frontend-app/`),
use these values — the same as the existing dashboard webapp:

**`src/styles/globals.css`**
```css
@import "tailwindcss";
@source "../../../rivvy-ui/src/**/*.{js,ts,jsx,tsx}";
@import "../../../rivvy-ui/src/styles/globals.css";
```

**`tailwind.config.ts`**
```ts
content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "../rivvy-ui/src/**/*.{js,ts,jsx,tsx}"],
```

The template ships with paths set for its location inside `rivvy-templates/frontend/`
(one level deeper). If you see Tailwind classes not applying or missing styles,
check these two files first.

### 5. Route Generation

The `pnpm dev` and `pnpm build` scripts run the route generator before Vite:

```
node node_modules/rivvy-ui/src/router/generate-routes.js
```

This script scans `src/routes/` and writes `src/routeTree.gen.ts`. It must run
whenever a route file is added, renamed, or deleted. If you see a TypeScript error
about a missing route export, run `pnpm generate-routes` first.

### 6. Go Backend — `go-pkg`

Each Go backend service references the shared `go-pkg` library via a `replace`
directive in its `go.mod`:

```
replace github.com/RivvyGroup/rivvy/go-pkg => ../go-pkg
```

The `../` path assumes the service sits at the same level as `go-pkg/` in your repo.
Go backends are **not** workspace packages — they are standalone Go modules.
Each service has its own `go.mod` and `go.sum`.

### 7. Pin Your Node Version

Create a `.nvmrc` at the repo root so all contributors use the same Node version:

```
24.19.0
```

And install it with `nvm install` before running `pnpm install`.
