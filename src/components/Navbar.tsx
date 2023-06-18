import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

import Logo from "@/public/ezposter.png";

export default function Navbar() {
  return (
    <nav className="mb-auto flex w-full flex-row items-center justify-between gap-x-4 px-4 py-2">
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

      <div className="flex flex-row gap-x-2">
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
