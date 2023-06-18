import { type AppType } from "next/app";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { api } from "@/utils/api";
import { cn } from "@/utils/tailwind";

import "cal-sans";
import "@/styles/globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <div
        className={cn(
          "flex h-[100vh] w-full flex-col items-center justify-center font-poppins",
          poppins.variable
        )}
      >
        <Component {...pageProps} />
      </div>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
