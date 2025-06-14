import { MainNav } from "../../components/main-nav";
import { getServerUserData } from "../../queries/users";
import { Navbar } from "./_components/navbar";
import Sidebar from "./_components/sidebar";
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
const DashboardLayout = async ({ children }) => {
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
      icon: <IconHome className="h-full w-full " />,
      href: "/",
    },
    {
      title: "Courses",
      icon: <IconBooks className="h-full w-full " />,
      href: "/courses",
    },

    {
      title: "Weekly Quizzes",
      icon: <IconListCheck className="h-full w-full " />,
      href: "/quizzes",
    },
    {
      title: "AI Quiz Generator",
      icon: <IconRobot className="h-full w-full " />,
      href: "/ai",
    },
    {
      title: "Admin",
      icon: <IconSettings className="h-full w-full " />,
      href: "/admin",
    },
  ];
  // console.log(" MainLayout ~ serverUserData:", serverUserData)
  if (serverUserData?.userData?.role === "admin") {
    navLinks.push({
      title: "Admin Dashboard",
      icon: (
        <IconLayoutDashboard className="w-full h-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/admin-dashboard",
    });
  }

  if (serverUserData?.userData?.role === "student") {
    navLinks.push({
      title: "Student Dashboard",
      icon: (
        <IconUser className="w-full h-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/student-dashboard",
    });

    navLinks.push({
      title: "Enrolled Courses",
      icon: (
        <IconNotebook className="w-full h-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/account/enrolled-courses",
    });
  }
  return (
  <div className="h-screen flex flex-col">
    <header className=" border-b shadow-sm z-10"> {/* Optional: Add background color/shadow to the header */}
      <div className="container flex h-20 items-center justify-between py-2 px-4 w-full"> {/* Adjusted height and padding */}
        <MainNav items={navLinks} />
      </div>
    </header>

    <div className="flex flex-1 overflow-hidden"> {/* Added overflow hidden */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 border-r"> {/* flex-shrink-0 prevents sidebar from shrinking*/}
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-y-auto p-4"> {/* flex-1 makes main take remaining space; added p-4 for padding, overflow-y-auto for scrollbar if needed */}
        {children}
      </main>
    </div>
  </div>
);
};
export default DashboardLayout;
