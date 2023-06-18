import { type NextPage } from "next";
import { useUser } from "@clerk/nextjs";

import { AppNavBar } from "@/components/AppNavBar";

const Page: NextPage = () => {
  const { user } = useUser();
  console.log(user);

  return (
    <div className="container flex flex-row gap-x-6">
      <AppNavBar />

      <div className="text-lg">Your page&apos;s content can go here.</div>
    </div>
  );
};

export default Page;
