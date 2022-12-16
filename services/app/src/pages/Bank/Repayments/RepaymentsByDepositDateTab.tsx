import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import TextField from "@mui/material/TextField";
import {
  DateRange,
  DateRangePicker,
} from "@mui/x-date-pickers-pro/DateRangePicker";
import RepaymentsDataGrid from "components/Repayment/RepaymentsDataGrid";
import { Dayjs } from "dayjs";
import { useGetRepaymentsByDepositDateRangeQuery } from "generated/graphql";
import {
  dateAsDateStringServer,
  previousBizDayAsDateStringServer,
} from "lib/date";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankRepaymentsAllTab() {
  const [startDate, setStartDate] = useState<string | null>(
    previousBizDayAsDateStringServer()
  );
  const [endDate, setEndDate] = useState<string | null>(
    previousBizDayAsDateStringServer()
  );

  const { data, error } = useGetRepaymentsByDepositDateRangeQuery({
    fetchPolicy: "network-only",
    variables: {
      start_date: startDate,
      end_date: endDate,
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
        <DateRangePicker
          data-cy="repayments-deposit-date-picker"
          value={[startDate, endDate]}
          onChange={([startDateObject, endDateObject]: DateRange<Dayjs>) => {
            if (!!startDateObject && startDateObject.isValid()) {
              setStartDate(dateAsDateStringServer(startDateObject.toDate()));
            }
            if (!!endDateObject && endDateObject.isValid()) {
              setEndDate(dateAsDateStringServer(endDateObject.toDate()));
            }
          }}
          PopperProps={{ placement: "bottom-start" }}
          renderInput={(startProps, endProps) => (
            <>
              <TextField
                data-cy="repayments-deposit-date-picker-start"
                {...startProps}
              />
              <Box m={2}> to </Box>
              <TextField
                data-cy="repayments-deposit-date-picker-end"
                {...endProps}
              />
            </>
          )}
        />
      </Box>
      <Box display="flex" flexDirection="column">
        <Box mb={2}>
          <Alert severity="info">
            <Typography variant="body1">
              Note the default Deposit Date is the previous business day
              (relative to today).
            </Typography>
          </Alert>
        </Box>
        <RepaymentsDataGrid
          isCompanyVisible
          isAppliedToVisible
          payments={payments}
          handleClickCustomer={() => {}}
        />
      </Box>
    </Container>
  );
}
