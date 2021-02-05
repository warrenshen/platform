import Page from "components/Shared/Page";
import TransactionsDataGrid from "components/Shared/Transactions/TransactionsDataGrid";
import { useTransactionsQuery } from "generated/graphql";
import useAppBarTitle from "hooks/useAppBarTitle";
import { useTitle } from "react-use";

function BankTransactionsPage() {
  useTitle("Payments | Bespoke");
  useAppBarTitle("Payments");

  const { data } = useTransactionsQuery();

  const transactions = data?.transactions || [];

  return (
    <Page>
      <TransactionsDataGrid
        transactions={transactions}
        customerSearchQuery={""}
        onClickCustomerName={() => {}}
      ></TransactionsDataGrid>
    </Page>
  );
}

export default BankTransactionsPage;
