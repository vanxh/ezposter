import { useRouter } from "next/router";
import Link from "next/link";
import { type LucideIcon, Home, Settings, PlusCircle } from "lucide-react";

import { cn } from "@/utils/tailwind";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

type AppNavBarItemProps = {
  href: string;
  label: string;
  Icon: LucideIcon;
  active?: boolean;
};

export const AppNavBarItem = ({
  href,
  label,
  Icon,
  active,
}: AppNavBarItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-max w-max min-w-max items-center rounded-full p-3 transition-all ease-in-out hover:bg-secondary md:w-full md:rounded-lg",
        active ? "bg-secondary" : "bg-transparent"
      )}
    >
      <Icon size={24} className="text-gray-500 transition duration-75" />
      <span className="ml-3 hidden md:inline">{label}</span>
    </Link>
  );
};

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  if (!user) return null;

  return (
    <nav className="hidden h-[80vh] flex-col gap-y-6 md:flex">
      <div className="md:flex md:flex-col md:gap-y-4">
        <Image
          src={user.profileImageUrl}
          alt="Profile Image"
          width={100}
          height={100}
          className="rounded-lg"
          draggable={false}
        />

        <p className="text-lg font-semibold">{user.username}</p>
      </div>
      <div className="flex flex-col items-center justify-center gap-y-4">
        {children}
      </div>
    </nav>
  );
};

const BottomBar = ({ children }: { children: React.ReactNode }) => {
  return (
    <nav className="fixed bottom-0 left-0 flex w-full flex-row items-center justify-around gap-x-6 rounded-t-lg bg-background py-3 md:hidden">
      {children}
    </nav>
  );
};

export const AppNavBarItems = () => {
  const router = useRouter();

  return (
    <>
      <AppNavBarItem
        href="/app/create-listing"
        active={router.pathname === "/app/create-listing"}
        label="Create New Listing"
        Icon={PlusCircle}
      />
      <AppNavBarItem
        href="/app"
        active={router.pathname === "/app"}
        label="Dashboard"
        Icon={Home}
      />
      <AppNavBarItem
        href="/app/settings"
        active={router.pathname === "/app/settings"}
        label="Settings"
        Icon={Settings}
      />
    </>
  );
};

export const AppNavBar = () => {
  return (
    <>
      <Sidebar>
        <AppNavBarItems />
      </Sidebar>

      <BottomBar>
        <AppNavBarItems />
      </BottomBar>
    </>
  );
};
