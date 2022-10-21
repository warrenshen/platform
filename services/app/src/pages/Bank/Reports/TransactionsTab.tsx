import { Box } from "@material-ui/core";
import TextField from "@mui/material/TextField";
import {
  DateRange,
  DateRangePicker,
} from "@mui/x-date-pickers-pro/DateRangePicker";
import TransactionsDataGrid from "components/Transactions/TransactionsDataGrid";
import { Dayjs } from "dayjs";
import { useGetTransactionsForDateRangeQuery } from "generated/graphql";
import {
  dateAsDateStringServer,
  todayAsDateStringServer,
  todayMinusXMonthsDateStringServer,
} from "lib/date";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
  margin-top: 48px;
`;

function BankTransactionsPage() {
  const [startDate, setStartDate] = useState(
    todayMinusXMonthsDateStringServer(3)
  );
  const [endDate, setEndDate] = useState(todayAsDateStringServer());
  const { data } = useGetTransactionsForDateRangeQuery({
    variables: {
      from: startDate,
      to: endDate,
    },
  });
  const transactions = data?.transactions || [];

  return (
    <Container>
      <DateRangePicker
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
            <TextField {...startProps} />
            <Box m={2}> to </Box>
            <TextField {...endProps} />
          </>
        )}
      />
      <Box m={2} />
      <TransactionsDataGrid isExcelExport transactions={transactions} />
    </Container>
  );
}

export default BankTransactionsPage;
