import { getErrorMessage } from "rivvy-ui/lib/errors";

import { ExampleListSchema, ExampleSchema } from "./types";

// TEMPLATE: Every fetch call in this file follows the same pattern:
// 1. fetch() with credentials: "include" and X-Organization-ID header
// 2. Handle status codes explicitly (401 → typed error, others → throw)
// 3. Parse + validate with zodSchema.safeParse() before returning
// 4. Outer try/catch logs and re-throws with { cause: error }
//
// The /api/ prefix is proxied to the backend by Vite — see vite.config.ts.

export async function listExamples(organizationId?: string) {
  try {
    const response = await fetch("/api/examples", {
      method: "GET",
      credentials: "include",
      ...(organizationId && {
        headers: { "X-Organization-ID": organizationId },
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const err: Error & { status?: number } = new Error("Unauthorized");
        err.status = 401;
        throw err;
      }

      const body = await response.json();
      throw new Error(body.message || "Failed to list examples");
    }

    const data = await response.json();
    const validated = ExampleListSchema.safeParse(data);

    if (!validated.success) {
      console.error(validated.error);
      throw new Error("List examples validation failed");
    }

    return validated.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("List examples api error:", message);
    throw new Error("Could not list examples", { cause: error });
  }
}

export async function createExample(organizationId: string, name: string) {
  try {
    const response = await fetch("/api/examples", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Organization-ID": organizationId,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const err: Error & { status?: number } = new Error("Unauthorized");
        err.status = 401;
        throw err;
      }

      const body = await response.json();
      throw new Error(body.message || "Failed to create example");
    }

    const data = await response.json();
    const validated = ExampleSchema.safeParse(data);

    if (!validated.success) {
      console.error(validated.error);
      throw new Error("Create example validation failed");
    }

    return validated.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("Create example api error:", message);
    throw new Error("Could not create example", { cause: error });
  }
}
