import Layout from "components/Shared/Layout";
import { ReactNode } from "react";

interface Props {
  appBarTitle: string;
  children: ReactNode;
}

export default function Page({ appBarTitle, children }: Props) {
  return <Layout appBarTitle={appBarTitle}>{children}</Layout>;
}
