import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import AchAdvancesDataGrid from "components/Advances/AchAdvancesDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import { useGetAdvancesByMethodAndPaymentDateQuery } from "generated/graphql";
import { todayAsDateStringServer } from "lib/date";
import { AdvanceMethodEnum } from "lib/enum";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankAdvancesExportAchsTab() {
  const [selectedDate, setSelectedDate] = useState(todayAsDateStringServer());

  const { data, error } = useGetAdvancesByMethodAndPaymentDateQuery({
    fetchPolicy: "network-only",
    variables: {
      method: AdvanceMethodEnum.ACH,
      date: selectedDate,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  const payments = data?.payments || [];

  // Add a filter to filter by state.
  return (
    <Container>
      <Box mb={2}>
        <DateInput
          id="payment-date-date-picker"
          label="Payment Date"
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
              Note the default Payment Date is today. Press the export button /
              icon at the top right of the table to export rows (non-header
              rows) in CSV file format.
            </Typography>
          </Alert>
        </Box>
        <AchAdvancesDataGrid payments={payments} />
      </Box>
    </Container>
  );
}
