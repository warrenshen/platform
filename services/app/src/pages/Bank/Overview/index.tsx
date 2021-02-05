import Page from "components/Shared/Page";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";
import BankDashboard from "./BankDashboard";

function BankOverviewPage() {
  useTitle("Overview | Bespoke");
  useAppBarTitle("Overview");

  return (
    <Page>
      <BankDashboard />
    </Page>
  );
}

export default BankOverviewPage;
