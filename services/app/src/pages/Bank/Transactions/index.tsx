import Page from "components/Shared/Page";
import PageContent from "components/Shared/Page/PageContent";
import TransactionsDataGrid from "components/Transactions/TransactionsDataGrid";
import { useGetTransactionsQuery } from "generated/graphql";

function BankTransactionsPage() {
  const { data } = useGetTransactionsQuery();

  const transactions = data?.transactions || [];

  return (
    <Page appBarTitle={"Transactions"}>
      <PageContent title={"Transactions"}>
        <TransactionsDataGrid transactions={transactions} isExcelExport />
      </PageContent>
    </Page>
  );
}

export default BankTransactionsPage;
