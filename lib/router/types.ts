import type React from "react";

export interface RouterLocation {
  pathname: string;
  search: string;
  hash: string;
}

export interface NavigateOptions {
  to: string;
  search?: Record<string, unknown>;
}

export interface AnyRoute {
  id: string;
  fullPath: string;
  component?: React.ComponentType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lazyImport?: () => Promise<{ Route: any }>;
  _lazy?: React.LazyExoticComponent<React.ComponentType>;
  children: AnyRoute[];
  validateSearch?: (search: Record<string, unknown>) => unknown;
  getParentRoute?: () => AnyRoute;
}

export interface RouterContextValue {
  location: RouterLocation;
  navigate: (options: NavigateOptions) => void;
  matchedRoutes: AnyRoute[];
}
