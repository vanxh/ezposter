import { cn } from "@/utils/tailwind";
import { Loader, UploadCloud } from "lucide-react";
import React from "react";

type ImageUploaderProps = {
  onUpload: (files: File[]) => void;
  isUploading?: boolean;
};

export default function ImageUploader({
  onUpload,
  isUploading,
}: ImageUploaderProps) {
  return (
    <div className="flex w-full items-center justify-center">
      <label
        htmlFor="dropzone-file"
        className={cn(
          "flex h-64 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary",
          isUploading
            ? "cursor-wait"
            : "cursor-pointer hover:border-border/70 hover:bg-secondary/70"
        )}
      >
        <div className="flex flex-col items-center justify-center pb-6 pt-5">
          {isUploading ? (
            <Loader className="h-10 w-10 animate-spin" />
          ) : (
            <>
              <UploadCloud className="mb-3 h-10 w-10" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG or JPEG (MAX. 1000x1000px)
              </p>
            </>
          )}
        </div>
        {!isUploading && (
          <input
            id="dropzone-file"
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={(e) => {
              e.target.files ? onUpload(Array.from(e.target.files)) : null;
            }}
          />
        )}
      </label>
    </div>
  );
}
