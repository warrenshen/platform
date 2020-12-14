import { createContext } from "react";

export type PageContextType = {
  setAppBarTitle: (title: React.ReactNode | string) => void;
};

export const PageContext = createContext<PageContextType>({
  setAppBarTitle: () => {},
});
