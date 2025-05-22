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
} from "@tabler/icons-react";
import { FooterController } from "../../components/footer-controller";

const navLinks = [
  {
    title: "Home",
    icon: (
      <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/",
  },
  {
    title: "Courses",
    icon: (
      <IconBooks className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/courses",
  },
  {
    title: "Instructor Panel",
    icon: (
      <IconChalkboard className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/instructor",
  },
  {
    title: "Student Dashboard",
    icon: (
      <IconUser className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/dashboard",
  },
  {
    title: "Weekly Quizzes",
    icon: (
      <IconListCheck className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/quizzes",
  },
  {
    title: "AI Quiz Generator",
    icon: (
      <IconRobot className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/ai",
  },
  {
    title: "Admin",
    icon: (
      <IconSettings className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    href: "/admin",
  },
];

const MainLayout = ({ children }) => {

  return (
    <div className="flex min-h-screen flex-col">
      <header className="z-40 bg-background/60 backdrop-blur-md fixed top-0 left-0 right-0 border-b h-24">
        <div className="container flex h-24 items-center justify-between py-6 ">
          <MainNav items={navLinks} />
        </div>
      </header>
      <main className="flex-1 pt-20 flex flex-col">{children}</main>

      {/* <SiteFooter /> */}
      <FooterController/>

    </div>
  );
};
export default MainLayout;
