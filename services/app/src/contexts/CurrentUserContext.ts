import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { ProductTypeEnum, UserRolesEnum, Users } from "generated/graphql";
import { createContext } from "react";

export function isRoleBankUser(role?: UserRolesEnum | null) {
  return (
    !!role &&
    [UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly].includes(role)
  );
}

export type User = {
  id: Users["id"];
  companyId: Users["company_id"] | null;
  role: UserRolesEnum;
  productType: ProductTypeEnum | null;
};

export type CurrentUserContextType = {
  user: User;
  isSignedIn: boolean;
  resetUser: () => void; // A function that resets state of CurrentUserProvider component.
  setUserProductType: (productType: ProductTypeEnum) => void; // A function that sets productType state of CurrentUserProvider component.
  signIn: (
    email: string,
    password: string,
    handleSuccess: (successUrl: string) => void
  ) => void;
  signOut: (client: ApolloClient<NormalizedCacheObject>) => void;
};

export const BlankUser = {
  id: "",
  companyId: null,
  role: UserRolesEnum.CompanyAdmin,
  productType: null,
};

export const CurrentUserContext = createContext<CurrentUserContextType>({
  user: BlankUser,
  isSignedIn: false,
  resetUser: () => {},
  setUserProductType: () => {},
  signIn: () => {},
  signOut: () => {},
});
