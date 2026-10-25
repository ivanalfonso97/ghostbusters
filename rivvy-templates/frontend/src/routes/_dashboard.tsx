import { useEffect, useState } from "react";

import { useBrandContext } from "rivvy-ui/brand/context";
import { getAuthUrlByBrand } from "rivvy-ui/brand/types";
import { Loading } from "rivvy-ui/elements/Loading";
import { Notification } from "rivvy-ui/elements/Notification";
import { Outlet } from "rivvy-ui/router/provider";
import { createFileRoute } from "rivvy-ui/router/route";

// TEMPLATE: Import your own layout components (Header, Sidebar, etc.) from @/components/layout/
// TEMPLATE: Import the session/user fetch function from your own feature, e.g. @/features/user/api
// TEMPLATE: Import your own context providers, e.g. UserProvider, OrgDetailsProvider

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});

// eslint-disable-next-line react-refresh/only-export-components
function DashboardLayout() {
  const brand = useBrandContext();
  // TEMPLATE: Replace with your own session/user type and fetch
  const [isReady, setIsReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        // TEMPLATE: Replace with your own session endpoint, e.g. /api/person/details
        const response = await fetch("/api/session", {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401) {
          // Redirect to the auth app for this brand — do NOT use the router here.
          window.location.href = getAuthUrlByBrand(brand);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load session");
        }

        // TEMPLATE: Parse the response, set context state, redirect if needed
        // const data = await response.json();
        // setUser(data);

        setIsReady(true);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "An unknown error occurred");
      }
    }

    loadSession();
  }, [brand]);

  if (!isReady) {
    return message ? (
      <div className="absolute top-4 left-1/2 z-50 w-full max-w-sm -translate-x-1/2">
        <Notification body={message} type="error" hasIcon persistent />
      </div>
    ) : (
      <Loading />
    );
  }

  return (
    // TEMPLATE: Wrap Outlet in your context providers, e.g.:
    // <UserProvider user={user} setUser={setUser}>
    //   <Header />
    //   <div className="w-full flex-1 px-6 pt-26 pb-6 sm:mb-10 sm:px-10 sm:pt-28 lg:ml-70 lg:block lg:pt-10">
    //     <Outlet />
    //   </div>
    // </UserProvider>
    <Outlet />
  );
}
