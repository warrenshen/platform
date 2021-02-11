import Page from "components/Shared/Page";
import ListVendors from "components/Vendors/Bank/ListVendors";

function BankVendorsPage() {
  return (
    <Page appBarTitle={"Vendors"}>
      <ListVendors></ListVendors>
    </Page>
  );
}

export default BankVendorsPage;
