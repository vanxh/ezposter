import { useState } from "react";
import { type NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { Download, XCircle } from "lucide-react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  GAMEFLIP_CATEGORIES,
  GAMEFLIP_PLATFORMS,
  GAMEFLIP_UPCS,
} from "@/constants";
import { useUploadThing } from "@/utils/uploadthing";
import { api } from "@/utils/api";
import { isGameflipConnected, isPremium } from "@/utils/db";
import ImportListingModal, {
  useImportListingModal,
} from "@/components/modals/ImportListingModal";
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
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/ui/use-toast";
import { Combobox } from "@/components/ui/combobox";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import ImageUploader from "@/components/ImageUploader";

const formSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  category: z.nativeEnum(GAMEFLIP_CATEGORIES),
  platform: z.nativeEnum(GAMEFLIP_PLATFORMS),
  upc: z.nativeEnum(GAMEFLIP_UPCS),
  price: z.number().min(0.75).max(9999),
  shippingWithinDays: z.number().min(1).max(3),
  expiresWithinDays: z.number().min(1).max(365),
  tags: z.array(z.string().min(1).max(100)).max(20, {
    message: "You can only have up to 20 tags",
  }),
  images: z.array(z.unknown()).max(5, {
    message: "You can only have up to 5 images",
  }),
  autoPost: z.boolean().default(true),
});

const Page: NextPage = () => {
  const router = useRouter();

  const { open } = useImportListingModal();

  const { data: user } = api.user.me.useQuery();

  const { mutateAsync: createListing, isLoading } =
    api.user.listing.create.useMutation({
      onSuccess: () => {
        showToast("Listing created");
        void router.push("/app");
      },
      onError: (e) => {
        showToast(
          `${e.message ?? e ?? "Unknown error while creating listing"}`
        );
      },
    });

  const { startUpload, isUploading } = useUploadThing({
    endpoint: "imageUploader",
    onUploadError: (e) => {
      showToast(`${e.message ?? e ?? "Unknown error while uploading"}`);
    },
  });

  const [tagInput, setTagInput] = useState("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "DIGITAL_INGAME",
      platform: "unknown",
      upc: "GFFORTNITE",
      shippingWithinDays: 3,
      expiresWithinDays: 7,
      tags: ["Type:In Game Item"],
      autoPost: true,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const uploaded = await startUpload(
      data.images.filter((i) => typeof i !== "string") as File[]
    );
    if (!uploaded) return;
    void createListing({
      ...data,
      priceInCents: Math.round(data.price * 100),
      images: [
        ...uploaded.map((u) => u.fileUrl),
        ...(data.images.filter((i) => typeof i === "string") as string[]),
      ],
    });
  };

  return (
    <>
      <div className="container mx-auto flex flex-col justify-start gap-y-6">
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-row items-center justify-between">
            <h3 className="text-lg font-semibold">Post a Custom Listing</h3>

            {user && isGameflipConnected(user) && (
              <Button onClick={() => open()}>
                <Download size={16} className="mr-2" />
                Import
              </Button>
            )}
          </div>
          <Separator />
        </div>

        <Form {...form}>
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <ImageUploader
                      onUpload={(files) => {
                        void field.onChange([...(field.value ?? []), ...files]);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload images of your item. You can upload up to 5 images.
                    The first image will be used as the cover image.
                  </FormDescription>

                  <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-4">
                    {field.value?.map((image, idx) => (
                      <Image
                        key={idx}
                        src={
                          image instanceof File
                            ? URL.createObjectURL(image)
                            : (image as string)
                        }
                        width={100}
                        height={100}
                        alt="listing image"
                        className="cursor-pointer rounded-lg transition-all hover:opacity-30 active:scale-95"
                        draggable={false}
                        onClick={() => {
                          void field.onChange(
                            field.value?.filter((_, i) => i !== idx)
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter listing name" {...field} />
                  </FormControl>
                  <FormDescription>The name of your listing.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter listing description"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A description of your listing.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (in USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter listing price"
                        step="any"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      The price of your listing. The minimum price is $0.75 and
                      the maximum price is $9999.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          placeholder="Enter listing tags. Eg: Name:Test"
                          value={tagInput}
                          onChange={(e) => {
                            setTagInput(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void field.onChange([
                                ...(field.value ?? []),
                                tagInput,
                              ]);
                              setTagInput("");
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Tags help buyers find your listing. You can add up to 20
                      tags.
                      <br />
                      <span className="text-foreground/70">
                        Press enter to add a tag.
                      </span>
                    </FormDescription>

                    {field.value?.length > 0 && (
                      <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-4">
                        {field.value?.map((tag, idx) => (
                          <Button
                            variant="secondary"
                            type="button"
                            key={idx}
                            className="inline-flex items-center"
                            onClick={() => {
                              void field.onChange(
                                field.value?.filter((_, i) => i !== idx)
                              );
                            }}
                          >
                            {tag}
                            <XCircle className="ml-2 h-4 w-4" />
                          </Button>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <div>
                        <Combobox
                          placeholder="category"
                          options={Object.entries(GAMEFLIP_CATEGORIES).map(
                            ([k, v]) => ({
                              label: k,
                              value: v,
                            })
                          )}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      The category of your listing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <FormControl>
                      <div>
                        <Combobox
                          placeholder="platform"
                          options={Object.entries(GAMEFLIP_PLATFORMS).map(
                            ([k, v]) => ({
                              label: k,
                              value: v,
                            })
                          )}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      The platform of your listing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="upc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UPC</FormLabel>
                    <FormControl>
                      <div>
                        <Combobox
                          placeholder="upc"
                          options={Object.entries(GAMEFLIP_UPCS).map(
                            ([k, v]) => ({
                              label: k,
                              value: v,
                            })
                          )}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>The UPC of your listing.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shippingWithinDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipping Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter shipping days"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      The shipping days of your listing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresWithinDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expire In</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter expire days"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      The expire days of your listing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="autoPost"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Auto Post</FormLabel>
                      <FormDescription>
                        Automatically post your listing in auto post interval.
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
                loading={isLoading || isUploading}
              >
                {isLoading || isUploading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <ImportListingModal
        onImport={(l) => {
          form.setValue(
            "images",
            Object.values(l.photo).map((p) => p.view_url)
          );
          form.setValue("name", l.name);
          form.setValue("description", l.description);
          form.setValue("price", l.price / 100);
          form.setValue("tags", l.tags);
          form.setValue("category", l.category);
          form.setValue("platform", l.platform);
          form.setValue("upc", l.upc);
          form.setValue("shippingWithinDays", l.shipping_within_days);
          form.setValue("expiresWithinDays", l.expire_in_days);
        }}
      />
    </>
  );
};

export default Page;
