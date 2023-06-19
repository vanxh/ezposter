import * as z from "zod"
import { PremiumTier } from "@prisma/client"
import { CompleteGameflipListing, RelatedGameflipListingModel, CompletePremiumKey, RelatedPremiumKeyModel } from "./index"

export const UserModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  clerkId: z.string(),
  email: z.string().nullish(),
  isAdmin: z.boolean(),
  premiumTier: z.nativeEnum(PremiumTier),
  premiumValidUntil: z.date().nullish(),
  gameflipApiKey: z.string().nullish(),
  gameflipApiSecret: z.string().nullish(),
  gameflipId: z.string().nullish(),
  autoPost: z.boolean(),
  postTime: z.number().int(),
  purgeOlderThan: z.number().int(),
  nPosted: z.number().int(),
  nPurged: z.number().int(),
})

export interface CompleteUser extends z.infer<typeof UserModel> {
  GameflipListing: CompleteGameflipListing[]
  PremiumKey: CompletePremiumKey[]
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  GameflipListing: RelatedGameflipListingModel.array(),
  PremiumKey: RelatedPremiumKeyModel.array(),
}))
