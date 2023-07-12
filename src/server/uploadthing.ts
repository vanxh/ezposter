import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
// import { auth } from "@clerk/nextjs";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "1MB" } })
    // .middleware(() => {
    //   const user = auth();

    //   if (!user) {
    //     throw new Error("You must be logged in to upload files");
    //   }

    //   return { userId: user.userId };
    // })
    .onUploadComplete(({ file }) => {
      // console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
