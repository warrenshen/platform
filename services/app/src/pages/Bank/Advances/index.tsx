import AdvancesDataGrid from "components/Shared/Advances/AdvancesDataGrid";
import Page from "components/Shared/Page";
import { useGetAdvancesQuery } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function BankAdvancesPage() {
  useTitle("Advances | Bespoke");
  useAppBarTitle("Advances");

  const { data } = useGetAdvancesQuery();

  const payments = data?.payments || [];

  return (
    <Page>
      <AdvancesDataGrid
        payments={payments}
        customerSearchQuery={""}
        onClickCustomerName={() => {}}
      ></AdvancesDataGrid>
    </Page>
  );
}

export default BankAdvancesPage;
