import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

import Logo from "@/public/ezposter.png";
import { api } from "@/utils/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";

export default function Navbar() {
  const { data: user } = api.user.me.useQuery();

  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={Logo}
              alt="EZ Poster"
              width={50}
              height={50}
              draggable={false}
              className="rounded-lg"
            />
            <h1 className="hidden font-bold sm:inline-block">
              EZ<span className="text-brand-400">Poster</span>
            </h1>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />

          <SignedIn>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" size="icon">
                  <Menu className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {user?.isAdmin && (
                  <DropdownMenuItem>
                    <Link href="/app/admin">Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Link href="/app">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/app/listings">Listings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/app/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/app/create-listing">Create Listing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/app/custom-listing">Custom Listing</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton />
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
