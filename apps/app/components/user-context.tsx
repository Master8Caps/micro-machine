"use client";

import { createContext, useContext } from "react";

export type UserRole = "admin" | "paid" | "free";

interface UserContextValue {
  email: string;
  role: UserRole;
}

const UserContext = createContext<UserContextValue>({
  email: "",
  role: "free",
});

export function UserProvider({
  email,
  role,
  children,
}: {
  email: string;
  role: UserRole;
  children: React.ReactNode;
}) {
  return (
    <UserContext.Provider value={{ email, role }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
