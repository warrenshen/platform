import Layout from "components/Shared/Layout";
import { ReactNode } from "react";

import { CompanyBackgroundColor } from "../Colors/GlobalColors";

interface Props {
  isLocationsPage?: boolean;
  appBarTitle: string;
  children: ReactNode;
  backgroundColor?: string;
}

export default function Page({
  isLocationsPage = false,
  appBarTitle,
  children,
  backgroundColor = CompanyBackgroundColor,
}: Props) {
  return (
    <Layout
      isLocationsPage={isLocationsPage}
      appBarTitle={appBarTitle}
      backgroundColor={backgroundColor}
    >
      {children}
    </Layout>
  );
}
