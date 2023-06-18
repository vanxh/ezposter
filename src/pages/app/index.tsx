import { type NextPage } from "next";
import { useUser } from "@clerk/nextjs";

const Page: NextPage = () => {
  const { user } = useUser();
  console.log(user);

  return (
    <div>
      <div className="text-lg">Your page&apos;s content can go here.</div>
    </div>
  );
};

export default Page;
