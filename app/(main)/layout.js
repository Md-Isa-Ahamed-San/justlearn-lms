import { MainNav } from "@/components/main-nav";
import { SiteFooter } from "@/components/site-footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  IconHome,
  IconBooks,
  IconBook2,
  IconUser,
  IconChalkboard,
  IconListCheck,
  IconRobot,
  IconSettings,
  IconBrandGithub,
  IconBrandX,
  IconLayoutDashboard,
  IconNotebook,
} from "@tabler/icons-react";
import { FooterController } from "../../components/footer-controller";
import { getServerUserData } from "../../queries/users";

const MainLayout = async ({ children }) => {
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
  const navLinks = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full " />
      ),
      href: "/",
    },
    {
      title: "Courses",
      icon: (
        <IconBooks className="h-full w-full " />
      ),
      href: "/courses",
    },
   
   
    {
      title: "Weekly Quizzes",
      icon: (
        <IconListCheck className="h-full w-full " />
      ),
      href: "/quizzes",
    },
    {
      title: "AI Quiz Generator",
      icon: (
        <IconRobot className="h-full w-full " />
      ),
      href: "/ai",
    },
    {
      title: "Admin",
      icon: (
        <IconSettings className="h-full w-full " />
      ),
      href: "/admin",
    },
  ];
// console.log(" MainLayout ~ serverUserData:", serverUserData)
if (serverUserData?.userData?.role === "admin") {
  navLinks.push({
    title: "Admin Dashboard",
    icon: <IconLayoutDashboard className="w-full h-full text-neutral-500 dark:text-neutral-300" />,
    href: "/admin-dashboard",
  });
}

if (serverUserData?.userData?.role === "student") {
  navLinks.push({
    title: "Student Dashboard",
    icon: <IconUser className="w-full h-full text-neutral-500 dark:text-neutral-300" />,
    href: "/student-dashboard",
  });

  navLinks.push({
    title: "Enrolled Courses",
    icon: <IconNotebook className="w-full h-full text-neutral-500 dark:text-neutral-300" />,
    href: "/account/enrolled-courses",
  });
}
  return (
    <div className="flex min-h-screen flex-col">
      <header className="z-40 bg-background/60 backdrop-blur-md fixed top-0 left-0 right-0 border-b h-24">
        <div className="container flex h-24 items-center justify-between py-6 ">
          <MainNav items={navLinks} />
        </div>
      </header>
      <main className="flex-1 pt-20 flex flex-col">{children}</main>

      {/* <SiteFooter /> */}
      <FooterController />
    </div>
  );
};
export default MainLayout;
