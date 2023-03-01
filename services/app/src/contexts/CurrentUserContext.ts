import { UserRolesEnum, Users } from "generated/graphql";
import { PlatformModeEnum, ProductTypeEnum } from "lib/enum";
import { createContext } from "react";

export type User = {
  id: Users["id"] | null;
  parentCompanyId: Users["parent_company_id"] | null;
  companyId: Users["company_id"] | null;
  role: UserRolesEnum | null;
  allowedRoles: UserRolesEnum[];
  impersonatorUserId: Users["id"] | null;
  platformMode: PlatformModeEnum | null;
  productType: ProductTypeEnum | null;
  isEmbeddedModule: boolean | null; // Whether app is open in an iframe element.
  isActiveContract: boolean | null;
};

export type ImpersonateUserResponse = {
  platformMode: PlatformModeEnum | null;
  errorMsg: string | null;
};

export type CurrentUserContextType = {
  user: User;
  isSignedIn: boolean;
  resetUser: () => void; // A function that resets state of CurrentUserProvider component.
  setUserProductType: (productType: ProductTypeEnum) => void; // A function that sets productType state of CurrentUserProvider component.
  setUserIsActiveContract: (isActiveContract: boolean) => void; // A function that sets isActiveContract state of CurrentUserProvider component.
  switchPlatformMode: (
    platformMode: PlatformModeEnum
  ) => Promise<string | void>;
  signIn: (
    email: string,
    password: string,
    handleSuccess: (successUrl: string) => void
  ) => void;
  undoImpersonation: () => Promise<string | void>;
  impersonateUser: (
    userId: User["id"]
  ) => Promise<ImpersonateUserResponse | void>;
  signOut: () => void;
};

export const BlankUser = {
  id: null,
  parentCompanyId: null,
  companyId: null,
  role: null,
  allowedRoles: [],
  impersonatorUserId: null,
  platformMode: null,
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
  switchPlatformMode: () => Promise.resolve(),
  undoImpersonation: () => Promise.resolve(),
  impersonateUser: () => Promise.resolve(),
  signIn: () => {},
  signOut: () => {},
});
