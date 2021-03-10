import CustomerPayorsList from "components/Payors/CustomerPayorsList";
import Page from "components/Shared/Page";

export default function CustomerPayorsPage() {
  // TODO(pjstein): Add the "Add Payor" button once we dig through the
  // equivalent code for vendors
  return (
    <Page appBarTitle="Payors">
      <CustomerPayorsList />
    </Page>
  );
}
