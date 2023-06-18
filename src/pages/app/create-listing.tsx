import { type NextPage } from "next";
import { useUser } from "@clerk/nextjs";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { AppNavBar } from "@/components/AppNavBar";
import ImageUploader from "@/components/ImageUploader";
import Image from "next/image";
import { useUploadThing } from "@/utils/uploadthing";
import { showToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  category: z.enum([
    "CONSOLE_VIDEO_GAMES",
    "DIGITAL_INGAME",
    "GIFTCARD",
    "VIDEO_GAME_HARDWARE",
    "VIDEO_GAME_ACCESSORIES",
    "TOYS_AND_GAMES",
    "VIDEO_DVD",
    "UNKNOWN",
  ]),
  platform: z.enum([
    "xbox",
    "xbox_360",
    "xbox_one",
    "playstation",
    "playstation_2",
    "playstation_3",
    "playstation_4",
    "playstation_5",
    "playstation_portable",
    "playstation_vita",
    "nintendo_64",
    "nintendo_gamecube",
    "nintendo_wii",
    "nintendo_wiiu",
    "nintendo_switch",
    "nintendo_ds",
    "nintendo_dsi",
    "nintendo_3ds",
    "steam",
    "origin",
    "uplay",
    "gog",
    "mobile",
    "battlenet",
    "xbox_live",
    "playstation_network",
    "unknown",
  ]),
  upc: z.enum(["GFFORTNITE"]),
  priceInCents: z.number().min(75).max(9999),
  shippingWithinDays: z.number().min(1).max(7),
  expiresWithinDays: z.number().min(1).max(30),
  tags: z.array(z.string().min(1).max(100)).max(20),
  images: z.array(z.string().url()).max(5),
});

const Page: NextPage = () => {
  const { user } = useUser();
  console.log(user);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  const { startUpload, isUploading } = useUploadThing({
    endpoint: "imageUploader",
    onUploadError: (e) => {
      showToast(`${e.message ?? e ?? "Unknown error while uploading"}`);
    },
  });

  return (
    <div className="container flex flex-row gap-x-6">
      <AppNavBar />

      <div className="flex min-h-[80vh] w-full flex-col justify-start md:h-[80vh]">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit(onSubmit)();
            }}
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
                      // eslint-disable-next-line @typescript-eslint/no-misused-promises
                      onUpload={(files) => {
                        // const uploaded = await startUpload(files);
                        // console.log(uploaded);
                        // if (!uploaded) return;
                        // void field.onChange([
                        //   ...(field.value ?? []),
                        //   ...uploaded.map((u) => u.fileUrl),
                        // ]);
                        void field.onChange([
                          ...(field.value ?? []),
                          ...files.map((f) => URL.createObjectURL(f)),
                        ]);
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
                        src={image}
                        width={100}
                        height={100}
                        alt="listing image"
                        className="cursor-pointer rounded-lg transition-all hover:opacity-30 active:scale-95"
                        draggable={false}
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

            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Page;
