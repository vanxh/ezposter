import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  premiumProcedure,
} from "@/server/api/trpc";

import {
  GAMEFLIP_CATEGORIES,
  GAMEFLIP_PLATFORMS,
  GAMEFLIP_UPCS,
  MAX_LISTINGS_PER_USER,
} from "@/constants";

export const listingRouter = createTRPCRouter({
  summary: protectedProcedure.query(async ({ ctx }) => {
    const nListings = await ctx.prisma.gameflipListing.count({
      where: { userId: ctx.user.id },
    });

    return {
      total: nListings,
      limit: MAX_LISTINGS_PER_USER[ctx.user.premiumTier],
    };
  }),

  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(15).max(100).default(15),
      })
    )
    .query(async ({ ctx, input }) => {
      const listings = await ctx.prisma.gameflipListing.findMany({
        where: { userId: ctx.user.id },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      });

      const nListings = await ctx.prisma.gameflipListing.count({
        where: { userId: ctx.user.id },
      });

      return {
        listings,
        pagination: {
          page: input.page,
          pageSize: input.pageSize,
          totalPages: Math.ceil(nListings / input.pageSize),
          totalItems: nListings,
        },
      };
    }),

  create: premiumProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().min(1).max(1000),
        category: z.nativeEnum(GAMEFLIP_CATEGORIES),
        platform: z.nativeEnum(GAMEFLIP_PLATFORMS),
        upc: z.nativeEnum(GAMEFLIP_UPCS),
        priceInCents: z
          .number()
          .min(75)
          .max(9999 * 100),
        shippingWithinDays: z.number().min(1).max(3),
        expiresWithinDays: z.number().min(1).max(30),
        tags: z.array(z.string().min(1).max(100)).max(20, {
          message: "You can only have up to 20 tags",
        }),
        images: z.array(z.string()).max(5, {
          message: "You can only have up to 5 images",
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const nListings = await ctx.prisma.gameflipListing.count({
        where: { userId: ctx.user.id },
      });

      if (nListings >= MAX_LISTINGS_PER_USER[ctx.user.premiumTier]) {
        throw new Error("You have reached the maximum number of listings.");
      }

      const listing = await ctx.prisma.gameflipListing.create({
        data: {
          ...input,
          user: {
            connect: {
              id: ctx.user.id,
            },
          },
        },
      });

      return listing;
    }),
});
