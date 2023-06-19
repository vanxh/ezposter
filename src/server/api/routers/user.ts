import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { listingRouter } from "@/server/api/routers/user/listing";
import { getProfile } from "@/utils/gfapi";

export const userRouter = createTRPCRouter({
  listing: listingRouter,

  me: protectedProcedure.input(z.undefined()).query(({ ctx }) => ctx.user),

  update: protectedProcedure
    .input(
      z.object({
        autoPost: z.boolean().optional(),
        postTime: z.number().min(20).optional(), // in seconds
        purgeOlderThan: z.number().min(60).optional(), // in seconds
      })
    )
    .mutation(async ({ ctx, input }) => {
      const update = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          autoPost: input.autoPost,
          postTime: input.postTime,
          purgeOlderThan: input.purgeOlderThan,
        },
      });

      return update;
    }),

  connectGameflip: protectedProcedure
    .input(
      z.object({
        gameflipApiKey: z.string(),
        gameflipApiSecret: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const gameflipProfile = await getProfile("me", input);

      const update = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          gameflipApiKey: input.gameflipApiKey,
          gameflipApiSecret: input.gameflipApiSecret,
          gameflipId: gameflipProfile.owner,
        },
      });

      return {
        gameflipProfile,
        user: update,
      };
    }),
});
