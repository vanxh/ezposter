import { type NextPage } from "next";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDuration, intervalToDuration } from "date-fns";

import { api } from "@/utils/api";
import { isPremium } from "@/utils/db";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  autoPost: z.boolean(),
  postTime: z.number().min(20), // in seconds
  purgeOlderThan: z.number().min(60), // in minutes
  gameflipApiKey: z.string().optional(),
  gameflipApiSecret: z.string().optional(),
});

const Page: NextPage = () => {
  const { data: user, refetch } = api.user.me.useQuery(undefined, {
    onSuccess: (data) => {
      form.setValue("autoPost", data.autoPost);
      form.setValue("postTime", data.postTime);
      form.setValue("purgeOlderThan", data.purgeOlderThan);
      form.setValue("gameflipApiKey", data.gameflipApiKey ?? "");
      form.setValue("gameflipApiSecret", data.gameflipApiSecret ?? "");
    },
    refetchOnWindowFocus: false,
  });
  const { data: listings } = api.user.listing.summary.useQuery();

  const { mutateAsync: updateSettings, isLoading } =
    api.user.update.useMutation({
      onSuccess: () => {
        showToast("Settings updated!");
        void refetch();
      },
      onError: (e) => {
        showToast(
          `${e.message ?? e ?? "Unknown error while updating settings"}`
        );
      },
    });

  const { mutateAsync: connectGameflip, isLoading: connectGameflipLoading } =
    api.user.connectGameflip.useMutation({
      onSuccess: () => {
        showToast(`Gameflip profile connected!`);
        void refetch();
      },
      onError: (e) => {
        showToast(
          `${e.message ?? e ?? "Unknown error while connecting gameflip"}`
        );
      },
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    void updateSettings(data);

    if (
      data.gameflipApiKey &&
      data.gameflipApiSecret &&
      data.gameflipApiKey !== user?.gameflipApiKey &&
      data.gameflipApiSecret !== user?.gameflipApiSecret
    ) {
      void connectGameflip({
        gameflipApiKey: data.gameflipApiKey,
        gameflipApiSecret: data.gameflipApiSecret,
      });
    }
  };

  return (
    <div className="container mx-auto flex flex-col justify-start gap-y-6">
      <div className="flex flex-col gap-y-2">
        <h3 className="text-lg font-semibold">Settings</h3>
        <Separator />
      </div>

      <Form {...form}>
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input value={user?.id} readOnly />
            <FormDescription>
              Your user ID is used to identify your account.
            </FormDescription>
          </div>

          <div className="space-y-2">
            <Label>Listings</Label>
            <Input
              value={listings && `${listings.total} / ${listings.limit}`}
              readOnly
            />
            <FormDescription>
              The number of listings you have saved.
            </FormDescription>
          </div>

          <FormField
            control={form.control}
            name="autoPost"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Auto Post</FormLabel>
                  <FormDescription>
                    Automatically post your saved listings.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="postTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Time (in seconds)</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="number"
                        placeholder="Enter post time"
                        step={1}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    The time in seconds between each post.
                    <br />
                    {field.value ? (
                      <span>
                        ~{" "}
                        {formatDuration(
                          intervalToDuration({
                            start: 0,
                            end: field.value * 1000,
                          })
                        )}
                      </span>
                    ) : null}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purgeOlderThan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purge Time (in minutes)</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        type="number"
                        placeholder="Enter purge time"
                        step={1}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Auto delete posts older than this time in minutes.
                    <br />
                    {field.value ? (
                      <span>
                        ~{" "}
                        {formatDuration(
                          intervalToDuration({
                            start: 0,
                            end: field.value * 60 * 1000,
                          })
                        )}
                      </span>
                    ) : null}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gameflipApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gameflip API Key</FormLabel>
                  <FormControl>
                    <div>
                      <Input placeholder="Enter Gameflip API Key" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>Your Gameflip API Key.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gameflipApiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gameflip API Secret</FormLabel>
                  <FormControl>
                    <div>
                      <Input
                        placeholder="Enter Gameflip API Secret"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Your Gameflip API Secret.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex w-full flex-row gap-x-4">
            <Button
              type="submit"
              className="ml-auto w-full md:w-auto"
              disabled={!user || !isPremium(user) || connectGameflipLoading}
              loading={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Page;
