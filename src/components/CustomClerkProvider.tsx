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

        elements: {
          userButtonPopoverCard:
            "bg-popover border-border border text-popover-foreground shadow-md w-max min-w-[8rem] py-6 px-2",
          userButtonPopoverActionButton:
            "text-popover-foreground text-sm focus:text-accent-foreground focus:bg-accent hover:bg-transparent",
          userButtonPopoverActionButtonText: "min-w-max",
          card: "bg-background rounded-lg shadow-lg",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
