import NextAuth from "next-auth";
import axiosInstance from "./axiosInstance";
import Credentials from "next-auth/providers/credentials";

type ApiStudentUser = {
  user_id?: string;
  first_name?: string;
  last_name?: string | null;
  email?: string;
  phone?: string | null;
  role?: string;
  permissions?: string[];
  name?: string;
  [key: string]: unknown;
};

function studentDisplayName(user: ApiStudentUser | null | undefined): string {
  if (!user) return "Student";
  if (typeof user.name === "string" && user.name.trim()) return user.name.trim();
  const full = [user.first_name, user.last_name]
    .filter((part): part is string => Boolean(part && String(part).trim()))
    .join(" ")
    .trim();
  if (full) return full;
  if (typeof user.email === "string" && user.email.trim()) return user.email.trim();
  return "Student";
}

function normalizeSessionUser(user: ApiStudentUser) {
  return {
    ...user,
    user_id: user.user_id ?? "",
    name: studentDisplayName(user),
    email: user.email ?? "",
    phone: user.phone ?? "",
    role: user.role ?? "student",
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
  };
}

/** Returns JWT `exp` when the access token is a decodable JWT; otherwise null. */
function getAccessTokenExp(accessToken: string): number | null {
  const parts = accessToken.split(".");
  if (parts.length < 2 || !parts[1]) return null;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(json) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    try {
      const json = Buffer.from(parts[1], "base64").toString("utf8");
      const payload = JSON.parse(json) as { exp?: unknown };
      return typeof payload.exp === "number" ? payload.exp : null;
    } catch {
      return null;
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Auth.js (NextAuth v5) requires a secret to sign/encrypt tokens and cookies.
  // Prefer env (`AUTH_SECRET`) so it works across dev/prod consistently.
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60,
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (credentials === null) return null;
        try {
          const res = await axiosInstance.post(
            "/student/login",
            {
              email: credentials.email,
              password: credentials.password,
              device_id: credentials.device_id,
              ...(credentials.device_name
                ? { device_name: credentials.device_name }
                : {}),
            },
            {
              headers: {
                "Content-Type": "application/json",
                "app-key": process.env.NEXT_PUBLIC_APP_KEY,
              },
            }
          );

          const authInfo = res.data;

          if (res.status === 200 && authInfo?.token && authInfo?.user) {
            return {
              token: authInfo.token,
              user: normalizeSessionUser(authInfo.user as ApiStudentUser),
            } as any;
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (error: any) {
          throw error;
        }
      },
    }),
  ],
  jwt: {
    maxAge: 2 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        //@ts-ignore
        token.accessToken = user.token;
        //@ts-ignore
        token.user = user.user;
      }

      //@ts-ignore
      const accessToken = token.accessToken as string | undefined;
      if (!accessToken || typeof accessToken !== "string") {
        return null;
      }

      // Never throw here — root layout calls auth() on every page.
      const exp = getAccessTokenExp(accessToken);
      if (exp != null && exp < Math.round(Date.now() / 1000)) {
        return null;
      }

      //@ts-ignore
      if (token.user) {
        //@ts-ignore
        token.user = normalizeSessionUser(token.user as ApiStudentUser);
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        //@ts-ignore
        session.accessToken = token.accessToken;
        //@ts-ignore
        session.user = token.user
          ? normalizeSessionUser(token.user as ApiStudentUser)
          : session.user;
      }
      return session;
    },
  },
  pages: {
    signOut: "/",
  },
});
