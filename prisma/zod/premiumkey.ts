import * as z from "zod"
import { PremiumTier } from "@prisma/client"
import { CompleteUser, RelatedUserModel } from "./index"

export const PremiumKeyModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  key: z.string(),
  tier: z.nativeEnum(PremiumTier),
  duration: z.number().int(),
  usedById: z.number().int().nullish(),
})

export interface CompletePremiumKey extends z.infer<typeof PremiumKeyModel> {
  usedBy?: CompleteUser | null
}

/**
 * RelatedPremiumKeyModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPremiumKeyModel: z.ZodSchema<CompletePremiumKey> = z.lazy(() => PremiumKeyModel.extend({
  usedBy: RelatedUserModel.nullish(),
}))
