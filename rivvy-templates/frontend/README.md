# Frontend App Template

A ready-to-copy scaffold for a new Rivvy React webapp. Every file contains
`TEMPLATE:` comments that explain what to change. The example domain is called
`example` — rename it to your actual domain throughout.

**Stack:** React 19 · Vite 8 · TypeScript (strict) · Tailwind CSS v4 · Zod v4 · rivvy-ui

---

## Quick Start

### 1. Copy the template

```bash
cp -r rivvy-templates/frontend rivvy-your-app-name
```

### 2. Rename the app

In `package.json`, update the `name` field:

```json
"name": "rivvy-your-app-name"
```

### 3. Update relative paths

Three files reference `rivvy-ui` with paths relative to the template's location.
After copying to the monorepo root, update each:

| File | Template path | After copy |
|---|---|---|
| `src/styles/globals.css` | `../../../../rivvy-ui/` | `../../../rivvy-ui/` |
| `tailwind.config.ts` | `../../rivvy-ui/` | `../rivvy-ui/` |

### 4. Rename the config env var

In `vite.config.ts`, rename `RIVVY_EXAMPLE_CONFIG_PATH` to match your app:

```ts
const configPath = process.env.RIVVY_YOUR_APP_CONFIG_PATH || ...
```

### 5. Update the config

Copy `config.template.toml` → `config.toml` and fill in the real values:

```bash
cp config.template.toml config.toml
```

Update the `port` in `config.toml` and in the `dev` script in `package.json` so
it doesn't collide with other running apps.

### 6. Install and run

```bash
pnpm install
pnpm dev
```

The `dev` script runs route generation automatically before starting Vite.

---

## Project Structure

```
src/
├── main.tsx                     App bootstrap — router setup + Zod locale config
├── styles/
│   └── globals.css              Tailwind + rivvy-ui global styles
├── routes/
│   ├── __root.tsx               Root route — loads branding, provides BrandProvider
│   ├── _dashboard.tsx           Layout route — loads session, redirects on 401, provides context
│   └── _dashboard/
│       └── index.tsx            Landing page (eager: true) — the / route
├── features/
│   └── example/                 One directory per domain
│       ├── types.ts             Zod schemas + inferred types
│       ├── api.ts               All fetch calls for the domain
│       ├── context.tsx          React context + named consumer hooks
│       ├── ExampleProvider.tsx  Pure context provider component
│       └── components/          Feature-specific components (tables, forms, modals)
└── lib/
    └── types/
        └── response.ts          Shared Zod schemas (message response, etc.)
```

---

## Patterns to Follow

### Routing

Routes live in `src/routes/` and follow TanStack Router file-based conventions:

- `__root.tsx` — the root route, always present
- `_dashboard.tsx` — a pathless layout route (underscore prefix = no URL segment added)
- `_dashboard/index.tsx` — renders at `/`; use `eager: true` only on the landing page
- `_dashboard/your-page.tsx` — renders at `/your-page`; use `createLazyFileRoute`

**Route generation is automatic** — run `pnpm generate-routes` (or just `pnpm dev`) to
regenerate `src/routeTree.gen.ts` after adding or renaming route files.

### API calls

All fetch calls live in `features/<domain>/api.ts`. Always follow this contract:

```ts
export async function listThings(orgId: string) {
  try {
    const response = await fetch("/api/things", {
      credentials: "include",
      headers: { "X-Organization-ID": orgId },
    });

    if (!response.ok) {
      if (response.status === 401) {
        const err: Error & { status?: number } = new Error("Unauthorized");
        err.status = 401;
        throw err;                       // caller handles redirect
      }
      const body = await response.json();
      throw new Error(body.message || "Failed");
    }

    const data = await response.json();
    const validated = ThingListSchema.safeParse(data);
    if (!validated.success) throw new Error("Validation failed");
    return validated.data;
  } catch (error: unknown) {
    throw new Error("Could not list things", { cause: error });
  }
}
```

Rules:
- Always `credentials: "include"`
- Always pass `X-Organization-ID` when the endpoint requires it
- Never use `response.json()` without first checking `response.ok`
- Always validate with `.safeParse()` before returning data
- 401 → attach `.status = 401` to the error so the caller can redirect

### Handling 401 in components

```ts
catch (error: unknown) {
  if (error && typeof error === "object" && "status" in error && error.status === 401) {
    window.location.href = getAuthUrlByBrand(brand);  // NOT router.navigate
  }
}
```

### Types

Define all types in `features/<domain>/types.ts` using Zod — never write TypeScript
types by hand for API data:

```ts
export const ThingSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  createdAt: z.string().transform((v) => new Date(v).toLocaleDateString()),
});

export type Thing = z.infer<typeof ThingSchema>;
```

Use `.transform()` to compute display-ready values at parse time so components
never need to format data themselves.

### Context

Use the two-file pattern for any cross-cutting state:

- **`context.tsx`** — defines `createContext`, the typed interface, and named hooks
  (`useXContext`, `useSetX`). Hooks throw if used outside the provider.
- **`XProvider.tsx`** — pure wrapper component that just provides the context value.
  State lives in the parent (usually `_dashboard.tsx`), not inside the provider.

---

## Adding a New Page (Checklist)

1. Create `src/routes/_dashboard/your-page.tsx` with `createLazyFileRoute`
2. Run `pnpm generate-routes` (or restart `pnpm dev`)
3. Done — the route is automatically registered

## Adding a New Feature (Checklist)

1. Create `src/features/your-domain/types.ts` — Zod schemas + inferred types
2. Create `src/features/your-domain/api.ts` — fetch functions
3. Add components under `src/features/your-domain/components/` as needed
4. If the feature needs shared state: add `context.tsx` + `YourDomainProvider.tsx`
   and wire the provider into `_dashboard.tsx`
