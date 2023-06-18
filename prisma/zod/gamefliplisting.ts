import * as z from "zod"
import { CompleteUser, RelatedUserModel } from "./index"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]))

export const GameflipListingModel = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  kind: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  platform: z.string(),
  upc: z.string(),
  priceInCents: z.number().int(),
  accept_currency: z.string(),
  shippingWithinDays: z.number().int(),
  expiresWithinDays: z.number().int(),
  tags: jsonSchema,
  images: jsonSchema,
  autoPost: z.boolean(),
  userId: z.number().int(),
})

export interface CompleteGameflipListing extends z.infer<typeof GameflipListingModel> {
  user: CompleteUser
}

/**
 * RelatedGameflipListingModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedGameflipListingModel: z.ZodSchema<CompleteGameflipListing> = z.lazy(() => GameflipListingModel.extend({
  user: RelatedUserModel,
}))
