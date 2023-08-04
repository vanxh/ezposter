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
          card: "bg-background rounded-lg border-border shadow-lg",
          rootBox:
            "flex min-h-[90vh] flex-col justify-center items-center gap-y-6 py-[2vh] w-full",
          formFieldInput:
            "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
