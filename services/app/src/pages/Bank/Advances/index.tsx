import AdvancesDataGrid from "components/Shared/Advances/AdvancesDataGrid";
import Page from "components/Shared/Page";
import { useGetAdvancesQuery } from "generated/graphql";

function BankAdvancesPage() {
  const { data } = useGetAdvancesQuery();

  const payments = data?.payments || [];

  return (
    <Page appBarTitle={"Advances"}>
      <AdvancesDataGrid
        payments={payments}
        customerSearchQuery={""}
        onClickCustomerName={() => {}}
      ></AdvancesDataGrid>
    </Page>
  );
}

export default BankAdvancesPage;
