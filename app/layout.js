import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import { Delius } from "next/font/google";

import Head from "next/head"; // ✅ Import Head
import "./globals.css";
import { ThemeProvider } from "../provider/theme-provider";
import ThemeSwitcher from "../components/theme-switcher";
import { SessionProvider } from "next-auth/react";
import { getServerUserData } from "../queries/users";
import { UserDataProvider } from "../provider/user-data-provider";
const inter = Inter({ subsets: ["latin"] });
const poppins = Inter({ subsets: ["latin"], variable: "--font-poppins" });

const delius = Delius({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-delius",
});
export const metadata = {
  title: "JUSTLearn",
  description: "Explore || Learn || Build || Share",
};

export default async function RootLayout({ children }) {
  // const conn = await dbConnect();
  let serverUserData = null;

  try {
    serverUserData = await getServerUserData();
  } catch (error) {
    // During static generation, this might fail
    console.log(
      "Could not fetch server user data during build:",
      error.message
    );
    serverUserData = null;
  }

  console.log("RootLayout ~ serverUserData:", serverUserData);
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <Head>
        <link
          rel="preload"
          as="fetch"
          href="/hero-animation.json"
          type="application/json"
          crossOrigin="anonymous"
        />
      </Head>
      <body className={cn(inter.className, poppins.className, delius.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SessionProvider>
            <UserDataProvider initialUserData={serverUserData}>
              {children}
            </UserDataProvider>
          </SessionProvider>
          <ThemeSwitcher />
        </ThemeProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
