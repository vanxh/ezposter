import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

import { env } from "@/env.mjs";
import { prisma } from "@/server/db";
import {
  SELLIX_BASIC_PRODUCT_ID,
  SELLIX_PREMIUM_PRODUCT_ID,
} from "@/constants";
import { PremiumTier } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const headerSignature = req.headers["x-sellix-unescaped-signature"];
  const payload = req.body as {
    event: "subscription:created" | "subscription:cancelled";
    data: {
      id: string;
      shop_id: number;
      status: string;
      gateway: null;
      custom_fields: {
        [key: string]: unknown;
      };
      customer_id: string;
      stripe_customer_id: string;
      stripe_subscription_id: null;
      stripe_account: null;
      paypal_subscription_id: null;
      paypal_account: null;
      product_id?: string;
      coupon_id?: string;
      current_period_end: number;
      upcoming_email_1_week_sent: number;
      trial_period_ending_email_sent: number;
      renewal_invoice_created: number;
      status_details: unknown;
      created_at: number;
      updated_at?: number;
      canceled_at?: number;
      shop_name: string;
      product_title: string; // EZ Poster Basic | EZ Poster Premium
      cloudflare_image_id: string;
      customer_name: string;
      customer_surname: string;
      customer_phone?: string;
      customer_phone_country_code?: string;
      customer_country_code?: string;
      customer_street_address?: string;
      customer_additional_address_info?: string;
      customer_city?: string;
      customer_postal_code?: string;
      customer_state?: string;
      customer_email: string;
      invoices: unknown[];
    };
  };

  const signature = crypto
    .createHmac("sha512", env.SELLIX_WEBHOOK_SECRET)
    .update(payload as unknown as Buffer)
    .digest("hex");

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(headerSignature as string, "utf-8")
    )
  ) {
    return res.status(401).json({});
  }

  const userId = payload.data.custom_fields.userid as string;
  const user = await prisma.user.findUnique({
    where: {
      id: +userId,
    },
  });

  if (!user) {
    return res.status(400).json({
      message: "Invalid user",
    });
  }

  const premiumTiers = {
    [SELLIX_BASIC_PRODUCT_ID]: PremiumTier.BASIC,
    [SELLIX_PREMIUM_PRODUCT_ID]: PremiumTier.PREMIUM,
  };

  switch (payload.event) {
    case "subscription:created":
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          premiumTier:
            premiumTiers[payload.data.product_id as keyof typeof premiumTiers],
          premiumValidUntil: new Date(payload.data.current_period_end),
        },
      });
      break;

    case "subscription:cancelled":
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          premiumTier:
            premiumTiers[payload.data.product_id as keyof typeof premiumTiers],
          premiumValidUntil: new Date(payload.data.current_period_end),
        },
      });
      break;
  }

  return res.status(200).json({
    success: true,
  });
}
