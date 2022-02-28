import Layout from "components/Shared/Layout";
import { ReactNode } from "react";

interface Props {
  isLocationsPage?: boolean;
  appBarTitle: string;
  children: ReactNode;
}

export default function Page({
  isLocationsPage = false,
  appBarTitle,
  children,
}: Props) {
  return (
    <Layout isLocationsPage={isLocationsPage} appBarTitle={appBarTitle}>
      {children}
    </Layout>
  );
}
