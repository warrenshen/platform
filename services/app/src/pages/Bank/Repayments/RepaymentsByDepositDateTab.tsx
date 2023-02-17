import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import TextField from "@mui/material/TextField";
import {
  DateRange,
  DateRangePicker,
} from "@mui/x-date-pickers-pro/DateRangePicker";
import BankRepaymentsDataGrid from "components/Repayment/BankRepaymentsDataGrid";
import { Dayjs } from "dayjs";
import { useGetRepaymentsByDepositDateRangeQuery } from "generated/graphql";
import {
  dateAsDateStringServer,
  formatDatetimeString,
  parseDateStringServer,
  previousBizDayAsDateStringServer,
} from "lib/date";
import { BankCompanyRouteEnum, getBankCompanyRoute } from "lib/routes";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;

  flex: 1;

  width: 100%;
`;

export default function BankRepaymentsByDepositDateTab() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<string | null>(
    previousBizDayAsDateStringServer()
  );
  const [startDatetime, setStartDatetime] = useState<string | null>(
    formatDatetimeString(previousBizDayAsDateStringServer())
  );
  const [endDate, setEndDate] = useState<string | null>(
    previousBizDayAsDateStringServer()
  );
  const [endDatetime, setEndDatetime] = useState<string | null>(
    formatDatetimeString(previousBizDayAsDateStringServer())
  );

  const { data, error } = useGetRepaymentsByDepositDateRangeQuery({
    fetchPolicy: "network-only",
    variables: {
      start_date: startDate,
      end_date: endDate,
      start_datetime: startDatetime,
      end_datetime: endDatetime,
    },
  });

  if (error) {
    console.error({ error });
    alert(`Error in query (details in console): ${error.message}`);
  }

  /*
    The finance team would like to see a reversed repayment on a separate
    line. This is so that when they export to excel, they have both positive
    and negative numbers to cancel each other out.

    One example of how this could occur: we set up a reverse draft, but the
    customer has insufficient funds in their bank account and the reverse
    draft bounces. We would want the platform to have a record that reflects
    this reality in our bank account.
  */
  const reversedPayments = (data?.payments || [])
    .filter((payment) => {
      const reversedAtDatetime = !!payment?.reversed_at
        ? parseDateStringServer(payment.reversed_at, true)
        : null;

      if (
        !!startDatetime &&
        !!reversedAtDatetime &&
        reversedAtDatetime < new Date(startDatetime)
      ) {
        return false;
      }
      if (
        !!endDatetime &&
        !!reversedAtDatetime &&
        reversedAtDatetime > new Date(endDatetime)
      ) {
        return false;
      }

      return !!payment?.reversed_at;
    })
    .map((payment) => {
      return {
        ...payment,
        requested_amount: !!payment?.requested_amount
          ? -1 * payment.requested_amount
          : 0,
        transactions: payment.transactions.map((transaction) => {
          return {
            ...transaction,
            to_fees: !!transaction?.to_fees ? -1 * transaction.to_fees : 0,
            to_interest: !!transaction?.to_interest
              ? -1 * transaction.to_interest
              : 0,
            to_principal: !!transaction?.to_principal
              ? -1 * transaction.to_principal
              : 0,
          };
        }),
      };
    });

  const repayments = (data?.payments || []).filter((payment) => {
    const depositDate = !!payment?.deposit_date
      ? parseDateStringServer(payment.deposit_date)
      : null;

    if (
      !!startDatetime &&
      !!depositDate &&
      depositDate < new Date(startDatetime)
    ) {
      return false;
    }
    if (!!endDatetime && !!depositDate && depositDate > new Date(endDatetime)) {
      return false;
    }

    return true;
  });

  const payments = [...reversedPayments, ...repayments];

  return (
    <Container>
      <Box mb={2}>
        <DateRangePicker
          data-cy="repayments-deposit-date-picker"
          value={[startDate, endDate]}
          onChange={([startDateObject, endDateObject]: DateRange<Dayjs>) => {
            if (!!startDateObject && startDateObject.isValid()) {
              setStartDate(dateAsDateStringServer(startDateObject.toDate()));
              setStartDatetime(
                formatDatetimeString(
                  dateAsDateStringServer(startDateObject.toDate())
                )
              );
            }
            if (!!endDateObject && endDateObject.isValid()) {
              setEndDate(dateAsDateStringServer(endDateObject.toDate()));

              // Since we're working with date times, we have to set it to the next day at
              // 0:00 (UTC) to ensure we capture all possible date times of the target date
              const inclusiveEndDatetime = new Date(endDateObject.toDate());
              inclusiveEndDatetime.setDate(inclusiveEndDatetime.getDate() + 1);
              inclusiveEndDatetime.setHours(0, 0, 0);
              setEndDatetime(
                formatDatetimeString(inclusiveEndDatetime.toISOString())
              );
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
        <BankRepaymentsDataGrid
          isCompanyVisible
          isAppliedToVisible
          isReversedDateShown
          payments={payments}
          handleClickCustomer={(customerId) => {
            navigate(
              getBankCompanyRoute(customerId, BankCompanyRouteEnum.Overview)
            );
          }}
        />
      </Box>
    </Container>
  );
}
