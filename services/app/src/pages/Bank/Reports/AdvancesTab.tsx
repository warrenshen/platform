import AdvancesDataGrid from "components/Advances/AdvancesDataGrid";
import { useGetAdvancesQuery } from "generated/graphql";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
  margin-top: 48px;
`;

function BankAdvancesPage() {
  const { data } = useGetAdvancesQuery();

  const payments = data?.payments || [];

  return (
    <Container>
      <AdvancesDataGrid
        payments={payments}
        customerSearchQuery={""}
        onClickCustomerName={() => {}}
      />
    </Container>
  );
}

export default BankAdvancesPage;
