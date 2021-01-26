import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { UserRolesEnum, Users } from "generated/graphql";
import { createContext } from "react";

export type User = {
  id: Users["id"];
  companyId: Users["company_id"];
  role: UserRolesEnum;
};

export type CurrentUserContextType = {
  user: User;
  isSignedIn: boolean;
  resetUser: () => void; // A function that resets state of CurrentUserProvider component.
  signIn: (email: string, password: string) => void;
  signOut: (client: ApolloClient<NormalizedCacheObject>) => void;
};

export const CurrentUserContext = createContext<CurrentUserContextType>({
  user: {
    id: "",
    companyId: "",
    role: UserRolesEnum.CompanyAdmin,
  },
  isSignedIn: false,
  resetUser: () => {},
  signIn: () => {},
  signOut: () => {},
});
