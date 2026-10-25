import { z } from "zod/v4";

// TEMPLATE: Define all Zod schemas for this feature here.
// Always derive TypeScript types from schemas — never write them by hand.
// Use .transform() to compute display-ready values at parse time (e.g. formatted dates).

export const ExampleSchema = z.object({
  id: z.uuid(),
  status: z.enum(["active", "archived"]),
  name: z.string(),
  createdAt: z.string().transform((val) => new Date(val).toLocaleDateString()),
});

export type Example = z.infer<typeof ExampleSchema>;

export const ExampleListSchema = z.array(ExampleSchema);
