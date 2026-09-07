import { z } from "zod";

export const createLeadSchema = z
  .object({
    name: z.string().min(1).max(200),
    email: z.string().email().max(255),
    phone: z.string().max(30).optional(),
    nationality: z.string().max(100).optional(),
    area: z.string().max(200).optional(),
    propertyType: z
      .enum(["apartment", "house", "penthouse", "townhouse", "studio"])
      .optional(),
    bedrooms: z.number().int().min(0).max(20).optional(),
    budget: z.string().max(50).optional(),
    source: z
      .enum(["Rightmove", "Zoopla", "Referral", "Direct", "Other"])
      .optional(),
    notes: z.string().max(5000).optional(),
  })
  .strict();

export const updateLeadSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().max(30).optional().nullable(),
    nationality: z.string().max(100).optional().nullable(),
    area: z.string().max(200).optional().nullable(),
    propertyType: z
      .enum(["apartment", "house", "penthouse", "townhouse", "studio"])
      .optional()
      .nullable(),
    bedrooms: z.number().int().min(0).max(20).optional().nullable(),
    budget: z.string().max(50).optional().nullable(),
    status: z
      .enum(["New", "Contacted", "Viewing", "Negotiating", "Won", "Lost"])
      .optional(),
    source: z
      .enum(["Rightmove", "Zoopla", "Referral", "Direct", "Other"])
      .optional()
      .nullable(),
    notes: z.string().max(5000).optional().nullable(),
  })
  .strict();

export const publicLeadSchema = z
  .object({
    intakeLinkId: z.string().uuid(),
    name: z.string().min(1).max(200),
    email: z.string().email().max(255),
    phone: z.string().max(30).optional(),
    nationality: z.string().max(100).optional(),
    area: z.string().max(200).optional(),
    propertyType: z
      .enum(["apartment", "house", "penthouse", "townhouse", "studio"])
      .optional(),
    bedrooms: z.number().int().min(0).max(20).optional(),
    budget: z.string().max(50).optional(),
    notes: z.string().max(5000).optional(),
    // Honeypot — must be empty
    website: z.literal("").optional(),
    // Turnstile token
    turnstileToken: z.string().min(1),
  })
  .strict();

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type PublicLeadInput = z.infer<typeof publicLeadSchema>;
