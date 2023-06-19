import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { listingRouter } from "@/server/api/routers/user/listing";
import { getProfile } from "@/utils/gfapi";
import { isPremium } from "@/utils/db";

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

  redeemPremiumKey: protectedProcedure
    .input(
      z.object({
        key: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const premiumKey = await ctx.prisma.premiumKey.findUnique({
        where: { key: input.key },
      });

      if (!premiumKey || premiumKey.usedById) {
        throw new Error("Invalid key");
      }

      let premiumValidUntil = new Date();
      if (isPremium(ctx.user)) {
        if (ctx.user.premiumTier === premiumKey.tier) {
          premiumValidUntil = new Date(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ctx.user.premiumValidUntil!.getTime() +
              premiumKey.duration * 24 * 60 * 60 * 1000
          );
        } else if (ctx.user.premiumTier < premiumKey.tier) {
          premiumValidUntil = new Date(
            new Date().getTime() +
              (premiumKey.duration * 24 * 60 * 60 * 1000) / 2
          );
        }
      } else {
        premiumValidUntil = new Date(
          new Date().getTime() + premiumKey.duration * 24 * 60 * 60 * 1000
        );
      }

      const update = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          premiumValidUntil,
          premiumTier: premiumKey.tier,
        },
      });

      await ctx.prisma.premiumKey.update({
        where: { key: input.key },
        data: {
          usedById: ctx.user.id,
        },
      });

      return update;
    }),
});
