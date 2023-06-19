import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bottom-0 mt-auto flex w-full flex-row items-center py-6 text-center">
      <span className="w-full text-sm font-medium">
        Made with{" "}
        <span role="img" aria-label="heart">
          ❤️
        </span>{" "}
        by{" "}
        <Link href="https://vanxh.dev" className="underline">
          Vanxh
        </Link>
      </span>
    </footer>
  );
}
