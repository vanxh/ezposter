import { initTRPC, type inferAsyncReturnType, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { getAuth } from "@clerk/nextjs/server";
import type {
  SignedInAuthObject,
  SignedOutAuthObject,
} from "@clerk/nextjs/server";
import { type User } from "@prisma/client";

import { prisma } from "@/server/db";
import { isPremium } from "@/utils/db";

interface AuthContext {
  auth: SignedInAuthObject | SignedOutAuthObject;
}

const createInnerTRPCContext = ({ auth }: AuthContext) => {
  return { prisma, auth, user: undefined as User | undefined };
};

export const createTRPCContext = (_opts: CreateNextContextOptions) => {
  return createInnerTRPCContext({ auth: getAuth(_opts.req) });
};

export type Context = inferAsyncReturnType<typeof createTRPCContext>;

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const isAuthed = t.middleware(async ({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized to perform this action.",
    });
  }

  let user = await ctx.prisma.user.findUnique({
    where: {
      clerkId: ctx.auth.userId,
    },
  });

  if (!user) {
    user = await ctx.prisma.user.create({
      data: {
        clerkId: ctx.auth.userId,
        email: ctx.auth.user?.emailAddresses.at(0)?.emailAddress,
      },
    });
  }

  return next({
    ctx: {
      auth: ctx.auth,
      user,
    },
  });
});

export const isPremiumMiddleware = t.middleware(async ({ next, ctx }) => {
  if (!ctx.user || !isPremium(ctx.user)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be a premium member to perform this action.",
    });
  }

  return next();
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
