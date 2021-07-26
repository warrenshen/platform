import AdvancesDataGrid from "components/Advances/AdvancesDataGrid";
import { useGetAdvancesSubscription } from "generated/graphql";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankRepaymentsAllTab() {
  const { data } = useGetAdvancesSubscription();

  const payments = data?.payments || [];

  return (
    <Container>
      <AdvancesDataGrid payments={payments} handleClickCustomer={() => {}} />
    </Container>
  );
}
