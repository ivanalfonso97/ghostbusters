import { Outlet } from "rivvy-ui/router/provider";
import { createRootRoute } from "rivvy-ui/router/route";

export const Route = createRootRoute({
  component: RootComponent,
});

// eslint-disable-next-line react-refresh/only-export-components
function RootComponent() {
  return (
    <div className="min-h-screen antialiased">
      <Outlet />
    </div>
  );
}
