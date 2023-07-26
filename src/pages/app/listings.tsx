import { type NextPage } from "next";
import Link from "next/link";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ColumnDef } from "@tanstack/react-table";
import { type GameflipListing } from "@prisma/client";
import { format } from "date-fns";
import { Edit, PlayCircle, Power, PowerOff, Trash } from "lucide-react";

import { api } from "@/utils/api";
import useListings from "@/hooks/useListings";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  listingsPagination: z.object({
    page: z.number().min(1).max(1000).default(1).optional(),
    pageSize: z.number().min(10).max(50).default(10).optional(),
  }),
});

const Page: NextPage = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const { data: listingsData, refetch: refetchListings } =
    api.user.listing.getAll.useQuery({
      page: form.getValues("listingsPagination.page"),
      pageSize: form.getValues("listingsPagination.pageSize"),
    });

  const {
    listingSummary,
    deleteListing,
    postListing,
    enableListing,
    disableListing,
  } = useListings();

  const columns: ColumnDef<GameflipListing>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ getValue }) => {
        return <div>{format(getValue() as Date, "PPP")}</div>;
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "priceInCents",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ getValue }) => {
        return <div>{(getValue() as number) / 100}</div>;
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
    },
    {
      accessorKey: "platform",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Platform" />
      ),
    },
    {
      accessorKey: "upc",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="UPC" />
      ),
    },
    {
      accessorKey: "shippingWithinDays",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ship in" />
      ),
    },
    {
      accessorKey: "expiresWithinDays",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expire in" />
      ),
    },
    {
      accessorKey: "autoPost",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Auto Post" />
      ),
      cell: ({ getValue }) => {
        return <div>{getValue() ? "Yes" : "No"}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const l = row.original;

        return (
          <div className="flex flex-row items-center justify-between gap-x-4 md:justify-between">
            <Link href={`/app/listings/${l.id}`}>
              <Edit size={16} />
            </Link>
            <button onClick={() => void deleteListing({ id: l.id })}>
              <Trash size={16} className="text-red-500" />
            </button>
            <button onClick={() => void postListing({ id: l.id })}>
              <PlayCircle size={16} />
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
                <Power className="h-4 w-4 text-green-500" />
              ) : (
                <PowerOff className="h-4 w-4 text-red-500" />
              )}
            </button>
          </div>
        );
      },
    },
  ];

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

      <DataTable
        filterColumn="name"
        columns={columns}
        data={listingsData?.listings ?? []}
        pageCount={listingsData?.pagination.totalPages ?? 1}
        page={form.getValues("listingsPagination.page")}
        setPage={(page) => {
          form.setValue("listingsPagination.page", page);
          void refetchListings();
        }}
        pageSize={form.getValues("listingsPagination.pageSize")}
        setPageSize={(pageSize) => {
          form.setValue("listingsPagination.pageSize", pageSize);
          void refetchListings();
        }}
      />
    </div>
  );
};

export default Page;
