import { Box, TextField, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Autocomplete } from "@material-ui/lab";
import AchAdvancesDataGrid from "components/Advances/AchAdvancesDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import { useGetAdvancesByMethodAndPaymentDateQuery } from "generated/graphql";
import {
  DateFormatFileName,
  formatDateString,
  todayAsDateStringServer,
} from "lib/date";
import { AdvanceMethodEnum } from "lib/enum";
import { uniq } from "lodash";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
`;

const NoneValue = "None";

export default function BankAdvancesExportAchsTab() {
  const [selectedDate, setSelectedDate] = useState(todayAsDateStringServer());
  const [selectedState, setSelectedState] = useState(NoneValue);

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

  const selectedStatePayments =
    data?.payments.filter(
      ({ company_bank_account }) =>
        company_bank_account?.us_state === selectedState ||
        (selectedState === NoneValue && !company_bank_account?.us_state)
    ) || [];

  const states = uniq([
    NoneValue,
    ...(data?.payments
      .filter(({ company_bank_account }) => company_bank_account?.us_state)
      .map(
        ({ company_bank_account }) => company_bank_account?.us_state as string
      ) || []),
  ]);

  return (
    <Container>
      <Box display="flex" mb={2}>
        <DateInput
          id="payment-date-date-picker"
          label="Payment Date"
          value={selectedDate}
          onChange={(value) =>
            setSelectedDate(value || todayAsDateStringServer())
          }
        />
        <Box ml={2} width={200}>
          <Autocomplete
            autoHighlight
            blurOnSelect
            value={selectedState}
            options={states}
            getOptionLabel={(option: string) => option}
            renderInput={(params: any) => (
              <TextField {...params} label="State" />
            )}
            onChange={(_, state: string | null) => {
              setSelectedState(state || NoneValue);
            }}
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        <Box mb={2}>
          <Alert severity="info">
            <Typography variant="body1">
              Note the default Payment Date is today. Select a State and press
              the export button / icon at the top right of the table to export
              rows (non-header rows) in CSV file format. If there are any rows
              in the table when no State is selected, this means that a Bespoke
              Financial bank account does not have its State configured.
            </Typography>
          </Alert>
        </Box>
        <AchAdvancesDataGrid
          payments={selectedStatePayments}
          exportFileName={`ACHs ${formatDateString(
            selectedDate,
            DateFormatFileName
          )} ${selectedState === NoneValue ? "" : selectedState}`}
        />
      </Box>
    </Container>
  );
}
