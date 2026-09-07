import { z } from "zod";

export const createTenantSchema = z
  .object({
    leadId: z.string().uuid(),
    propertyId: z.string().uuid(),
    leaseStart: z.string().datetime(),
    leaseEnd: z.string().datetime().optional().nullable(),
    monthlyRent: z.string().min(1).max(50),
    depositHeld: z.string().max(50).optional().nullable(),
  })
  .strict();

export const updateTenantSchema = z
  .object({
    leaseEnd: z.string().datetime().optional().nullable(),
    monthlyRent: z.string().min(1).max(50).optional(),
    depositHeld: z.string().max(50).optional().nullable(),
    status: z.enum(["Active", "Ended", "Renewed"]).optional(),
  })
  .strict();

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
