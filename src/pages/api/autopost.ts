import { Queue } from "quirrel/next";
import { type GameflipListing } from "@prisma/client";

import { prisma } from "@/server/db";
import GFApi from "@/lib/gfapi";
import { isGameflipConnected, isPremium } from "@/utils/db";
import { createListingQuery } from "@/utils/gfapi";

export default Queue("api/autopost", async (userId: number) => {
  console.log(`[${new Date().toLocaleTimeString()}] User ${userId} auto post`);

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user || !isPremium(user) || !user.autoPost || !isGameflipConnected(user))
    return;

  const nListings = await prisma.gameflipListing.count({
    where: {
      userId: user.id,
      autoPost: true,
    },
  });
  if (!nListings) return;

  const listing = (
    await prisma.$queryRawUnsafe<GameflipListing[]>(
      `SELECT * FROM GameflipListing WHERE userId = ${user.id} AND autoPost = true ORDER BY RAND() LIMIT 1`
    )
  )[0];
  if (!listing) return;

  const listingQuery = createListingQuery(listing, {
    gameflipApiKey: user.gameflipApiKey as string,
    gameflipApiSecret: user.gameflipApiSecret as string,
    gameflipId: user.gameflipId as string,
  });

  const gfapi = new GFApi({
    gameflipApiKey: user.gameflipApiKey as string,
    gameflipApiSecret: user.gameflipApiSecret as string,
    gameflipId: user.gameflipId as string,
  });
  const listingId = await gfapi.postListing(
    listingQuery,
    listing.images as string[]
  );

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      nPosted: {
        increment: 1,
      },
    },
  });

  console.log(`Auto post job for ${user.id}: posted listing ${listingId}`);
});
