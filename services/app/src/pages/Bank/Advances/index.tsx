import AdvancesDataGrid from "components/Advances/AdvancesDataGrid";
import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import { useGetAdvancesQuery } from "generated/graphql";

function BankAdvancesPage() {
  const { data } = useGetAdvancesQuery();

  const payments = data?.payments || [];

  return (
    <Page appBarTitle={"Advances"}>
      <PageContent title={"Advances"}>
        <AdvancesDataGrid
          isExcelExport
          payments={payments}
          customerSearchQuery={""}
          onClickCustomerName={() => {}}
        />
      </PageContent>
    </Page>
  );
}

export default BankAdvancesPage;
