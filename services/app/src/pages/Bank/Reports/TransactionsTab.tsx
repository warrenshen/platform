import TransactionsDataGrid from "components/Transactions/TransactionsDataGrid";
import { useGetTransactionsQuery } from "generated/graphql";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
  margin-top: 48px;
`;

function BankTransactionsPage() {
  const { data } = useGetTransactionsQuery();

  const transactions = data?.transactions || [];

  return (
    <Container>
      <TransactionsDataGrid isExcelExport transactions={transactions} />
    </Container>
  );
}

export default BankTransactionsPage;
