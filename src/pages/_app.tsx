import Head from "next/head";
import { type AppType } from "next/app";
import { ThemeProvider } from "next-themes";

import { api } from "@/utils/api";
import { cn } from "@/utils/tailwind";
import { poppins } from "@/utils/fonts";
import { Toaster } from "@/components/ui/toaster";
import CustomClerkProvider from "@/components/CustomClerkProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import "@/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider attribute="class">
      <CustomClerkProvider {...pageProps}>
        <Head>
          <title>EZ Poster</title>
          <meta name="description" content="Autopost your gameflip listings" />
          <link rel="icon" href="/favicon.ico" />
          <meta property="og:title" content="EZ Poster" />
          <meta
            property="og:description"
            content="Autopost your gameflip listings"
          />
          <meta property="og:image" content="/api/og" />
        </Head>

        <div
          className={cn(
            "flex min-h-[100vh] w-full flex-col items-center justify-center font-poppins",
            poppins.variable
          )}
        >
          <Navbar />
          <Component {...pageProps} />
          <Footer />
        </div>

        <Toaster />
      </CustomClerkProvider>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
