import { useEffect, useState } from "react";

import { BrandProvider } from "rivvy-ui/brand/context";
import type { Brand } from "rivvy-ui/brand/types";
import { Loading } from "rivvy-ui/elements/Loading";
import { Notification } from "rivvy-ui/elements/Notification";
import { Outlet } from "rivvy-ui/router/provider";
import { createRootRoute } from "rivvy-ui/router/route";

export const Route = createRootRoute({
  component: RootComponent,
});

// eslint-disable-next-line react-refresh/only-export-components
function RootComponent() {
  const [brand, setBrand] = useState<Brand>();
  const [brandCssVars, setBrandCssVars] = useState<{ [key: string]: string }>();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadBranding() {
      if (ignore) return;

      try {
        const response = await fetch("/api/details");
        if (!response.ok) {
          throw new Error("Failed to load details");
        }

        const brandDetails: Brand = await response.json();
        setBrand(brandDetails);

        const cssVarKeys = Object.fromEntries(
          Object.entries(brandDetails.colors).filter(([k]) => k.startsWith("--"))
        );
        setBrandCssVars(cssVarKeys);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "An unknown error occurred");
      }
    }

    loadBranding();

    return () => {
      ignore = true;
    };
  }, []);

  if (!brand) {
    return message ? (
      <div className="absolute top-4 left-1/2 z-50 w-full max-w-sm -translate-x-1/2">
        <Notification body={message} type="error" hasIcon persistent />
      </div>
    ) : (
      <Loading />
    );
  }

  return (
    <div
      className="text-dark-default flex min-h-screen antialiased"
      style={{ ...brandCssVars }}
    >
      <BrandProvider brand={brand}>
        <Outlet />
      </BrandProvider>
    </div>
  );
}
