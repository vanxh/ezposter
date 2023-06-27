import { Queue } from "quirrel/next";

export default Queue("api/autopurge", async (userId) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(
    `[${new Date().toLocaleTimeString()}] User ${userId as string} auto purge`
  );
});
