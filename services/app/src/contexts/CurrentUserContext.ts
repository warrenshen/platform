import { Users } from "generated/graphql";
import { createContext } from "react";

export enum UserRole {
  BankAdmin = "bank_admin",
  CompanyAdmin = "company_admin",
}

export type User = {
  id: Users["id"];
  companyId: Users["company_id"];
  role: UserRole;
};

export type CurrentUserContextType = {
  user: User;
  setSignedIn: (signedIn: boolean) => void;
};

export const CurrentUserContext = createContext<CurrentUserContextType>({
  user: {
    id: "",
    companyId: "",
    role: UserRole.CompanyAdmin,
  },
  setSignedIn: () => {},
});
