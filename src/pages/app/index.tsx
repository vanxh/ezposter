import { type NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import { type GameflipListing } from "@prisma/client";
import {
  DollarSign,
  Edit,
  MinusCircle,
  Play,
  PlusCircle,
  Power,
  PowerOff,
  Trash,
} from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { formatDuration, intervalToDuration } from "date-fns";

import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { showToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Page: NextPage = () => {
  const utils = api.useContext();

  const updateListingsCache = (
    id: number,
    update: Partial<GameflipListing>
  ) => {
    utils.user.listing.getAll.setInfiniteData(
      {
        pageSize: 25,
      },
      (data) => {
        if (!data) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            listings: page.listings.map((listing) => {
              if (listing.id !== id) return listing;
              return {
                ...listing,
                ...update,
              };
            }),
          })),
        };
      }
    );
  };

  const { data: user } = api.user.me.useQuery();

  const { data: listingSummary } = api.user.listing.summary.useQuery();
  const {
    data: listingsData,
    fetchNextPage,
    hasNextPage,
    refetch: refetchListings,
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

  const { mutateAsync: deleteListing } = api.user.listing.delete.useMutation({
    onSuccess: () => {
      void refetchListings();
      showToast("Deleted listing!");
    },
    onError: (e) => {
      showToast(`${e.message ?? e ?? "Unknown error while deleting listing"}`);
    },
  });

  const { mutateAsync: postListing } = api.user.listing.post.useMutation({
    onSuccess: (listingId) => {
      void navigator.clipboard.writeText(
        `https://gameflip.com/item/${listingId}`
      );
      showToast("Posted listing and copied link to clipboard!");
    },
    onError: (e) => {
      showToast(`${e.message ?? e ?? "Unknown error while posting listing"}`);
    },
  });

  const { mutateAsync: enableListing } = api.user.listing.enable.useMutation({
    onMutate: ({ id }) => {
      updateListingsCache(id, {
        autoPost: true,
      });
    },
    onSuccess: () => {
      void refetchListings();
      showToast("Enabled listing!");
    },
    onError: (e) => {
      showToast(`${e.message ?? e ?? "Unknown error while enabling listing"}`);
    },
  });

  const { mutateAsync: disableListing } = api.user.listing.disable.useMutation({
    onMutate: ({ id }) => {
      updateListingsCache(id, {
        autoPost: false,
      });
    },
    onSuccess: () => {
      void refetchListings();
      showToast("Disabled listing!");
    },
    onError: (e) => {
      showToast(`${e.message ?? e ?? "Unknown error while disabling listing"}`);
    },
  });

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

      {user && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Posted
              </CardTitle>
              <PlusCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.nPosted}</div>
              <p className="text-xs text-muted-foreground">
                {user.autoPost ? (
                  <>
                    Posting 1 every{" "}
                    {formatDuration(
                      intervalToDuration({
                        start: 0,
                        end: user?.postTime ? user.postTime * 1000 : 0,
                      })
                    )}
                  </>
                ) : (
                  <>Auto posting disabled</>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Purged
              </CardTitle>
              <MinusCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.nPurged}</div>
              <p className="text-xs text-muted-foreground">
                {user.autoPost ? (
                  <>
                    Purging listings older than{" "}
                    {formatDuration(
                      intervalToDuration({
                        start: 0,
                        end: user?.purgeOlderThan
                          ? user.purgeOlderThan * 60 * 1000
                          : 0,
                      })
                    )}
                  </>
                ) : (
                  <>Auto purging disabled</>
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

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
            <div
              key={l.id}
              className="flex h-64 flex-col gap-y-4 rounded-lg border border-border px-4 py-4 md:h-80"
            >
              <Image
                src={(l.images as string[])?.[0] || ""}
                alt="listing image"
                width={100}
                height={100}
                className="aspect-square w-full rounded-lg"
                draggable={false}
              />

              <div className="flex flex-col gap-y-1">
                <h3 className="text-lg font-semibold">{l.name}</h3>
                <span className="inline-flex items-center gap-x-1 text-sm text-foreground/70">
                  <DollarSign className="h-4 w-4" /> {l.priceInCents / 100}
                </span>
              </div>

              <div className="mt-auto flex flex-row items-center justify-between gap-x-4 md:justify-between">
                <Link href={`/app/listings/${l.id}`}>
                  <Edit size={16} />
                </Link>
                <button onClick={() => void deleteListing({ id: l.id })}>
                  <Trash size={16} />
                </button>
                <button onClick={() => void postListing({ id: l.id })}>
                  <Play size={16} />
                </button>
                <button
                  onClick={() => {
                    if (l.autoPost) {
                      void disableListing({ id: l.id });
                    } else {
                      void enableListing({ id: l.id });
                    }
                  }}
                >
                  {l.autoPost ? (
                    <Power className="h-4 w-4" />
                  ) : (
                    <PowerOff className="h-4 w-4" />
                  )}
                </button>
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
