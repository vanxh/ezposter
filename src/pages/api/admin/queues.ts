import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { type User } from "@prisma/client";

import { appRouter } from "@/server/api/root";
import { prisma } from "@/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const caller = appRouter.createCaller({
    prisma,
    auth: getAuth(req),
    user: undefined as User | undefined,
  });

  try {
    const queues = await caller.admin.getQueues();

    res.status(200).json(queues);
  } catch (cause) {
    // If this a tRPC error, we can extract additional information.
    if (cause instanceof TRPCError) {
      // We can get the specific HTTP status code coming from tRPC (e.g. 404 for `NOT_FOUND`).
      const httpStatusCode = getHTTPStatusCodeFromError(cause);

      res.status(httpStatusCode).json({ error: { message: cause.message } });
      return;
    }

    // This is not a tRPC error, so we don't have specific information.
    res.status(500).json({
      error: { message: "Unknown error" },
    });
  }
}
