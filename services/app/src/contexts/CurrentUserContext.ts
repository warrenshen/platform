import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
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
  signIn: (email: string, password: string) => void;
  signOut: (client: ApolloClient<NormalizedCacheObject>) => void;
};

export const CurrentUserContext = createContext<CurrentUserContextType>({
  user: {
    id: "",
    companyId: "",
    role: UserRole.CompanyAdmin,
  },
  signIn: () => {},
  signOut: () => {},
});
