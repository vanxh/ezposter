import * as z from "zod"

export const ExampleModel = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
