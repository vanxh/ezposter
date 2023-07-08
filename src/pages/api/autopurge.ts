import { Queue } from "quirrel/next";

import { prisma } from "@/server/db";
import { isGameflipConnected, isPremium } from "@/utils/db";

export default Queue("api/autopurge", async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user || !isPremium(user) || !isGameflipConnected(user)) return;

  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`[${new Date().toLocaleTimeString()}] User ${userId} auto purge`);
});
