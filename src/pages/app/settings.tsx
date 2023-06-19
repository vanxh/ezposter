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

const formSchema = z.object({
  autoPost: z.boolean(),
  postTime: z.number().min(20), // in seconds
  purgeOlderThan: z.number().min(60), // in minutes
});

const Page: NextPage = () => {
  const { data: user, refetch } = api.user.me.useQuery(undefined, {
    onSuccess: (data) => {
      form.setValue("autoPost", data.autoPost);
      form.setValue("postTime", data.postTime);
      form.setValue("purgeOlderThan", data.purgeOlderThan);
    },
  });

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    void updateSettings(data);
  };

  return (
    <div className="container mx-auto flex flex-col justify-start">
      <Form {...form}>
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
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
          </div>

          <div className="flex w-full flex-row gap-x-4">
            <Button
              variant="secondary"
              type="reset"
              onClick={() => void form.reset()}
              className="ml-auto w-full md:w-auto"
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={!user || !isPremium(user)}
              loading={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Page;
