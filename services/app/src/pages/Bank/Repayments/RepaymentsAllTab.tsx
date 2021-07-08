import RepaymentsDataGrid from "components/Repayment/RepaymentsDataGrid";
import { useGetPaymentsSubscription } from "generated/graphql";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

function BankRepaymentsAllTab() {
  const { data } = useGetPaymentsSubscription();

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

export default BankRepaymentsAllTab;
