import { type NextPage } from "next";
import Link from "next/link";
import { DollarSign } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";

import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

const Page: NextPage = () => {
  const { data: listingSummary } = api.user.listing.summary.useQuery();
  const {
    data: listingsData,
    fetchNextPage,
    hasNextPage,
  } = api.user.listing.getAll.useInfiniteQuery(
    {
      pageSize: 25,
    },
    {
      initialCursor: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.pagination.totalPages === lastPage.pagination.page) return;
        return lastPage.pagination.page + 1;
      },
      getPreviousPageParam: (firstPage) => {
        return firstPage.pagination.page - 1;
      },
    }
  );

  const listings = listingsData?.pages.flatMap((page) => page.listings) ?? [];

  return (
    <div className="container mx-auto flex flex-col justify-start gap-y-6">
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold">
            Saved Listings ({listingSummary?.total ?? 0})
          </h3>

          <Link href="/app/create-listing">
            <Button>Create Listing</Button>
          </Link>
        </div>
        <Separator />
      </div>

      <InfiniteScroll
        dataLength={listings.length}
        next={fetchNextPage}
        hasMore={hasNextPage ?? false}
        loader={
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />

                <div className="flex w-full flex-col gap-y-1">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4 lg:grid-cols-6">
          {listings.map((l) => (
            <div key={l.id} className="flex flex-col gap-y-4">
              <Image
                src={(l.images as string[])?.[0] || ""}
                alt="listing image"
                width={100}
                height={100}
                className="aspect-square w-full rounded-lg"
              />

              <div className="flex flex-col gap-y-1">
                <h3 className="text-lg font-semibold">{l.name}</h3>
                <span className="inline-flex items-center gap-x-1 text-sm text-foreground/70">
                  <DollarSign className="h-4 w-4" /> {l.priceInCents / 100}
                </span>
              </div>
            </div>
          ))}
          {!listings.length &&
            Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />

                <div className="flex w-full flex-col gap-y-1">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default Page;
