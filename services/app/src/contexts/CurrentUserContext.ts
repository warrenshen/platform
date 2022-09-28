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
  id: Users["id"] | null;
  parentCompanyId: Users["parent_company_id"] | null;
  companyId: Users["company_id"] | null;
  role: UserRolesEnum | null;
  impersonatorUserId: Users["id"] | null;
  productType: ProductTypeEnum | null;
  isEmbeddedModule: boolean | null; // Whether app is open in an iframe element.
  isActiveContract: boolean | null;
};

export type CurrentUserContextType = {
  user: User;
  isSignedIn: boolean;
  resetUser: () => void; // A function that resets state of CurrentUserProvider component.
  setUserProductType: (productType: ProductTypeEnum) => void; // A function that sets productType state of CurrentUserProvider component.
  setUserIsActiveContract: (isActiveContract: boolean) => void; // A function that sets isActiveContract state of CurrentUserProvider component.
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
  id: null,
  parentCompanyId: null,
  companyId: null,
  role: null,
  impersonatorUserId: null,
  productType: null,
  isEmbeddedModule: null,
  isActiveContract: null,
};

export const CurrentUserContext = createContext<CurrentUserContextType>({
  user: BlankUser,
  isSignedIn: false,
  resetUser: () => {},
  setUserProductType: () => {},
  setUserIsActiveContract: () => {},
  undoImpersonation: () => Promise.resolve(),
  impersonateUser: () => Promise.resolve(),
  signIn: () => {},
  signOut: () => {},
});
