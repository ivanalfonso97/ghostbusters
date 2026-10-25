import { createContext } from "react";

import type { RouterContextValue } from "./types";

export const RouterContext = createContext<RouterContextValue | null>(null);
