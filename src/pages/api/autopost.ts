import { Queue } from "quirrel/next";
import { type GameflipListing } from "@prisma/client";

import { prisma } from "@/server/db";
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

  const gfAuth = {
    gameflipApiKey: user.gameflipApiKey as string,
    gameflipApiSecret: user.gameflipApiSecret as string,
    gameflipId: user.gameflipId as string,
  };

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
  const listingQuery = createListingQuery(listing, gfAuth);

  console.log(listingQuery);
});
