import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.input(z.undefined()).query(async ({ ctx }) => {
    const clerkId = ctx.auth.userId;
    const email = ctx.auth.user?.emailAddresses.at(0)?.emailAddress;

    let user = await ctx.prisma.user.findUnique({
      where: {
        clerkId,
      },
    });

    if (!user) {
      user = await ctx.prisma.user.create({
        data: {
          clerkId,
          email,
        },
      });
    }

    return user;
  }),
});
