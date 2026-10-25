import { createContext, useState, useEffect, useCallback, useContext, useMemo, lazy, Suspense, type ComponentType } from "react";

import { RouterContext } from "./routerContext";
import type { AnyRoute, NavigateOptions, RouterLocation } from "./types";

const OutletDepthContext = createContext(1);

function normalizePath(p: string): string {
  if (p === "/") return "/";
  return p.replace(/\/$/, "");
}

function matchRoutes(root: AnyRoute, pathname: string): AnyRoute[] {
  const normalizedUrl = normalizePath(pathname);

  function findMatch(route: AnyRoute, chain: AnyRoute[]): AnyRoute[] | null {
    const next = [...chain, route];

    if (route.children.length === 0) {
      return normalizePath(route.fullPath) === normalizedUrl ? next : null;
    }

    for (const child of route.children) {
      const result = findMatch(child, next);
      if (result) return result;
    }

    return null;
  }

  return findMatch(root, []) ?? [root];
}

interface Router {
  routeTree: AnyRoute;
}

export function RouterProvider({ router }: { router: Router }) {
  const [location, setLocation] = useState<RouterLocation>(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  }));

  useEffect(() => {
    const handler = () => {
      setLocation({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      });
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navigate = useCallback(({ to, search }: NavigateOptions) => {
    const url = new URL(to, window.location.origin);
    if (search) {
      for (const [k, v] of Object.entries(search)) {
        url.searchParams.set(k, String(v));
      }
    }
    const nextUrl = url.pathname + url.search + url.hash;
    const currentUrl = window.location.pathname + window.location.search + window.location.hash;
    if (nextUrl === currentUrl) return;

    window.history.pushState({}, "", nextUrl);
    setLocation({
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
    });
  }, []);

  const matchedRoutes = useMemo(
    () => matchRoutes(router.routeTree, location.pathname),
    [router.routeTree, location.pathname]
  );
  const RootComponent = matchedRoutes[0]?.component;

  const contextValue = useMemo(
    () => ({ location, navigate, matchedRoutes }),
    [location, navigate, matchedRoutes]
  );

  return (
    <RouterContext.Provider value={contextValue}>
      <OutletDepthContext.Provider value={1}>
        {RootComponent ? <RootComponent /> : null}
      </OutletDepthContext.Provider>
    </RouterContext.Provider>
  );
}

export function Outlet() {
  const depth = useContext(OutletDepthContext);
  const ctx = useContext(RouterContext);
  if (!ctx) return null;

  const route = ctx.matchedRoutes.at(depth);
  if (!route) return null;

  if (route.lazyImport) {
    if (!route._lazy) {
      const lazyImport = route.lazyImport;
      route._lazy = lazy(() =>
        lazyImport().then((m) => ({ default: m.Route.component as ComponentType }))
      );
    }
    const LazyComponent = route._lazy;
    return (
      <OutletDepthContext.Provider value={depth + 1}>
        <Suspense fallback={null}>
          <LazyComponent />
        </Suspense>
      </OutletDepthContext.Provider>
    );
  }

  if (!route.component) return null;

  const Component = route.component;
  return (
    <OutletDepthContext.Provider value={depth + 1}>
      <Component />
    </OutletDepthContext.Provider>
  );
}
