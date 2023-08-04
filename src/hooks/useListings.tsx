import { type GameflipListing } from "@prisma/client";

import { api } from "@/utils/api";
import { showToast } from "@/components/ui/use-toast";

export default function useListings() {
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

  const { data: listingSummary } = api.user.listing.summary.useQuery();
  const {
    data: listingsData,
    fetchNextPage,
    hasNextPage,
    refetch: refetchListings,
    isFetchingNextPage,
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

  const listings = listingsData?.pages.flatMap((page) => page.listings);

  return {
    listingSummary,
    listingsData,
    listings,
    fetchNextPage,
    hasNextPage,
    refetchListings,
    isFetchingNextPage,
    deleteListing,
    postListing,
    enableListing,
    disableListing,
  };
}
