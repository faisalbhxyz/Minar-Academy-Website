"use client";

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

export default function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session;
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
