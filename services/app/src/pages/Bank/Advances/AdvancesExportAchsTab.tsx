import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import AchAdvancesDataGrid from "components/Advances/AchAdvancesDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import { useGetAdvancesByDateAndMethodQuery } from "generated/graphql";
import { todayAsDateStringServer } from "lib/date";
import { PaymentMethodEnum } from "lib/enum";
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

  const { data, error } = useGetAdvancesByDateAndMethodQuery({
    fetchPolicy: "network-only",
    variables: {
      date: selectedDate,
      method: PaymentMethodEnum.ACH,
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
        <AchAdvancesDataGrid payments={payments} />
      </Box>
    </Container>
  );
}
