import Page from "components/Shared/Page";
import TransactionsDataGrid from "components/Transactions/TransactionsDataGrid";
import { useTransactionsQuery } from "generated/graphql";

function BankTransactionsPage() {
  const { data } = useTransactionsQuery();

  const transactions = data?.transactions || [];

  return (
    <Page appBarTitle={"Payments"}>
      <TransactionsDataGrid transactions={transactions} isMiniTable={false} />
    </Page>
  );
}

export default BankTransactionsPage;
