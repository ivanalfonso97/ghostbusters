import { useEffect, useState } from "react";

import { useBrandContext } from "rivvy-ui/brand/context";
import { getAuthUrlByBrand } from "rivvy-ui/brand/types";
import { PageTitle } from "rivvy-ui/layout/PageTitle";
import { getErrorMessage } from "rivvy-ui/lib/errors";
import { createFileRoute } from "rivvy-ui/router/route";

import { listExamples } from "@/features/example/api";
import type { Example } from "@/features/example/types";

export const Route = createFileRoute("/_dashboard/")({
  // Landing page is eager so it's ready as soon as the layout finishes loading.
  // All other routes should use createLazyFileRoute instead.
  eager: true,
  component: IndexPage,
});

// eslint-disable-next-line react-refresh/only-export-components
function IndexPage() {
  const brand = useBrandContext();
  const [examples, setExamples] = useState<Example[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listExamples();
        setExamples(data);
      } catch (error: unknown) {
        // 401 errors bubble up as typed errors from the api layer — redirect immediately.
        if (error && typeof error === "object" && "status" in error && error.status === 401) {
          window.location.href = getAuthUrlByBrand(brand);
        } else {
          console.error("Error fetching examples", getErrorMessage(error));
        }
      }
    };

    load();
  }, [brand]);

  return (
    <div className="flex flex-col gap-10">
      <PageTitle title="Home" />
      {/* TEMPLATE: Replace with your own components */}
      <ul>
        {examples.map((example) => (
          <li key={example.id}>{example.name}</li>
        ))}
      </ul>
    </div>
  );
}
