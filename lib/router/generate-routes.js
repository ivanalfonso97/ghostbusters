#!/usr/bin/env node
/* eslint-disable */
/**
 * Generates src/routeTree.gen.ts by scanning src/routes/.
 *
 * File naming conventions:
 *   __root.tsx              — root route
 *   _name.tsx               — layout route (no URL path segment)
 *   _name/index.tsx         — index child of _name, path '/'
 *   _name/segment.tsx       — named child of _name, path '/segment'
 *   _name/dir/index.tsx     — nested index, path '/dir/'
 *   _name/dir/segment.tsx   — nested named child, path '/dir/segment'
 *
 * Run from the project root:
 *   pnpm generate-routes
 */

import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC_DIR = join(process.cwd(), "src");
const ROUTES_DIR = join(SRC_DIR, "routes");
const OUTPUT_FILE = join(SRC_DIR, "routeTree.gen.ts");
const ROUTE_TYPES_FILE = join(SRC_DIR, "routeTypes.gen.d.ts");

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

/** Recursively collect .tsx files, returning paths relative to ROUTES_DIR without extension. */
function collectFiles(dir, prefix = "") {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = prefix ? `${prefix}/${entry}` : entry;
    if (statSync(full).isDirectory()) {
      results.push(...collectFiles(full, rel));
    } else if (entry.endsWith(".tsx")) {
      results.push(rel.slice(0, -4));
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Name derivation
// ---------------------------------------------------------------------------

/** Strip leading underscores and PascalCase a single path segment (handles hyphens). */
function toPascal(segment) {
  const stripped = segment.replace(/^_+/, "");
  return stripped
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * Build the variable name base from route segments.
 * e.g. ['_checkout', 'order', 'index'] → 'CheckoutOrderIndex'
 *      ['__root'] → 'root'
 */
function varBase(segments) {
  if (segments.length === 1 && segments[0] === "__root") return "root";
  return segments.map(toPascal).join("");
}

// ---------------------------------------------------------------------------
// Parent resolution
// ---------------------------------------------------------------------------

/**
 * Find the parent route's file path for a given route.
 * Walks up the directory hierarchy looking for an ancestor route file.
 * Falls back to '__root' if nothing is found.
 */
function findParentFp(segments, allFps) {
  if (segments.length === 1 && segments[0] === "__root") return null;
  for (let i = segments.length - 1; i >= 1; i--) {
    const candidate = segments.slice(0, i).join("/");
    if (allFps.includes(candidate)) return candidate;
  }
  return "__root";
}

// ---------------------------------------------------------------------------
// Path / ID derivation
// ---------------------------------------------------------------------------

/**
 * Derive the URL path for a regular (non-layout, non-root) route.
 * e.g. '_checkout/order/payment/index' with parent '_checkout' → '/order/payment/'
 */
function derivePath(segments, parentFp) {
  const parentSegments = parentFp === "__root" ? [] : parentFp.split("/");
  const layoutDir = parentSegments[parentSegments.length - 1]; // e.g. '_checkout'

  // Strip everything up to and including the layout directory
  const idx = layoutDir ? segments.lastIndexOf(layoutDir) : -1;
  const rel = idx >= 0 ? segments.slice(idx + 1) : segments;

  if (rel.length === 0) return "/";

  if (rel[rel.length - 1] === "index") {
    const parts = rel.slice(0, -1);
    return "/" + (parts.length ? parts.join("/") + "/" : "");
  }

  return "/" + rel.join("/");
}

// ---------------------------------------------------------------------------
// Build route metadata
// ---------------------------------------------------------------------------

/** A leaf route opts out of code-splitting by passing `eager: true` to createFileRoute's config. */
function isMarkedEager(fp) {
  const source = readFileSync(join(ROUTES_DIR, `${fp}.tsx`), "utf-8");
  return /\beager\s*:\s*true\b/.test(source);
}

function buildRoutes(filePaths) {
  const allFps = filePaths;

  return filePaths.map((fp) => {
    const segs = fp.split("/");
    const last = segs[segs.length - 1];

    const isRoot = fp === "__root";
    const isLayout = !isRoot && last.startsWith("_") && !last.startsWith("__");
    const isEager = !isRoot && !isLayout && isMarkedEager(fp);
    const base = varBase(segs);

    const importVar = isRoot ? "rootRouteImport" : `${base}RouteImport`;
    const routeVar = isRoot ? "rootRouteImport" : `${base}Route`;

    const parentFp = findParentFp(segs, allFps);

    const path = isRoot || isLayout ? undefined : derivePath(segs, parentFp);

    // ID: layout routes keep the underscore prefix, regular routes use the path
    const id = isRoot ? "__root__" : isLayout ? "/" + fp : path;

    return { fp, segs, isRoot, isLayout, isEager, base, importVar, routeVar, parentFp, path, id };
  });
}

// ---------------------------------------------------------------------------
// Code generation
// ---------------------------------------------------------------------------

function generate() {
  const filePaths = collectFiles(ROUTES_DIR).sort();
  const routes = buildRoutes(filePaths);
  const byFp = Object.fromEntries(routes.map((r) => [r.fp, r]));

  const root = routes.find((r) => r.isRoot);
  const layouts = routes.filter((r) => r.isLayout);
  const regular = routes.filter((r) => !r.isRoot && !r.isLayout);
  const nonRoot = [...layouts, ...regular];

  // Full id = layout's own id, or parentLayout.id + path for regular routes
  for (const r of nonRoot) {
    const parent = byFp[r.parentFp];
    r.fullId = r.isLayout ? r.id : parent?.isLayout ? parent.id + r.path : r.id;
  }

  // Map each parent fp → its direct child routes
  const childrenOf = {};
  for (const r of nonRoot) {
    const key = r.parentFp ?? "__root";
    (childrenOf[key] ??= []).push(r);
  }

  const lines = [];
  const emit = (...args) => lines.push(...args);

  // Header
  emit(
    "// This file was automatically generated by generate-routes.",
    "// You should NOT make any changes in this file as it will be overwritten.",
    "// Run `pnpm generate-routes` to regenerate.",
    ""
  );

  // Imports — root, layout, and eager routes are statically imported;
  // other leaf routes are loaded lazily via createLazyFileRoute.
  emit(`import { createLazyFileRoute } from 'rivvy-ui/router/route';`);
  emit("");
  for (const r of routes) {
    if (r.isRoot || r.isLayout || r.isEager) {
      emit(`import { Route as ${r.importVar} } from './routes/${r.fp}';`);
    }
  }
  emit("");

  // Route instantiation
  for (const r of nonRoot) {
    const parentRef = byFp[r.parentFp]?.routeVar ?? "rootRouteImport";
    if (r.isLayout || r.isEager) {
      emit(`const ${r.routeVar} = ${r.importVar}.update({`);
      emit(`  id: '${r.id}',`);
      if (r.path !== undefined) emit(`  path: '${r.path}',`);
      emit(`  getParentRoute: () => ${parentRef},`);
      emit(`});`);
    } else {
      emit(`const ${r.routeVar} = createLazyFileRoute(`);
      emit(`  () => import('./routes/${r.fp}')`);
      emit(`).update({`);
      emit(`  id: '${r.id}',`);
      if (r.path !== undefined) emit(`  path: '${r.path}',`);
      emit(`  getParentRoute: () => ${parentRef},`);
      emit(`});`);
    }
  }
  emit("");

  // TypeScript interfaces
  const leafRoutes = regular;

  emit("export interface FileRoutesByFullPath {");
  for (const r of leafRoutes) emit(`  '${r.path}': typeof ${r.routeVar};`);
  emit("}");

  emit("export interface FileRoutesByTo {");
  for (const r of leafRoutes) {
    const to = r.path === "/" ? "/" : r.path.replace(/\/$/, "");
    emit(`  '${to}': typeof ${r.routeVar};`);
  }
  emit("}");

  emit("export interface FileRoutesById {");
  emit(`  __root__: typeof ${root.routeVar};`);
  for (const r of nonRoot) {
    const children = childrenOf[r.fp];
    const typeRef =
      r.isLayout && children?.length ? `typeof ${r.routeVar}WithChildren` : `typeof ${r.routeVar}`;
    emit(`  '${r.fullId}': ${typeRef};`);
  }
  emit("}");

  emit("export interface FileRouteTypes {");
  emit("  fileRoutesByFullPath: FileRoutesByFullPath;");
  emit("  fullPaths:");
  for (const r of leafRoutes) emit(`    | '${r.path}'`);
  emit("  fileRoutesByTo: FileRoutesByTo;");
  emit("  to:");
  for (const r of leafRoutes) {
    const to = r.path === "/" ? "/" : r.path.replace(/\/$/, "");
    emit(`    | '${to}'`);
  }
  emit("  id:");
  emit(`    | '__root__'`);
  for (const r of nonRoot) emit(`    | '${r.fullId}'`);
  emit("  fileRoutesById: FileRoutesById;");
  emit("}");
  emit("");

  // Per-layout children interfaces and ._addFileChildren() wiring
  for (const layout of layouts) {
    const children = childrenOf[layout.fp];
    if (!children?.length) continue;

    emit(`const ${layout.routeVar}WithChildren = ${layout.routeVar}._addFileChildren({`);
    for (const c of children) emit(`  ${c.routeVar},`);
    emit("});");
    emit("");
  }

  // Root children
  const rootChildren = childrenOf["__root"] ?? [];
  emit("export const routeTree = rootRouteImport");
  emit("  ._addFileChildren({");
  for (const c of rootChildren) {
    const hasChildren = childrenOf[c.fp]?.length > 0;
    const val = c.isLayout && hasChildren ? `${c.routeVar}WithChildren` : c.routeVar;
    emit(`    ${c.routeVar}: ${val},`);
  }
  emit("  })");
  emit("  ._addFileTypes<FileRouteTypes>();");
  emit("");

  writeFileSync(OUTPUT_FILE, lines.join("\n"), "utf-8");
  console.log(`Generated ${OUTPUT_FILE}`);

  // Generate routeTypes.gen.d.ts for createFileRoute path type safety
  const allRoutes = [...layouts, ...regular].map((r) => r.fullId);
  const dtLines = [
    "// This file was automatically generated by generate-routes.",
    "// You should NOT make any changes in this file as it will be overwritten.",
    "// Run `pnpm generate-routes` to regenerate.",
    "",
    "export {};",
    "declare module 'rivvy-ui/router/route' {",
    "  interface FileRoutesByPath {",
    ...allRoutes.map((p) => `    '${p}': unknown;`),
    "  }",
    "}",
    "",
  ];
  writeFileSync(ROUTE_TYPES_FILE, dtLines.join("\n"), "utf-8");
  console.log(`Generated ${ROUTE_TYPES_FILE}`);
}

generate();
