import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { LOGIN, PUBLIC_ROUTES, ROOT } from "@/lib/routes";
import { chalkLog } from "./utils/logger";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
 
  chalkLog.log("isAuthenticated", isAuthenticated);
  chalkLog.log("nextUrl.pathname", nextUrl.pathname);
  
  const isPublicRoute =
    PUBLIC_ROUTES.find((route) => nextUrl.pathname.startsWith(route)) ||
    nextUrl.pathname === ROOT;
  
  console.log({ isPublicRoute: nextUrl.pathname });
  
  // Only handle unauthorized redirects - don't interfere with profile completion logic
  if (!isAuthenticated && !isPublicRoute) {
    console.log("Unauthenticated user accessing protected route, redirecting to unauthorized");
    return Response.redirect(new URL("/login", nextUrl));
  }
  
  // Allow all other requests to continue (including your profile completion logic)
  return;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};