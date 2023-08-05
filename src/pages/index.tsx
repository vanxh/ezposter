import Link from "next/link";
import Script from "next/script";

import { Button } from "@/components/ui/button";
import Blob from "@/components/Blob";
import PremiumCard from "@/components/PremiumCard";
import {
  SELLIX_BASIC_PRODUCT_ID,
  SELLIX_PREMIUM_PRODUCT_ID,
} from "@/constants";

export default function Home() {
  return (
    <div className="my-[2vh] flex min-h-[90vh] flex-col justify-start gap-y-12">
      <article className="flex flex-col gap-x-6 gap-y-12 pt-[75px] md:flex-row lg:mt-[10vh] lg:pt-0">
        <section className="relative flex flex-col items-center gap-y-4 text-center md:items-start md:text-left">
          <Blob />

          <h1 className="text-3xl font-semibold md:text-5xl">
            Manage Gameflip Inventory Easily!
          </h1>
          <p className="text-lg">
            EZ Poster is a tool that helps you manage your Gameflip inventory
            easily. It allows you to auto post your items to Gameflip.
          </p>
          <Link href="/app" className="mt-auto">
            <Button size="lg">Get Started</Button>
          </Link>
        </section>

        <section className="relative">
          <Blob className="bg-blue-400 md:left-1/4" />

          <video
            src="/ezposter.mp4"
            autoPlay
            loop
            playsInline
            muted
            className="aspect-video w-[800px] max-w-full rounded-lg border border-border bg-background shadow-2xl"
          />
        </section>
      </article>

      <section className="flex flex-col items-center justify-center gap-y-12 text-center">
        <div className="flex w-full flex-col items-center gap-y-4 text-center">
          <h2 className="text-3xl font-semibold md:text-5xl">Pricing</h2>
          <p className="text-base md:w-[50%]">
            We have a variety of plans to suit your needs. You can choose any
            based on your needs.
          </p>
        </div>

        <div className="flex w-full flex-col justify-center gap-y-4 md:flex-row md:gap-x-4">
          <PremiumCard
            plan="Free"
            pricePerMonth={0}
            features={{
              "Auto Post": false,
              "Auto Purge": false,
              Listings: 0,
              "Minimum Post Time": false,
              "Priority Support": false,
            }}
          />
          <PremiumCard
            plan="Basic"
            pricePerMonth={7.99}
            features={{
              "Auto Post": true,
              "Auto Purge": true,
              Listings: 50,
              "Minimum Post Time": 60,
              "Priority Support": false,
            }}
            productId={SELLIX_BASIC_PRODUCT_ID}
          />
          <PremiumCard
            plan="Pro"
            pricePerMonth={9.99}
            features={{
              "Auto Post": true,
              "Auto Purge": true,
              Listings: 500,
              "Minimum Post Time": 20,
              "Priority Support": true,
            }}
            productId={SELLIX_PREMIUM_PRODUCT_ID}
          />
        </div>

        <Script src={"https://cdn.sellix.io/static/js/embed.js"} async />
      </section>
    </div>
  );
}
