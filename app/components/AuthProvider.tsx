"use client";

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import React from "react";
import SessionGuard from "./SessionGuard";

export default function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session;
}) {
  return (
    <SessionProvider session={session}>
      <SessionGuard />
      {children}
    </SessionProvider>
  );
}
