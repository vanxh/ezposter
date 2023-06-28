/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import z from "zod";
import Speakeasy from "speakeasy";

import { GAMEFLIP_API_BASE_URL } from "@/constants";

export const authHeader = (apiKey: string, apiSecret: string) =>
  `GFAPI ${apiKey}:${Speakeasy.totp({
    encoding: "base32",
    algorithm: "sha1",
    digits: 6,
    secret: apiSecret,
  })}`;

const throwIfError = (data: {
  error?: {
    message?: string;
  };
}) => {
  if (data.error) {
    throw new Error(data.error?.message ?? "Unknown error");
  }

  return data;
};

type AuthProps = {
  gameflipApiKey: string;
  gameflipApiSecret: string;
};

export const GameflipProfileSchema = z.object({
  owner: z.string(),
  display_name: z.string().default(""),
  display_name_updated: z.string().datetime().default(new Date().toISOString()),
  first_name: z.string().default(""),
  last_name: z.string().default(""),
  email: z.string().email().default("test@test.com"),
  about: z.string().default(""),
  avatar: z.string().url().default(""),
  background: z.string().default(""),
  chat_enabled: z.boolean().default(false),
  cognitoidp_client: z.string().default(""),
  phone: z.string().default(""),
  address: z.any(),
  default_address: z.string().default(""),
  invite_code: z.string().default(""),
  rating_good: z.number().default(0),
  rating_neutral: z.number().default(0),
  rating_poor: z.number().default(0),
  buy: z.number().default(0),
  sell: z.number().default(0),
  unseen_alert_count: z.number().default(0),
  verified: z.string().datetime().default(new Date().toISOString()),
  notification_prefs: z
    .object({
      community: z.array(z.string()).default([]),
      account: z.array(z.string()).default([]),
      transactional: z.array(z.string()).default([]),
      following: z.array(z.string()).default([]),
    })
    .optional(),
  created: z.string().datetime().default(new Date().toISOString()),
  updated: z.string().datetime().default(new Date().toISOString()),
  version: z.string().default(""),
  score: z.number().default(0),
  display_name_updated_cooldown: z.number().default(0),
});

export const getProfile = async (
  id = "me",
  { gameflipApiKey, gameflipApiSecret }: AuthProps
) => {
  const res = await fetch(`${GAMEFLIP_API_BASE_URL}/account/${id}/profile`, {
    headers: {
      Authorization: authHeader(gameflipApiKey, gameflipApiSecret),
    },
  });
  const data = await res.json();

  throwIfError(data as unknown as { error?: { message?: string } });

  return GameflipProfileSchema.parse(data.data);
};

export const getListingLimit = (nSell: number) => {
  if (nSell < 10) {
    return 15;
  }
  if (nSell >= 10 && nSell < 50) {
    return 50;
  }
  if (nSell >= 50 && nSell < 100) {
    return 100;
  }
  if (nSell >= 100 && nSell < 500) {
    return 500;
  }
  if (nSell >= 500 && nSell < 1000) {
    return 1000;
  }
  if (nSell >= 1000 && nSell < 2000) {
    return 2500;
  }
  return 5000;
};

// post time in seconds
export const recommendedPostTime = (nSell: number): number => {
  const listingLimit = getListingLimit(nSell);

  if (listingLimit === 2500) {
    return 40;
  }
  if (listingLimit === 5000) {
    return 30;
  }

  return (recommendedPurgeTime(nSell) * 60) / listingLimit;
};

// purge time in mins
export const recommendedPurgeTime = (nSell: number): number => {
  const listingLimit = getListingLimit(nSell);

  return listingLimit <= 1000
    ? 24 * 60
    : (listingLimit * recommendedPostTime(nSell)) / 60;
};
