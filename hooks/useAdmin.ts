'use client';

import { useSession } from "next-auth/react";

export function useAdmin() {
  const { data: session, status } = useSession();
  
  return {
    isAdmin: status === "authenticated" && !!session,
    isLoading: status === "loading",
    session
  };
}