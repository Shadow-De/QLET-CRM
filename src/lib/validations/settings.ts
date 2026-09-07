import { z } from "zod";

export const updateSettingsSchema = z
  .object({
    defaultLinkExpiryDays: z.number().int().min(1).max(30).optional(),
    emailOnNewLead: z.boolean().optional(),
  })
  .strict();

export const deleteAccountSchema = z
  .object({
    currentPassword: z.string().min(1),
    confirmPhrase: z.literal("DELETE MY ACCOUNT"),
  })
  .strict();

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
