import { z } from "zod/v4";

// Shared schema for plain { message: string } responses from write endpoints.
export const messageResponseSchema = z.object({
  message: z.string(),
});
