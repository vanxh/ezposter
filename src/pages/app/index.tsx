import { type NextPage } from "next";
import Link from "next/link";
import { MinusCircle, PlusCircle } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { formatDuration, intervalToDuration } from "date-fns";

import { api } from "@/utils/api";
import useListings from "@/hooks/useListings";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ListingCard from "@/components/ListingCard";

const Page: NextPage = () => {
  const { data: user } = api.user.me.useQuery();

  const {
    listingSummary,
    listings,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useListings();

  return (
    <div className="flex min-h-[90vh] flex-col justify-start gap-y-6 py-[2vh]">
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
        dataLength={listings?.length ?? 0}
        next={fetchNextPage}
        hasMore={hasNextPage ?? false}
        loader={<></>}
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 overflow-hidden md:grid-cols-4 lg:grid-cols-6">
          {listings?.map((l) => (
            <ListingCard key={l.id} {...l} />
          ))}
          {(!listings || isFetchingNextPage) &&
            Array.from({ length: !listings?.length ? 25 : 6 }).map((_, i) => (
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
      {listings && !listings.length && (
        <div className="flex flex-col items-center justify-center gap-y-4">
          <h3 className="text-lg font-semibold">No listings found</h3>
          <Link href="/app/create-listing">
            <Button>Create Listing</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Page;
