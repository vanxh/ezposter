import Link from "next/link";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig() as {
  publicRuntimeConfig: {
    version: string;
  };
};

export default function Footer() {
  return (
    <footer className="bottom-0 mt-auto flex w-full flex-col items-center gap-y-1 py-6 text-center">
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

      <span className="w-full text-xs font-medium">
        EZPoster Version: {publicRuntimeConfig.version}
      </span>
    </footer>
  );
}
