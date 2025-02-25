//import { authMiddleware } from "@clerk/nextjs";

//export default authMiddleware({
//  publicRoutes: ["/", "/api/webhook"],
//});

//export const config = {
//  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
//};
import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/", "/api/webhook", "/api/checkip"],
  ignoredRoutes: ["/((?!api|trpc))(_next|.+\\..+)(.*)", "/api/checkip"],
  afterAuth: (auth, req) => {
    if (!auth.userId && req.nextUrl.pathname.startsWith("/api/checkip")) {
      // Permitir el acceso a /api/checkip sin autenticación
      return NextResponse.next();
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
