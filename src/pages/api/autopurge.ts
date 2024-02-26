import { Queue } from "quirrel/next";
// import { promisify } from "util";

// import { prisma } from "@/server/db";
// import GFApi from "@/lib/gfapi";
// import { isGameflipConnected, isPremium } from "@/utils/db";

// const wait = promisify(setTimeout);

export default Queue("api/autopurge", async (userId: number) => {
  console.log(`[${new Date().toLocaleTimeString()}] User ${userId} auto purge`);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  //   try {
  //     const user = await prisma.user.findUnique({
  //       where: {
  //         id: userId,
  //       },
  //       select: {
  //         gameflipApiKey: true,
  //         gameflipApiSecret: true,
  //         gameflipId: true,
  //         autoPost: true,
  //         premiumValidUntil: true,
  //         purgeOlderThan: true,
  //         id: true,
  //       },
  //     });
  //     if (
  //       !user ||
  //       !isPremium(user) ||
  //       !user.autoPost ||
  //       !isGameflipConnected(user)
  //     )
  //       return;

  //     const gfapi = new GFApi({
  //       gameflipApiKey: user.gameflipApiKey as string,
  //       gameflipApiSecret: user.gameflipApiSecret as string,
  //     });
  //     const listings = await gfapi.searchListings({
  //       owner: user.gameflipId as string,
  //       status: "onsale",
  //       sort: "created:asc",
  //       visibility: "public",
  //       limit: "5",
  //       created: `,${new Date(
  //         Date.now() - user.purgeOlderThan * 60 * 1000
  //       ).toISOString()}`,
  //     });

  //     let nPurged = 0;
  //     for await (const listing of listings) {
  //       try {
  //         await gfapi.deleteListing(listing.id);
  //         nPurged++;
  //       } catch (e) {
  //         console.error(
  //           `Auto purge job for ${user.id} failed to delete listing ${
  //             listing.id
  //           }: ${e as string}`
  //         );
  //       }
  //       await wait(250);
  //     }

  //     await prisma.user.update({
  //       where: {
  //         id: user.id,
  //       },
  //       data: {
  //         nPurged: {
  //           increment: nPurged,
  //         },
  //       },
  //     });

  //     console.log(
  //       `Auto purge job for ${user.id}: Deleted ${listings.length} listings`
  //     );
  //   } catch (e) {
  //     console.error(`Auto purge job for ${userId} failed: ${e as string}`);
  //   }
});
