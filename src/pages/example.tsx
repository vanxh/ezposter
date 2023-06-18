// pages/example.tsx
import { UserButton } from "@clerk/nextjs";

export default function Example() {
  return (
    <>
      <header>
        <UserButton afterSignOutUrl="/" />
      </header>
      <div className="text-lg">Your page&apos;s content can go here.</div>
    </>
  );
}
