import { Box } from "@material-ui/core";
import WireAdvancesDataGrid from "components/Advances/WireAdvancesDataGrid";
import { useGetWireAdvancesByDateQuery } from "generated/graphql";
import { todayAsDateStringServer } from "lib/date";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankLoansAllTab() {
  const history = useHistory();

  const { data, error } = useGetWireAdvancesByDateQuery({
    fetchPolicy: "network-only",
    variables: {
      date: todayAsDateStringServer(),
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const payments = data?.payments || [];
  console.log({ payments });

  return (
    <Container>
      <Box display="flex" flexDirection="column">
        <WireAdvancesDataGrid
          payments={payments}
          handleClickCustomer={(customerId) =>
            history.push(`/customers/${customerId}/loans`)
          }
        />
      </Box>
    </Container>
  );
}
