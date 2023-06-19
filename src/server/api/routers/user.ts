import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { listingRouter } from "@/server/api/routers/user/listing";

export const userRouter = createTRPCRouter({
  listing: listingRouter,

  me: protectedProcedure.input(z.undefined()).query(({ ctx }) => ctx.user),
});
