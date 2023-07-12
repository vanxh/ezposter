import { z } from "zod";
import { utapi } from "uploadthing/server";

import {
  createTRPCRouter,
  protectedProcedure,
  premiumProcedure,
  gameflipProcedure,
} from "@/server/api/trpc";
import {
  GAMEFLIP_CATEGORIES,
  GAMEFLIP_PLATFORMS,
  GAMEFLIP_UPCS,
  MAX_LISTINGS_PER_USER,
} from "@/constants";
import GFApi from "@/lib/gfapi";
import { createListingQuery } from "@/utils/gfapi";
import { GameflipListingModel } from "@/prisma/zod";

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
        pageSize: z.number().min(10).max(50).default(10),
        cursor: z.number().min(1).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const page = input.cursor || input.page;
      const listings = await ctx.prisma.gameflipListing.findMany({
        where: { userId: ctx.user.id },
        skip: (page - 1) * input.pageSize,
        take: input.pageSize,
      });

      const nListings = await ctx.prisma.gameflipListing.count({
        where: { userId: ctx.user.id },
      });

      return {
        listings,
        pagination: {
          page: page,
          pageSize: input.pageSize,
          totalPages: Math.ceil(nListings / input.pageSize),
          totalItems: nListings,
        },
      };
    }),

  getOne: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const listing = await ctx.prisma.gameflipListing.findUnique({
        where: { id: input.id },
      });

      return listing;
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
        expiresWithinDays: z.number().min(1).max(365),
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

  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.gameflipListing.delete({
        where: { id: input.id },
      });
      await utapi.deleteFiles(
        (listing.images as string[]).map(
          (url) => url.split("/").pop() as string
        )
      );

      return true;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
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
        expiresWithinDays: z.number().min(1).max(365),
        tags: z.array(z.string().min(1).max(100)).max(20, {
          message: "You can only have up to 20 tags",
        }),
        images: z.array(z.string()).max(5, {
          message: "You can only have up to 5 images",
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.gameflipListing.update({
        where: { id: input.id },
        data: input,
      });

      return listing;
    }),

  enable: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.gameflipListing.update({
        where: { id: input.id },
        data: { autoPost: true },
      });

      return listing;
    }),

  disable: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.gameflipListing.update({
        where: { id: input.id },
        data: { autoPost: false },
      });

      return listing;
    }),

  import: gameflipProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const gfapi = new GFApi({
        gameflipApiKey: ctx.user.gameflipApiKey as string,
        gameflipApiSecret: ctx.user.gameflipApiSecret as string,
        gameflipId: ctx.user.gameflipId as string,
      });

      const listing = await gfapi.getListing(
        input.id.split("/").pop() as string
      );

      return listing;
    }),

  post: gameflipProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.prisma.gameflipListing.findUnique({
        where: { id: input.id },
      });

      if (!listing) {
        throw new Error("Listing not found");
      }

      const listingQuery = createListingQuery(listing, {
        gameflipApiKey: ctx.user.gameflipApiKey as string,
        gameflipApiSecret: ctx.user.gameflipApiSecret as string,
        gameflipId: ctx.user.gameflipId as string,
      });

      const gfapi = new GFApi({
        gameflipApiKey: ctx.user.gameflipApiKey as string,
        gameflipApiSecret: ctx.user.gameflipApiSecret as string,
        gameflipId: ctx.user.gameflipId as string,
      });

      const listingId = await gfapi.postListing(
        listingQuery,
        listing.images as string[]
      );

      return listingId;
    }),

  postCustomListing: gameflipProcedure
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
        expiresWithinDays: z.number().min(1).max(365),
        tags: z.array(z.string().min(1).max(100)).max(20, {
          message: "You can only have up to 20 tags",
        }),
        images: z.array(z.string()).max(5, {
          message: "You can only have up to 5 images",
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = GameflipListingModel.parse({
        ...input,
        kind: "item",
        accept_currency: "USD",
        id: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        autoPost: false,
        userId: ctx.user.id,
      });

      const listingQuery = createListingQuery(listing, {
        gameflipApiKey: ctx.user.gameflipApiKey as string,
        gameflipApiSecret: ctx.user.gameflipApiSecret as string,
        gameflipId: ctx.user.gameflipId as string,
      });

      const gfapi = new GFApi({
        gameflipApiKey: ctx.user.gameflipApiKey as string,
        gameflipApiSecret: ctx.user.gameflipApiSecret as string,
        gameflipId: ctx.user.gameflipId as string,
      });

      const listingId = await gfapi.postListing(
        listingQuery,
        listing.images as string[]
      );

      return listingId;
    }),
});
