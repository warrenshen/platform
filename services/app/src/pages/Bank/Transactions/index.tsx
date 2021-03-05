import Page from "components/Shared/Page";
import TransactionsDataGrid from "components/Transactions/TransactionsDataGrid";
import { useGetTransactionsQuery } from "generated/graphql";

function BankTransactionsPage() {
  const { data } = useGetTransactionsQuery();

  const transactions = data?.transactions || [];

  return (
    <Page appBarTitle={"Transactions"}>
      <TransactionsDataGrid transactions={transactions} isMiniTable={false} />
    </Page>
  );
}

export default BankTransactionsPage;
