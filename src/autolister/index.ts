import { type GameflipListing } from "@prisma/client";
import { promisify } from "util";

import { prisma } from "../server/db";
import GFApi from "../lib/gfapi";
import { isGameflipConnected, isPremium } from "../utils/db";
import { createListingQuery } from "../utils/gfapi";

const wait = promisify(setTimeout);

const AutoPostQueue = new Map<number, NodeJS.Timeout>();
const AutoPurgeQueue = new Map<number, NodeJS.Timeout>();

const scheduleAutoPost = (userId: number, delay: number) => {
  if (!AutoPostQueue.has(userId)) {
    AutoPostQueue.set(
      userId,
      setTimeout(() => void autoPost(userId), delay)
    );
  }
};

const scheduleAutoPurge = (userId: number, delay: number) => {
  if (!AutoPurgeQueue.has(userId)) {
    AutoPurgeQueue.set(
      userId,
      setTimeout(() => void autoPurge(userId), delay)
    );
  }
};

const autoPost = async (userId: number) => {
  console.log(`[${new Date().toLocaleTimeString()}] User ${userId} auto post`);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (
      !user ||
      !isPremium(user) ||
      !user.autoPost ||
      !isGameflipConnected(user)
    )
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

    const nextPost = user.postTime * 1000;
    AutoPostQueue.set(
      user.id,
      setTimeout(() => void autoPost(user.id), nextPost)
    );

    console.log(
      `Auto post job for ${user.id}: scheduled next post in ${
        nextPost / 1000
      } seconds`
    );
  } catch (e) {
    console.error(`Auto post job for ${userId} failed: ${e as string}`);

    AutoPostQueue.delete(userId);
    console.log(`Auto post job for ${userId}: removed from queue`);
  }
};

const autoPurge = async (userId: number) => {
  console.log(`[${new Date().toLocaleTimeString()}] User ${userId} auto purge`);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        gameflipApiKey: true,
        gameflipApiSecret: true,
        gameflipId: true,
        autoPost: true,
        premiumValidUntil: true,
        purgeOlderThan: true,
        id: true,
      },
    });
    if (
      !user ||
      !isPremium(user) ||
      !user.autoPost ||
      !isGameflipConnected(user)
    )
      return;

    const gfapi = new GFApi({
      gameflipApiKey: user.gameflipApiKey as string,
      gameflipApiSecret: user.gameflipApiSecret as string,
    });
    const listings = await gfapi.searchListings({
      owner: user.gameflipId as string,
      status: "onsale",
      sort: "created:asc",
      visibility: "public",
      limit: "5",
      created: `,${new Date(
        Date.now() - user.purgeOlderThan * 60 * 1000
      ).toISOString()}`,
    });

    let nPurged = 0;
    for await (const listing of listings) {
      try {
        await gfapi.deleteListing(listing.id);
        nPurged++;
      } catch (e) {
        console.error(
          `Auto purge job for ${user.id} failed to delete listing ${
            listing.id
          }: ${e as string}`
        );
      }
      await wait(250);
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        nPurged: {
          increment: nPurged,
        },
      },
    });

    console.log(
      `Auto purge job for ${user.id}: Deleted ${listings.length} listings`
    );
  } catch (e) {
    console.error(`Auto purge job for ${userId} failed: ${e as string}`);
  }

  AutoPurgeQueue.set(
    userId,
    setTimeout(() => void autoPurge(userId), 1 * 60 * 1000)
  );
  console.log(`Auto purge job for ${userId}: scheduled next purge in 1 minute`);
};

const syncUsersToQueue = async () => {
  try {
    const users = await prisma.user.findMany({
      where: {
        autoPost: true,
        gameflipId: { not: null },
        gameflipApiKey: { not: null },
        gameflipApiSecret: { not: null },
        premiumValidUntil: { not: null, gte: new Date() },
      },
      select: {
        id: true,
        postTime: true,
      },
    });

    users.forEach((user) => {
      const nextPost = user.postTime * 1000;
      scheduleAutoPost(user.id, nextPost);
      console.log(
        `Scheduled auto post for ${user.id} in ${nextPost / 1000} seconds`
      );

      scheduleAutoPurge(user.id, 1 * 60 * 1000);
      console.log(`Scheduled auto purge for ${user.id} in 1 minute`);
    });
  } catch (e) {
    console.error(`Failed to sync users to the queue: ${e as string}`);
  }
};

const main = async () => {
  await syncUsersToQueue();
  console.log("Auto lister started");

  setInterval(() => void syncUsersToQueue(), 3 * 60 * 1000);
};

void main();
