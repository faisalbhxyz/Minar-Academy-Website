import { auth } from "./lib/auth";

export default auth((req) => {
  const isLoginPage = req.nextUrl.pathname === "/auth/login";
  const isSignupPage = req.nextUrl.pathname === "/auth/register";
  const isForgotPasswordPage =
    req.nextUrl.pathname === "/auth/forgot-password";
  const isResetPasswordPage = req.nextUrl.pathname === "/auth/reset-password";
  const isAuthGuestPage =
    isLoginPage ||
    isSignupPage ||
    isForgotPasswordPage ||
    isResetPasswordPage;

  // If not authenticated and trying to access protected routes
  if (!req.auth && req.nextUrl.pathname.startsWith("/user")) {
    const newUrl = new URL("/auth/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // ✅ If authenticated and tries to access auth guest pages — redirect them away
  if (req.auth && isAuthGuestPage) {
    const newUrl = new URL("/user/dashboard", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: [
    "/user/:path*",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/checkout",
  ],
};
