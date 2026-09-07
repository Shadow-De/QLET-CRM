import { z } from "zod";

export const createPropertySchema = z
  .object({
    title: z.string().min(1).max(300),
    address: z.string().min(1).max(500),
    city: z.string().max(100).default("Malta"),
    type: z.enum(["apartment", "house", "penthouse", "townhouse", "studio"]),
    bedrooms: z.number().int().min(0).max(30).default(1),
    bathrooms: z.number().int().min(0).max(20).optional(),
    monthlyRent: z.string().min(1).max(50),
    landlordName: z.string().max(200).optional().nullable(),
    ownerPhone: z.string().max(50).optional().nullable(),
    available: z.boolean().default(true),
    availableFrom: z.string().datetime().optional().nullable(),
    description: z.string().max(10000).optional(),
    epcRating: z.enum(["A", "B", "C", "D", "E", "F", "G"]).optional().nullable(),
  })
  .strict();

export const updatePropertySchema = z
  .object({
    title: z.string().min(1).max(300).optional(),
    address: z.string().min(1).max(500).optional(),
    city: z.string().max(100).optional(),
    type: z.enum(["apartment", "house", "penthouse", "townhouse", "studio"]).optional(),
    bedrooms: z.number().int().min(0).max(30).optional(),
    bathrooms: z.number().int().min(0).max(20).optional().nullable(),
    monthlyRent: z.string().min(1).max(50).optional(),
    landlordName: z.string().max(200).optional().nullable(),
    ownerPhone: z.string().max(50).optional().nullable(),
    available: z.boolean().optional(),
    availabilityStatus: z.enum(["Pending", "Available Now", "Available Soon", "Rented"]).optional(),
    availableFrom: z.string().datetime().optional().nullable(),
    description: z.string().max(10000).optional().nullable(),
    epcRating: z.enum(["A", "B", "C", "D", "E", "F", "G"]).optional().nullable(),
  })
  .strict();

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
