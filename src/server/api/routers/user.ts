import { z } from "zod";
import { type User } from "@prisma/client";

import {
  createTRPCRouter,
  gameflipProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { listingRouter } from "@/server/api/routers/user/listing";
import GFApi from "@/lib/gfapi";
import {
  getListingLimit,
  recommendedPostTime,
  recommendedPurgeTime,
} from "@/utils/gfapi";
import { isGameflipConnected, isPremium } from "@/utils/db";
import { MIN_POST_INTERVAL_IN_SECONDS } from "@/constants";
import AutoPostQueue from "@/pages/api/autopost";
import AutoPurgeQueue from "@/pages/api/autopurge";

const syncAutoPostQueue = async (user: User) => {
  if (!user.autoPost || !isPremium(user) || !isGameflipConnected(user)) {
    await AutoPostQueue.delete(`${user.id}`);
  }

  let autoPostJob = await AutoPostQueue.getById(`${user.id}`);

  if (!autoPostJob) {
    autoPostJob = await AutoPostQueue.enqueue(user.id, {
      id: `${user.id}`,
      repeat: {
        every: user.postTime * 1000,
      },
    });
  }

  if (user.postTime * 1000 !== autoPostJob?.repeat?.every) {
    await AutoPostQueue.enqueue(user.id, {
      id: `${user.id}`,
      override: true,
      repeat: {
        every: user.postTime * 1000,
      },
    });
  }

  return autoPostJob;
};

const syncAutoPurgeQueue = async (user: User) => {
  if (!user.autoPost || !isPremium(user) || !isGameflipConnected(user)) {
    await AutoPurgeQueue.delete(`${user.id}`);
  }

  let autoPurgeJob = await AutoPurgeQueue.getById(`${user.id}`);

  let repeat = 5 * 60 * 1000;
  if (user.postTime <= 120) {
    repeat = 4 * 60 * 1000;
  }
  if (user.postTime <= 60) {
    repeat = 2 * 60 * 1000;
  }
  if (user.postTime <= 30) {
    repeat = 1 * 60 * 1000;
  }

  if (!autoPurgeJob) {
    autoPurgeJob = await AutoPurgeQueue.enqueue(user.id, {
      id: `${user.id}`,
      repeat: {
        every: repeat,
      },
    });
  }

  return autoPurgeJob;
};

export const userRouter = createTRPCRouter({
  listing: listingRouter,

  me: protectedProcedure.input(z.undefined()).query(({ ctx }) => ctx.user),

  update: protectedProcedure
    .input(
      z.object({
        autoPost: z.boolean().optional(),
        postTime: z.number().min(20).optional(), // in seconds
        purgeOlderThan: z.number().min(60).optional(), // in seconds
        customListingImage: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.autoPost && !isPremium(ctx.user)) {
        throw new Error("You need to be premium to use auto post");
      }

      if (
        input.postTime &&
        input.postTime < MIN_POST_INTERVAL_IN_SECONDS[ctx.user.premiumTier]
      ) {
        throw new Error(
          `Minimum post interval for your tier is ${
            MIN_POST_INTERVAL_IN_SECONDS[ctx.user.premiumTier]
          } seconds`
        );
      }

      const update = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          autoPost: input.autoPost,
          postTime: input.postTime,
          purgeOlderThan: input.purgeOlderThan,
          customListingImage: input.customListingImage,
        },
      });

      await syncAutoPostQueue(update);
      await syncAutoPurgeQueue(update);

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
      if (!input.gameflipApiKey || !input.gameflipApiSecret) {
        const disconnectedUser = await ctx.prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            gameflipApiKey: null,
            gameflipApiSecret: null,
            gameflipId: null,
            autoPost: false,
          },
        });

        return {
          user: disconnectedUser,
        };
      }

      const gfapi = new GFApi(input);
      const gameflipProfile = await gfapi.getMe();

      const update = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          gameflipApiKey: input.gameflipApiKey,
          gameflipApiSecret: input.gameflipApiSecret,
          gameflipId: gameflipProfile.owner,
        },
      });

      await syncAutoPostQueue(update);
      await syncAutoPurgeQueue(update);

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

      await syncAutoPostQueue(update);
      await syncAutoPurgeQueue(update);

      return update;
    }),

  getGameflipProfile: gameflipProcedure
    .input(z.undefined())
    .query(async ({ ctx }) => {
      if (!ctx.user.gameflipApiKey || !ctx.user.gameflipApiSecret) return null;

      const gfapi = new GFApi({
        gameflipApiKey: ctx.user.gameflipApiKey,
        gameflipApiSecret: ctx.user.gameflipApiSecret,
      });
      const gameflipProfile = await gfapi.getMe();

      return {
        gameflipProfile,
        listingLimit: getListingLimit(gameflipProfile.sell),
        recommendedPostTime: recommendedPostTime(gameflipProfile.sell),
        recommendedPurgeTime: recommendedPurgeTime(gameflipProfile.sell),
      };
    }),
});
