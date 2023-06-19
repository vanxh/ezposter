import { type NextPage } from "next";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ColumnDef } from "@tanstack/react-table";
import { type PremiumKey, PremiumTier } from "@prisma/client";

import { api } from "@/utils/api";
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
import { Combobox } from "@/components/ui/combobox";
import { DataTableColumnHeader } from "@/components/ui/datatable";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  duration: z.number().min(1).max(365),
  tier: z.nativeEnum(PremiumTier),
});

const Page: NextPage = () => {
  const { data: user } = api.user.me.useQuery();
  const { data: premiumKeysData, refetch: refetchPremiumKeys } =
    api.admin.getPremiumKeys.useQuery({});

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    void createPremiumKey(data);
  };

  if (!user?.isAdmin) return null;

  const columns: ColumnDef<PremiumKey>[] = [
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
  ];

  return (
    <div className="container mx-auto flex flex-col justify-start gap-y-6">
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
                    <div>
                      <Combobox
                        placeholder="premium tier"
                        options={[
                          {
                            label: "Basic",
                            value: PremiumTier.BASIC,
                          },
                          {
                            label: "Premium",
                            value: PremiumTier.PREMIUM,
                          },
                        ]}
                        {...field}
                      />
                    </div>
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

      <DataTable columns={columns} data={premiumKeysData?.premiumKeys ?? []} />
    </div>
  );
};

export default Page;
