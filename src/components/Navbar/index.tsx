import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { MenuSquare } from "lucide-react";

import Logo from "@/public/ezposter.png";
import { api } from "@/utils/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeButton from "./ThemeButton";

export default function Navbar() {
  const { data: user } = api.user.me.useQuery();

  return (
    <nav className="top-0 flex w-full flex-row items-center justify-between gap-x-4 px-4 py-4">
      <Link href={"/"} className="flex flex-row items-center gap-x-2">
        <Image
          src={Logo}
          alt="ezposter"
          width={50}
          height={50}
          className="rounded-lg"
          draggable={false}
        />
        <h1 className="text-3xl font-extrabold italic">
          EZ<span className="text-brand-400">Poster</span>
        </h1>
      </Link>

      <div className="flex flex-row gap-x-4">
        <ThemeButton />
        <SignedIn>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MenuSquare className="h-6 w-6" />
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
    </nav>
  );
}
