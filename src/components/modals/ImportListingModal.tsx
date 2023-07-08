import { useState } from "react";
import { atom, useAtom } from "jotai";
import { Download } from "lucide-react";
import { type z } from "zod";

import { api } from "@/utils/api";
import { type GameflipListingSchema } from "@/utils/gfapi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const importListingModalAtom = atom(false);

export const useImportListingModal = () => {
  const [isOpen, setIsOpen] = useAtom(importListingModalAtom);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
};

type ImportListingModalProps = {
  onImport: (listing: z.infer<typeof GameflipListingSchema>) => void;
};

export default function ImportListingModal({
  onImport,
}: ImportListingModalProps) {
  const { isOpen, close } = useImportListingModal();

  const [value, setValue] = useState("");

  const { data: user } = api.user.me.useQuery();
  const { mutateAsync: importListing } = api.user.listing.import.useMutation();

  return (
    <Dialog open={isOpen} onOpenChange={() => close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Listing</DialogTitle>
          <DialogDescription>
            Import your listing from gameflip
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="https://gameflip.com/item/my-listing"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <Button
          disabled={!value || !user}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onClick={async () => {
            if (!user) return;

            const listing = await importListing({
              id: value,
            });

            onImport(listing);

            setValue("");
            close();
          }}
        >
          <Download size={16} className="mr-2" />
          Import
        </Button>
      </DialogContent>
    </Dialog>
  );
}
