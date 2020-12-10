import { createContext } from "react";

export enum UserRole {
  Bank = "Bank",
  Customer = "Customer",
}

export type CurrentUseContextType = {
  id: string;
  role: UserRole;
  setRole: (role: UserRole) => void;
};

export const CurrentUserContext = createContext<CurrentUseContextType>({
  id: "",
  role: UserRole.Customer,
  setRole: () => {},
});
