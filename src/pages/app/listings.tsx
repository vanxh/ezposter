import { type NextPage } from "next";
import Link from "next/link";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ColumnDef } from "@tanstack/react-table";
import { type GameflipListing } from "@prisma/client";
import { format } from "date-fns";
import { Edit, MoreHorizontal, PlayCircle, Trash } from "lucide-react";

import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showToast } from "@/components/ui/use-toast";
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

  const { data: listingSummary } = api.user.listing.summary.useQuery();
  const { data: listingsData, refetch: refetchListings } =
    api.user.listing.getAll.useQuery({
      page: form.getValues("listingsPagination.page"),
      pageSize: form.getValues("listingsPagination.pageSize"),
    });

  const { mutateAsync: deleteListing } = api.user.listing.delete.useMutation({
    onSuccess: () => {
      void refetchListings();
      showToast("Deleted listing!");
    },
    onError: (e) => {
      showToast(`${e.message ?? e ?? "Unknown error while deleting listing"}`);
    },
  });

  const { mutateAsync: enableListing } = api.user.listing.enable.useMutation({
    onSuccess: () => {
      void refetchListings();
      showToast("Enabled listing!");
    },
    onError: (e) => {
      showToast(`${e.message ?? e ?? "Unknown error while enabling listing"}`);
    },
  });

  const { mutateAsync: disableListing } = api.user.listing.disable.useMutation({
    onSuccess: () => {
      void refetchListings();
      showToast("Disabled listing!");
    },
    onError: (e) => {
      showToast(`${e.message ?? e ?? "Unknown error while disabling listing"}`);
    },
  });

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
        const listing = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  void (listing.autoPost
                    ? disableListing({ id: listing.id })
                    : enableListing({ id: listing.id }));
                }}
                className="inline-flex w-full cursor-pointer items-center gap-x-2"
              >
                <PlayCircle size={16} />
                {listing.autoPost ? "Disable Auto Post" : "Enable Auto Post"}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`/app/listings/${listing.id}`}
                  className="inline-flex w-full items-center gap-x-2"
                >
                  <Edit size={16} />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  void deleteListing({ id: listing.id });
                }}
                className="inline-flex w-full cursor-pointer items-center gap-x-2"
              >
                <Trash size={16} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto flex flex-col justify-start gap-y-6">
      <div className="flex flex-col gap-y-2">
        <h3 className="text-lg font-semibold">
          Saved Listings ({listingSummary?.total ?? 0})
        </h3>
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
