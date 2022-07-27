import { UserRolesEnum, Users } from "generated/graphql";
import { ProductTypeEnum } from "lib/enum";
import { createContext } from "react";

export function isRoleBankUser(role?: UserRolesEnum | null) {
  return (
    !!role &&
    [UserRolesEnum.BankAdmin, UserRolesEnum.BankReadOnly].includes(role)
  );
}

export type User = {
  id: Users["id"];
  parentCompanyId: Users["parent_company_id"] | null;
  companyId: Users["company_id"] | null;
  role: UserRolesEnum;
  productType: ProductTypeEnum | null;
  impersonator_user_id: Users["id"] | null;
};

export type CurrentUserContextType = {
  user: User;
  isSignedIn: boolean;
  resetUser: () => void; // A function that resets state of CurrentUserProvider component.
  setUserFromAccessToken: (accessToken: string, refreshToken: string) => void;
  setUserProductType: (productType: ProductTypeEnum) => void; // A function that sets productType state of CurrentUserProvider component.
  signIn: (
    email: string,
    password: string,
    handleSuccess: (successUrl: string) => void
  ) => void;
  undoImpersonation: () => Promise<string | void>;
  impersonateUser: (userId: User["id"]) => Promise<string | void>;
  signOut: () => void;
};

export const BlankUser = {
  id: "",
  parentCompanyId: null,
  companyId: null,
  role: UserRolesEnum.CompanyAdmin,
  productType: null,
  impersonator_user_id: null,
};

export const CurrentUserContext = createContext<CurrentUserContextType>({
  user: BlankUser,
  isSignedIn: false,
  resetUser: () => {},
  setUserFromAccessToken: () => {},
  setUserProductType: () => {},
  undoImpersonation: () => Promise.resolve(),
  impersonateUser: () => Promise.resolve(),
  signIn: () => {},
  signOut: () => {},
});
