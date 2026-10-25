import { useContext } from "react";

import { RouterContext } from "./routerContext";
import type { AnyRoute } from "./types";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FileRoutesByPath {} // augmented by routeTypes.gen.d.ts

type ValidRoutePath = keyof FileRoutesByPath extends never ? string : keyof FileRoutesByPath;

export interface RouteConfig<TSearch = Record<string, never>> {
  component?: React.ComponentType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lazyImport?: () => Promise<{ Route: RouteImpl<any> }>;
  validateSearch?: (search: Record<string, unknown>) => TSearch;
  /** Read by generate-routes.js: bundles this route eagerly instead of code-splitting it. */
  eager?: boolean;
}

export class RouteImpl<TSearch = Record<string, never>> implements AnyRoute {
  id: string = "";
  fullPath: string = "";
  component?: React.ComponentType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lazyImport?: () => Promise<{ Route: RouteImpl<any> }>;
  _lazy?: React.LazyExoticComponent<React.ComponentType>;
  validateSearch?: (search: Record<string, unknown>) => TSearch;
  getParentRoute?: () => AnyRoute;
  children: AnyRoute[] = [];

  constructor(routePath: string, config: RouteConfig<TSearch>) {
    this.fullPath = routePath;
    this.component = config.component;
    this.validateSearch = config.validateSearch;
    this.lazyImport = config.lazyImport;
  }

  useSearch(): TSearch {
    const ctx = useContext(RouterContext);
    if (!ctx) throw new Error("useSearch must be called within RouterProvider");
    const params = Object.fromEntries(new URLSearchParams(ctx.location.search));
    return this.validateSearch
      ? this.validateSearch(params)
      : (params as unknown as TSearch);
  }

  update(config: { id: string; path?: string; getParentRoute: () => AnyRoute }): this {
    this.id = config.id;
    if (config.path !== undefined) {
      this.fullPath = config.path;
    }
    this.getParentRoute = config.getParentRoute;
    return this;
  }

  _addFileChildren(children: Record<string, AnyRoute>): this {
    this.children = Object.values(children);
    return this;
  }

  // Accepts type parameter for compatibility with routeTree.gen.ts shape but does nothing at runtime
  _addFileTypes<_T>(): this {
    return this;
  }
}

export function createRootRoute(config: RouteConfig): RouteImpl {
  const route = new RouteImpl("", config);
  route.id = "__root__";
  return route;
}

export function createFileRoute(routePath: ValidRoutePath) {
  return function <TSearch = Record<string, never>>(
    config: RouteConfig<TSearch>
  ): RouteImpl<TSearch> {
    return new RouteImpl<TSearch>(routePath, config);
  };
}

export function createRouter(config: { routeTree: AnyRoute }): { routeTree: AnyRoute } {
  return { routeTree: config.routeTree };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLazyFileRoute(lazyImport: () => Promise<{ Route: RouteImpl<any> }>): RouteImpl {
  return new RouteImpl("", { lazyImport });
}
