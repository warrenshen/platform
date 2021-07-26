import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import RepaymentsDataGrid from "components/Repayment/RepaymentsDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import { useGetRepaymentsByDepositDateQuery } from "generated/graphql";
import { previousBizDayAsDateStringServer } from "lib/date";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankRepaymentsAllTab() {
  const [selectedDate, setSelectedDate] = useState(
    previousBizDayAsDateStringServer()
  );

  const { data, error } = useGetRepaymentsByDepositDateQuery({
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
          id="deposite-date-date-picker"
          label="Deposit Date"
          disableFuture
          value={selectedDate}
          onChange={(value) =>
            setSelectedDate(value || previousBizDayAsDateStringServer())
          }
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
          payments={payments}
          handleClickCustomer={() => {}}
        />
      </Box>
    </Container>
  );
}
