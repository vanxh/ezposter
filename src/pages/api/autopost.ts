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

  const listings = await prisma.gameflipListing.findMany({
    where: {
      userId: user.id,
      autoPost: true,
    },
  });

  if (!listings.length) return;

  const listing = listings[
    Math.floor(Math.random() * listings.length)
  ] as GameflipListing;
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
