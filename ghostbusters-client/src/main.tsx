import ReactDOM from "react-dom/client";
import { z } from "zod/v4";
import { en } from "zod/v4/locales";

import { RouterProvider } from "rivvy-ui/router/provider";
import { createRouter } from "rivvy-ui/router/route";

import { routeTree } from "./routeTree.gen";

z.config(en());

const router = createRouter({ routeTree });

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
