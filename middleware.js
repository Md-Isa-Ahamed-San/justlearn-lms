import { PUBLIC_ROUTES, ROOT } from "@/lib/routes";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { chalkLog } from "./utils/logger";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
 
  chalkLog.log("isAuthenticated", isAuthenticated);
  chalkLog.log("nextUrl.pathname", nextUrl.pathname);
  chalkLog.log("req.auth", req?.auth);
  
  const isPublicRoute =
    PUBLIC_ROUTES.find((route) => nextUrl.pathname.startsWith(route)) ||
    nextUrl.pathname === ROOT;
  
  console.log({ isPublicRoute: nextUrl.pathname });
  
  // Only handle unauthorized redirects - don't interfere with profile completion logic
  if (!isAuthenticated && !isPublicRoute) {
    console.log("Unauthenticated user accessing protected route, redirecting to login");
    return Response.redirect(new URL("/login", nextUrl));
  }

  // If authenticated but no role assigned, redirect to roleSelection
  if (isAuthenticated && req.auth?.user) {
    const userRole = req.auth.user?.role;
    const isRoleSelectionPage = nextUrl.pathname === "/roleSelection";
    const isApiRoute = nextUrl.pathname.startsWith("/api");
    const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

    if (!userRole && !isRoleSelectionPage && !isApiRoute && !isAuthRoute && !isPublicRoute) {
      console.log("Authenticated user with no role — redirecting to roleSelection");
      return Response.redirect(new URL("/roleSelection", nextUrl));
    }

    // Role-based route protection
    const isInstructorRoute = nextUrl.pathname.startsWith("/instructor-dashboard");
    const isAdminRoute = nextUrl.pathname.startsWith("/admin-dashboard");

    if (isInstructorRoute && userRole !== "instructor" && userRole !== "admin") {
      console.log(`User role '${userRole}' not allowed on instructor route — redirecting to /courses`);
      return Response.redirect(new URL("/courses", nextUrl));
    }

    if (isAdminRoute && userRole !== "admin") {
      console.log(`User role '${userRole}' not allowed on admin route — redirecting to /courses`);
      return Response.redirect(new URL("/courses", nextUrl));
    }
  }

  // Allow all other requests to continue
  return;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};