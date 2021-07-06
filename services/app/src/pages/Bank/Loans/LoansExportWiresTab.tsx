import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import WireAdvancesDataGrid from "components/Advances/WireAdvancesDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import { useGetWireAdvancesByDateQuery } from "generated/graphql";
import { todayAsDateStringServer } from "lib/date";
import { useState } from "react";
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

  const [selectedDate, setSelectedDate] = useState(todayAsDateStringServer());

  const { data, error } = useGetWireAdvancesByDateQuery({
    fetchPolicy: "network-only",
    variables: {
      date: selectedDate,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const payments = data?.payments || [];

  return (
    <Container>
      <Box mb={2}>
        <DateInput
          id="export-date-date-picker"
          label="Export Date"
          disableFuture
          value={selectedDate}
          onChange={(value) =>
            setSelectedDate(value || todayAsDateStringServer())
          }
        />
      </Box>
      <Box display="flex" flexDirection="column">
        <Box mb={2}>
          <Alert severity="info">
            <Typography variant="body1">
              Press the export button / icon at the top right of the table to
              export rows (non-header rows) in CSV file format.
            </Typography>
          </Alert>
        </Box>
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
