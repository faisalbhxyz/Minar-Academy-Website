import { auth } from "./lib/auth";

export default auth((req) => {
  const isLoginPage = req.nextUrl.pathname === "/auth/login";
  const isSignupPage = req.nextUrl.pathname === "/auth/register";

  // If not authenticated and trying to access protected routes
  if (!req.auth && req.nextUrl.pathname.startsWith("/user")) {
    const newUrl = new URL("/auth/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // ✅ If authenticated and tries to access login or register — redirect them away
  if (req.auth && (isLoginPage || isSignupPage)) {
    const newUrl = new URL("/user/dashboard", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/user/:path*", "/auth/login", "/auth/register", "/checkout"],
};
