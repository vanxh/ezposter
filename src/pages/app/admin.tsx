import { type NextPage } from "next";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ColumnDef } from "@tanstack/react-table";
import { type PremiumKey, PremiumTier, type User } from "@prisma/client";
import { format } from "date-fns";
import { Crown, Trash } from "lucide-react";

import { api } from "@/utils/api";
import { cn } from "@/utils/tailwind";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  usersPagination: z
    .object({
      page: z.number().min(1).max(1000).default(1).optional(),
      pageSize: z.number().min(10).max(50).default(10).optional(),
    })
    .default({
      page: 1,
      pageSize: 10,
    }),
  premiumKeysPagination: z
    .object({
      page: z.number().min(1).max(1000).default(1).optional(),
      pageSize: z.number().min(10).max(50).default(10).optional(),
    })
    .default({
      page: 1,
      pageSize: 10,
    }),
  duration: z.number().min(1).max(3650),
  tier: z.nativeEnum(PremiumTier),
});

const Page: NextPage = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const { data: user } = api.user.me.useQuery();
  const { data: usersData, refetch: refetchUsers } =
    api.admin.getUsers.useQuery({
      page: form.getValues("usersPagination.page"),
      pageSize: form.getValues("usersPagination.pageSize"),
    });
  const { data: premiumKeysData, refetch: refetchPremiumKeys } =
    api.admin.getPremiumKeys.useQuery({
      page: form.getValues("premiumKeysPagination.page"),
      pageSize: form.getValues("premiumKeysPagination.pageSize"),
    });

  const { mutateAsync: createPremiumKey, isLoading } =
    api.admin.createPremiumKey.useMutation({
      onSuccess: (data) => {
        void navigator.clipboard.writeText(
          `Premium Key: ${data.key}\nPremium Duration: ${data.duration}`
        );
        showToast("Generated premium key and copied to clipboard!");
        void refetchPremiumKeys();
      },
      onError: (e) => {
        showToast(
          `${e.message ?? e ?? "Unknown error while creating premium key"}`
        );
      },
    });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    void createPremiumKey(data);
  };

  const { mutateAsync: deletePremiumKey } =
    api.admin.deletePremiumKey.useMutation({
      onSuccess: () => {
        void refetchPremiumKeys();
        showToast("Deleted premium key!");
      },
      onError: (e) => {
        showToast(
          `${e.message ?? e ?? "Unknown error while deleting premium key"}`
        );
      },
    });

  if (!user?.isAdmin) return null;

  const userColumns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ getValue, row }) => {
        const isAdmin = row.original.isAdmin;

        return (
          <div className="inline-flex items-center gap-x-2">
            {getValue() as number}
            {isAdmin && <Crown size={16} />}
          </div>
        );
      },
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
      accessorKey: "clerkId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Clerk ID" />
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "username",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Username" />
      ),
    },
    {
      accessorKey: "premiumTier",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Premium Tier" />
      ),
    },
    {
      accessorKey: "premiumValidUntil",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Premium Until" />
      ),
      cell: ({ getValue }) => {
        if (!getValue()) return null;
        return <div>{format(getValue() as Date, "PPP")}</div>;
      },
    },
    {
      accessorKey: "gameflipApiKey",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Gameflip API Key" />
      ),
    },
    {
      accessorKey: "gameflipApiSecret",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Gameflip API Secret" />
      ),
    },
    {
      accessorKey: "gameflipId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Gameflip ID" />
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
      accessorKey: "postTime",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Post Time" />
      ),
      cell: ({ getValue }) => {
        return <div>{getValue() as number}s</div>;
      },
    },
    {
      accessorKey: "purgeOlderThan",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Purge Time" />
      ),
      cell: ({ getValue }) => {
        return <div>{getValue() as number}mins</div>;
      },
    },
  ];

  const premiumKeyColumns: ColumnDef<PremiumKey>[] = [
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
      accessorKey: "key",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Key" />
      ),
    },
    {
      accessorKey: "tier",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Premium Tier" />
      ),
    },
    {
      accessorKey: "duration",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Duration" />
      ),
    },
    {
      accessorKey: "usedById",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Used By" />
      ),
    },
    {
      id: "delete",
      cell: ({ row }) => {
        const premiumKey = row.original;

        return (
          <button
            className={cn(
              premiumKey.usedById
                ? "cursor-not-allowed opacity-50"
                : "transition-all active:scale-95"
            )}
            disabled={!!premiumKey.usedById}
            onClick={() => void deletePremiumKey({ id: premiumKey.id })}
          >
            <Trash className="h-4 w-4 text-red-500" />
          </button>
        );
      },
    },
  ];

  return (
    <div className="flex min-h-[90vh] flex-col justify-start gap-y-6 py-[2vh]">
      <div className="flex flex-col gap-y-2">
        <h3 className="text-lg font-semibold">Users</h3>
        <Separator />
      </div>

      <DataTable
        filterColumn="email"
        columns={userColumns}
        data={usersData?.users ?? []}
        pageCount={usersData?.pagination.totalPages ?? 1}
        page={form.getValues("usersPagination.page")}
        setPage={(page) => {
          form.setValue("usersPagination.page", page);
          void refetchUsers();
        }}
        pageSize={form.getValues("usersPagination.pageSize")}
        setPageSize={(pageSize) => {
          form.setValue("usersPagination.pageSize", pageSize);
          void refetchUsers();
        }}
      />

      <div className="flex flex-col gap-y-2">
        <h3 className="text-lg font-semibold">Create Premium Key</h3>
        <Separator />
      </div>

      <Form {...form}>
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Premium Duration (in days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter duration"
                      step={1}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescription>
                    The duration of your premium subscription.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Premium Tier</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={field.value ?? "Select..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          {
                            label: "Basic",
                            value: PremiumTier.BASIC,
                          },
                          {
                            label: "Premium",
                            value: PremiumTier.PREMIUM,
                          },
                        ].map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    The tier of premium subscription.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex w-full flex-row gap-x-4">
            <Button
              type="submit"
              className="ml-auto w-full md:w-auto"
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </Form>

      <div className="flex flex-col gap-y-2">
        <h3 className="text-lg font-semibold">Premium Keys</h3>
        <Separator />
      </div>

      <DataTable
        filterColumn="key"
        columns={premiumKeyColumns}
        data={premiumKeysData?.premiumKeys ?? []}
        pageCount={premiumKeysData?.pagination.totalPages ?? 1}
        page={form.getValues("premiumKeysPagination.page")}
        setPage={(page) => {
          form.setValue("premiumKeysPagination.page", page);
          void refetchPremiumKeys();
        }}
        pageSize={form.getValues("premiumKeysPagination.pageSize")}
        setPageSize={(pageSize) => {
          form.setValue("premiumKeysPagination.pageSize", pageSize);
          void refetchPremiumKeys();
        }}
      />
    </div>
  );
};

export default Page;
