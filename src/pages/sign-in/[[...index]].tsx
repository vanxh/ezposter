import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-[90vh] w-full flex-col items-center justify-center gap-y-6 py-[2vh]">
      <SignIn />
    </div>
  );
}
