import { Outlet } from "rivvy-ui/router/provider";
import { createFileRoute } from "rivvy-ui/router/route";

export const Route = createFileRoute("/_map")({
  component: MapLayout,
});

// eslint-disable-next-line react-refresh/only-export-components
function MapLayout() {
  return <Outlet />;
}
