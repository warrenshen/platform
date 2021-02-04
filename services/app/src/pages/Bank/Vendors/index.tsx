import Page from "components/Shared/Page";
import ListVendors from "components/Vendors/Bank/ListVendors";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function BankVendorsPage() {
  useTitle("Vendors | Bespoke");
  useAppBarTitle("Vendors");

  return (
    <Page>
      <ListVendors></ListVendors>
    </Page>
  );
}

export default BankVendorsPage;
