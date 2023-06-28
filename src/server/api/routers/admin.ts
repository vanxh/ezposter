import { z } from "zod";
import { PremiumTier } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";

export const adminRouter = createTRPCRouter({
  getPremiumKeys: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(10).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const keys = await ctx.prisma.premiumKey.findMany({
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      });

      const nKeys = await ctx.prisma.premiumKey.count();

      return {
        premiumKeys: keys,
        pagination: {
          page: input.page,
          pageSize: input.pageSize,
          totalPages: Math.ceil(nKeys / input.pageSize),
          totalItems: nKeys,
        },
      };
    }),

  createPremiumKey: adminProcedure
    .input(
      z.object({
        tier: z.nativeEnum(PremiumTier),
        duration: z.number().min(1).max(365).default(30), // days
      })
    )
    .mutation(async ({ ctx, input: { tier, duration } }) => {
      const premiumKey = await ctx.prisma.premiumKey.create({
        data: {
          key: uuidv4(),
          tier,
          duration,
        },
      });

      return premiumKey;
    }),

  deletePremiumKey: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input: { id } }) => {
      const premiumKey = await ctx.prisma.premiumKey.delete({
        where: { id },
      });

      return premiumKey;
    }),

  getUsers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(10).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      });

      const nUsers = await ctx.prisma.user.count();

      return {
        users,
        pagination: {
          page: input.page,
          pageSize: input.pageSize,
          totalPages: Math.ceil(nUsers / input.pageSize),
          totalItems: nUsers,
        },
      };
    }),
});
