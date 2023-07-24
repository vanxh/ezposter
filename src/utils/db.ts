import { type User } from "@prisma/client";

export const isPremium = (user: Pick<User, "premiumValidUntil">) => {
  return user.premiumValidUntil && user.premiumValidUntil > new Date();
};

export const isGameflipConnected = (
  user: Pick<User, "gameflipApiKey" | "gameflipApiSecret" | "gameflipId">
) => {
  return !!user.gameflipApiKey && !!user.gameflipApiSecret && !!user.gameflipId;
};
