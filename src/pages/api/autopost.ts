import { Queue } from "quirrel/next";

import { prisma } from "@/server/db";
import { isGameflipConnected, isPremium } from "@/utils/db";

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
});
