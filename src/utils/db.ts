import { type User } from "@prisma/client";

export const isPremium = (user: User) => {
  return user.premiumValidUntil && user.premiumValidUntil > new Date();
};

export const isGameflipConnected = (user: User) => {
  return !!user.gameflipApiKey && !!user.gameflipApiSecret;
};
