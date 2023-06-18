import * as z from "zod"
import { PremiumTier } from "@prisma/client"

export const UserModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  clerkId: z.string(),
  email: z.string().nullish(),
  premiumTier: z.nativeEnum(PremiumTier),
  premiumValidUntil: z.date().nullish(),
  gameflipApiKey: z.string().nullish(),
  gameflipApiSecret: z.string().nullish(),
  gameflipId: z.string().nullish(),
  autoPost: z.boolean(),
  postTime: z.number().int().nullish(),
  purgeOlderThan: z.number().int().nullish(),
  nPosted: z.number().int(),
  nPurged: z.number().int(),
})
