"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { Menu, X } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";

import FloatingDockDemo from "./FloatingDockDemo";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";

export function MainNav({ items, children }) {
  const { data: session, status } = useSession();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loginSession, setLoginSession] = useState(null);
  useEffect(() => {
  console.log("inside use effect",session)
    setLoginSession(session);
  }, [session?.user]);

  console.log(" MainNav ~ session:", session);
  return (
    <div className="flex justify-between items-center w-full px-4 py-3">
      {/* Left: Logo */}
      <div className="flex items-center">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      {/* Center: Nav items */}
      <div className="hidden lg:flex justify-center flex-1 ">
        {items?.length ? <FloatingDockDemo links={items} /> : null}
      </div>

      {/* Right: Auth + Avatar */}
      <div className="flex items-center gap-3">
        {session && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer">
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-4">
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/account">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/account/enrolled-courses">My Courses</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="">Testimonials & Certificates</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="#" onClick={() => signOut()}>
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {!session && (
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "sm" }), "px-4")}
            >
              Login
            </Link>

            <Link href="/register">
              <Button variant="outline" size="sm">
                Register
              </Button>
            </Link>
          </div>
        )}

        {/* Avatar Dropdown */}

        {/* Mobile menu button */}
        <button
          className="lg:hidden ml-2"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile nav dropdown */}
      {showMobileMenu && items && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg z-50">
          <MobileNav items={items}>{children}</MobileNav>
        </div>
      )}
    </div>
  );
}
