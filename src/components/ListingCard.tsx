import Image from "next/image";
import Link from "next/link";
import { type GameflipListing } from "@prisma/client";
import {
  Copy,
  DollarSign,
  Edit,
  PlayCircle,
  Power,
  PowerOff,
  Trash,
} from "lucide-react";

import useListings from "@/hooks/useListings";

type ListingCardProps = GameflipListing;

export default function ListingCard({
  images,
  name,
  priceInCents,
  id,
  autoPost,
}: ListingCardProps) {
  const { deleteListing, postListing, enableListing, disableListing } =
    useListings();

  return (
    <div className="flex flex-col gap-y-4 rounded-lg border border-border px-4 py-4 sm:h-72 md:h-80">
      <Image
        src={(images as string[])?.[0] || ""}
        alt="listing image"
        width={100}
        height={100}
        className="aspect-square w-full rounded-lg"
        draggable={false}
      />

      <div className="flex flex-col gap-y-1">
        <h3 className="truncate text-lg font-semibold">{name}</h3>
        <span className="inline-flex items-center gap-x-1 text-sm text-foreground/70">
          <DollarSign className="h-4 w-4" /> {priceInCents / 100}
        </span>
      </div>

      <div className="mt-auto grid grid-cols-3 items-center justify-between justify-between gap-x-4 gap-y-4 md:flex md:flex-row md:justify-between">
        <Link
          href={`/app/listings/${id}`}
          className="transition-transform ease-in-out active:scale-95"
        >
          <Edit size={16} />
        </Link>
        <button
          onClick={() => void deleteListing({ id })}
          className="transition-transform ease-in-out active:scale-95"
        >
          <Trash size={16} className="text-red-500" />
        </button>
        <Link
          href={`/app/create-listing?copy=${id}`}
          className="transition-transform ease-in-out active:scale-95"
        >
          <Copy size={16} />
        </Link>
        <button
          onClick={() => void postListing({ id })}
          className="transition-transform ease-in-out active:scale-95"
        >
          <PlayCircle size={16} className="text-primary" />
        </button>
        <button
          onClick={() => {
            if (autoPost) {
              void disableListing({ id });
            } else {
              void enableListing({ id });
            }
          }}
          className="transition-transform ease-in-out active:scale-95"
        >
          {autoPost ? (
            <Power className="h-4 w-4 text-green-500" />
          ) : (
            <PowerOff className="h-4 w-4 text-red-500" />
          )}
        </button>
      </div>
    </div>
  );
}
