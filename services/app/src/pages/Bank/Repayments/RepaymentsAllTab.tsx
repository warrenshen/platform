import RepaymentsDataGrid from "components/Repayment/RepaymentsDataGrid";
import { useGetRepaymentsSubscription } from "generated/graphql";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankRepaymentsAllTab() {
  const { data } = useGetRepaymentsSubscription();

  const payments = data?.payments || [];

  return (
    <Container>
      <RepaymentsDataGrid
        isCompanyVisible
        payments={payments}
        handleClickCustomer={() => {}}
      />
    </Container>
  );
}
