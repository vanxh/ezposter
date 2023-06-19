import { z } from "zod";
import { PremiumTier } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";

export const adminRouter = createTRPCRouter({
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
});
