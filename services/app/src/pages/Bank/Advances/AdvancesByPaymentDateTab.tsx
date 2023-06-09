import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import AdvancesDataGrid from "components/Advances/AdvancesDataGrid";
import DateInput from "components/Shared/FormInputs/DateInput";
import {
  CustomerForBankFragment,
  useGetAdvancesByPaymentDateQuery,
} from "generated/graphql";
import { previousBizDayAsDateStringServer } from "lib/date";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankAdvancesByDateTab() {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(
    previousBizDayAsDateStringServer()
  );

  const { data, error } = useGetAdvancesByPaymentDateQuery({
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

  const handleClickCustomer = useMemo(
    () => (customerId: CustomerForBankFragment["id"]) =>
      navigate(getBankCompanyRoute(customerId, BankCompanyRouteEnum.Overview)),
    [navigate]
  );

  return (
    <Container>
      <Box mb={2}>
        <DateInput
          id="payment-date-date-picker"
          label="Payment Date"
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
              Note the default Payment Date is the previous business day
              (relative to today).
            </Typography>
          </Alert>
        </Box>
        <AdvancesDataGrid
          isProductTypeVisible
          payments={payments}
          handleClickCustomer={handleClickCustomer}
        />
      </Box>
    </Container>
  );
}
