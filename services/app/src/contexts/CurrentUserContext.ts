import { createContext } from "react";

export enum UserRole {
  Bank = "Bank",
  Customer = "Customer",
}

export type CurrentUserContextType = {
  id: string;
  role: UserRole;
  company_id: string;
  setRole: (role: UserRole) => void;
  setAuthentication: (value: boolean) => void;
  setId: (value: string) => void;
  isAuthenticated: boolean;
};

export const CurrentUserContext = createContext<CurrentUserContextType>({
  id: "",
  company_id: "",
  role: UserRole.Customer,
  setRole: () => {},
  setAuthentication: () => {},
  setId: () => {},
  isAuthenticated: false,
});
