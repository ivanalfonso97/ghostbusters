import { useContext, useMemo } from "react";

import { RouterContext } from "./routerContext";

export function useNavigate() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useNavigate must be called within RouterProvider");
  return ctx.navigate;
}

export function useSearch(): Record<string, string> {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useSearch must be called within RouterProvider");
  const search = ctx.location.search;
  return useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search]);
}

export function usePathname(): string {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("usePathname must be called within RouterProvider");
  return ctx.location.pathname;
}
