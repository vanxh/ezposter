import z from "zod";

import { type GameflipListing } from "@prisma/client";

export type AuthProps = {
  gameflipApiKey: string;
  gameflipApiSecret: string;
  gameflipId?: string;
};

export interface KeyValuePair<T> {
  [key: string]: T;
}

export type JsonPatch = {
  op: string;
  path: string;
  value: string | number;
};

export const throwIfError = (data: {
  error?: {
    message?: string;
  };
}) => {
  if (data.error) {
    throw new Error(data.error?.message ?? "Unknown error");
  }

  return data;
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

export const GameflipListingSchema = z.object({
  id: z.string(),
  kind: z.string().default("item"),
  description: z.string().default(""),
  owner: z.string(),
  category: z.string().default("DIGITAL_INGAME"),
  name: z.string(),
  platform: z.string().default("unknown"),
  price: z.number(),
  accept_currency: z.string().default("USD"),
  upc: z.string(),
  cognitoidp_client: z.string(),
  tags: z.array(z.string()).default([]),
  digital: z.boolean().default(true),
  digital_region: z.string().default("none"),
  digital_deliverable: z.string().default("transfer"),
  photo: z.record(
    z.string(),
    z.object({
      display_order: z.number().default(1),
      status: z.string().default("active"),
      view_url: z.string(),
    })
  ),
  status: z.string().default("onsale"),
  shipping_fee: z.number().default(0),
  shipping_paid_by: z.string().default("seller"),
  shipping_within_days: z.number().default(3),
  expire_in_days: z.number().default(7),
  expiration: z.string().datetime(),
  visibility: z.string().default("public"),
  seller_id_verified: z.string().datetime().nullish(),
  seller_languages: z.array(z.string()).default([]),
  seller_score: z.number().default(0),
  seller_ratings: z.number().default(0),
  seller_online_until: z.string().datetime().nullish(),
  created: z.string().datetime(),
  updated: z.string().datetime(),
  version: z.string().default("2"),
});

export const GameflipListingsSchema = z.array(GameflipListingSchema);

export const SearchGameflipListingsSchema = z.object({
  data: GameflipListingsSchema,
  next_page: z.string().url().nullish(),
});

export const createListingQuery = (
  listing: GameflipListing,
  { gameflipId }: AuthProps
) => {
  return {
    kind: "item",
    owner: gameflipId,
    status: "draft",
    name: listing.name,
    description: listing.description,
    category: listing.category,
    platform: listing.platform,
    upc: listing.upc,
    price: listing.priceInCents,
    accept_currency: listing.accept_currency,
    shipping_within_days: listing.shippingWithinDays || 3,
    expire_in_days: listing.expiresWithinDays || 7,
    shipping_fee: 0,
    shipping_paid_by: "seller",
    shipping_predefined_package: "None",
    cognitodp_client: "marketplace",
    tags: listing.tags,
    digital: true,
    digital_region: "none",
    digital_deliverable: "transfer",
    visibility: "public",
  };
};
