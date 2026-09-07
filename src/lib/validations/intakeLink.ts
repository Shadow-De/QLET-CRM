import { z } from "zod";

export const createIntakeLinkSchema = z
  .object({
    // Optional: pre-associate with a specific lead
    leadId: z.string().uuid().optional().nullable(),
    // Override the default expiry in days (1-30)
    expiryDays: z.number().int().min(1).max(30).optional(),
  })
  .strict();

export type CreateIntakeLinkInput = z.infer<typeof createIntakeLinkSchema>;
