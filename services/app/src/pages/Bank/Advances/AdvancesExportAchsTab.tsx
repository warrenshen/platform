import { Box, TextField, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import AchAdvancesDataGrid from "components/Advances/AchAdvancesDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import { Autocomplete } from "@material-ui/lab";
import { useGetAdvancesByMethodAndPaymentDateQuery } from "generated/graphql";
import {
  todayAsDateStringServer,
  DateFormatFileName,
  formatDateString,
} from "lib/date";
import { useState } from "react";
import styled from "styled-components";
import { uniq } from "lodash";
import { AchAdvancesExportUSStateEnum, AdvanceMethodEnum } from "lib/enum";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankAdvancesExportAchsTab() {
  const [selectedDate, setSelectedDate] = useState(todayAsDateStringServer());
  const [
    selectedState,
    setSelectedState,
  ] = useState<AchAdvancesExportUSStateEnum>(AchAdvancesExportUSStateEnum.None);

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

  const payments =
    data?.payments.filter(
      ({ company_bank_account }) =>
        company_bank_account?.us_state === selectedState ||
        (selectedState === AchAdvancesExportUSStateEnum.None &&
          !company_bank_account?.us_state)
    ) || [];

  const states = uniq(
    data?.payments.map(
      ({ company_bank_account }) =>
        (company_bank_account?.us_state ||
          AchAdvancesExportUSStateEnum.None) as AchAdvancesExportUSStateEnum
    )
  );

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
            onChange={(_, state: AchAdvancesExportUSStateEnum | null) => {
              setSelectedState(state || AchAdvancesExportUSStateEnum.None);
            }}
          />
        </Box>
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
        <AchAdvancesDataGrid
          payments={payments}
          exportFileName={`ACHs ${formatDateString(
            selectedDate,
            DateFormatFileName
          )} ${
            selectedState === AchAdvancesExportUSStateEnum.None
              ? ""
              : selectedState
          }`}
        />
      </Box>
    </Container>
  );
}
