import { Queue } from "quirrel/next";
import { promisify } from "util";

import { prisma } from "@/server/db";
import GFApi from "@/lib/gfapi";
import { isGameflipConnected, isPremium } from "@/utils/db";

const wait = promisify(setTimeout);

export default Queue("api/autopurge", async (userId: number) => {
  console.log(`[${new Date().toLocaleTimeString()}] User ${userId} auto purge`);

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user || !isPremium(user) || !user.autoPost || !isGameflipConnected(user))
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
    limit: "50",
    created: `,${new Date(
      Date.now() - user.purgeOlderThan * 60 * 1000
    ).toISOString()}`,
  });

  for await (const listing of listings) {
    try {
      await gfapi.deleteListing(listing.id);

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          nPurged: {
            increment: 1,
          },
        },
      });
    } catch (e) {
      console.error(
        `Auto purge job for ${user.id} failed to delete listing ${
          listing.id
        }: ${e as string}`
      );
    }
    await wait(1000);
  }

  console.log(
    `Auto purge job for ${user.id}: Deleted ${listings.length} listings`
  );
});
