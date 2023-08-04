import { cn } from "@/utils/tailwind";

type BlobProps = {
  className?: string;
};

export default function Blob({ className }: BlobProps) {
  return (
    <div
      className={cn(
        "absolute left-0 top-0 z-[-10] h-64 w-64 animate-blob rounded-full bg-purple-300 opacity-70 blur-xl filter md:left-1/3 md:h-72 md:w-72", // mix-blend-multiply
        className
      )}
    />
  );
}
