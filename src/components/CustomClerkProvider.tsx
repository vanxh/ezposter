import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function CustomClerkProvider({
  children,
  ...pageProps
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      {...pageProps}
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
      }}
    >
      {children}
    </ClerkProvider>
  );
}
