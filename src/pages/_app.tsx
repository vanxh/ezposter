import { type AppType } from "next/app";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";

import { api } from "@/utils/api";
import { cn } from "@/utils/tailwind";
import { poppins } from "@/utils/fonts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import "@/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider attribute="class">
      <ClerkProvider {...pageProps}>
        <div
          className={cn(
            "flex h-[100vh] w-full flex-col items-center justify-center font-poppins",
            poppins.variable
          )}
        >
          <Navbar />
          <Component {...pageProps} />
          <Footer />
        </div>
      </ClerkProvider>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
